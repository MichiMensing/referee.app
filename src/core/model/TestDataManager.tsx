/* eslint-disable no-underscore-dangle */
import { IDBPDatabase, openDB } from "idb";
import {
  IAnswer, IQuestion, ITestData, RefereeDB,
} from "./index";
import Question from "./Question";
import Quiz from "./Quiz";
import QuizRun from "./QuizRun";

export default class TestDataManager {
  private db: IDBPDatabase<RefereeDB> | null = null;

  private _data: { [id: string]: Question } = {};

  private loadedLanguages: string[] = [];

  private todo: string[] = [];

  private initialized = false;

  private initializing = false;

  private currentId = "";

  private _asked = 0;

  private _correct = 0;

  private _wrong = 0;

  private _answerData: IAnswer[] = [];

  private _quizzes: Quiz[] = [];

  private _quiz: Quiz | undefined;

  constructor(answerData: IAnswer[]) {
    this._answerData = answerData;
  }

  public async initialize(language: string) {
    if (this.initializing) {
      return;
    }
    if (this.initialized) {
      await this.switchLanguage(language);
      return this._data[this.currentId];
    }
    this.initializing = true;

    const mappedAnswers = this._answerData.reduce<{ [id: string]: IAnswer }>((prev, curr) => ({
      ...prev,
      [curr.id]: curr,
    }), {});

    const questions = await TestDataManager.loadQuestions(language);

    this.loadedLanguages = [language];

    const mappedQuestions = questions.reduce<{ [id: string]: IQuestion }>((prev, curr) => ({
      ...prev,
      [curr.id]: curr,
    }), {});

    const mappedTestData: { [id: string]: ITestData } = {};

    let db;

    // idb library does not support IE
    const ua = window.navigator.userAgent;
    const isIE = /MSIE|Trident/.test(ua);
    if (!isIE) {
      db = await openDB<RefereeDB>("referee", 3, {
        async upgrade(currentDB, oldVersion) {
          if (oldVersion < 1) {
            currentDB.createObjectStore("questions");
          }
          if (oldVersion < 2) {
            currentDB.createObjectStore("quizzes");
          }
          if (oldVersion < 3) {
            currentDB.createObjectStore("quizRuns");
          }
        },
      });
    }

    const ids = Object.keys(mappedAnswers);
    this.todo = [...ids];

    if (db) {
      await this.loadQuestionsFromDatabase(db, mappedTestData);
      await this.loadQuizzesFromDatabase(db);
      this.db = db;
    }

    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      this._data[id] = new Question(
        language,
        mappedQuestions[id],
        mappedAnswers[id],
        mappedTestData[id],
      );
    }

    this.initializing = false;
    this.initialized = true;

    return this.next();
  }

  get wrong(): number {
    return this._wrong;
  }

  get correct(): number {
    return this._correct;
  }

  get asked(): number {
    return this._asked;
  }

  get data(): { [p: string]: Question } {
    return this._data;
  }

  get quizzes(): Quiz[] {
    return this._quizzes;
  }

  get quiz(): Quiz | undefined {
    return this._quiz;
  }

  public async checkAnswer(answers: string[]) {
    if (!this.currentId) {
      return {
        correct: [],
        rules: [],
      };
    }

    // persist test data

    const question = this._data[this.currentId];

    const result = question.checkAnswer(answers);

    this._asked += 1;
    if (result.answeredCorrect) {
      this._correct += 1;
    } else {
      this._wrong += 1;
    }

    if (this.db) {
      await question.persist(this.db);
    }

    if (this.quiz) {
      const currentRun = this.quiz.getLatestRun();
      currentRun?.recordAnswer(this.currentId, answers, result.answeredCorrect);
      if (currentRun && this.quiz.isUnlimited()) {
        currentRun.updateTotal(currentRun.total + 1);
      }

      if (this.db) {
        await this.quiz.persist(this.db);
      }
    }

    if (question.box > 1 || this.quiz) {
      const index = this.todo.findIndex((val) => val === question.id);
      this.todo.splice(index, 1);
    }

    return result;
  }

  public next(): Question | undefined {
    if (this._quiz) {
      const stats = this._quiz.getQuizStatistics();
      const answeredQuestions = this._quiz.getLatestRun()?.answers;
      let endlessQuestions = this._quiz.questions.length === 0;
      let reachedMaxQuestions = answeredQuestions && stats.amountOfQuestions > 0 && Object.keys(answeredQuestions).length >= stats.amountOfQuestions;
      if (reachedMaxQuestions || (endlessQuestions && this.todo.length === 0)) {
        this.stopQuiz();
        return undefined;
      }
    }
    this.currentId = this.todo[Math.floor(Math.random() * this.todo.length)];
    return this._data[this.currentId];
  }

  public async resetStats() {
    this._asked = 0;
    this._correct = 0;
    this._wrong = 0;
    if (this.db) {
      await Promise.all(Object.keys(this._data).map(async (id) => {
        const question = this._data[id];
        await question.reset(this.db!);
      }));
    }
  }

  public async resetQuizzes() {
    this._quiz = undefined;
    const quizzesToDelete = this._quizzes;
    this._quizzes = [this.getDefaultQuiz()];
    if (this.db) {
      await Promise.all(quizzesToDelete.map(async (quiz) => {
        await quiz.delete(this.db!);
      }));
    }
  }

  public async addQuiz(quiz: Quiz) {
    this._quizzes.push(quiz);
    if (this.db) {
      await quiz.persist(this.db);
    }
  }

  public async saveQuiz(quiz: Quiz) {
    if (this.db) {
      await quiz.persist(this.db);
    }
  }

  public async startQuiz(quiz: Quiz) {
    this._quiz = quiz;
    let quizQuestions = [...quiz.questions];
    if (quizQuestions.length === 0) {
      quizQuestions = [...Object.keys(this._data)];
    }
    quiz.start();
    if (this.db) {
      await quiz.persist(this.db);
    }

    this.todo = quizQuestions;
  }

  public async stopQuiz() {
    this._quiz = undefined;
    this.todo = [...Object.keys(this._data)];
  }

  public async deleteQuiz(quiz: Quiz) {
    if (this._quiz?.id === quiz.id) {
      await this.stopQuiz();
    }

    const index = this._quizzes.findIndex((q) => q.id === quiz.id);
    this._quizzes.splice(index, 1);
    if (this.db) {
      await quiz.delete(this.db!);
    }
  }

  private async loadQuestionsFromDatabase(
    db: IDBPDatabase<RefereeDB>,
    mappedTestData: { [id: string]: ITestData },
  ): Promise<void> {
    const tx = db.transaction("questions", "readwrite");

    const currentDate = new Date();

    let cursor = await tx.store.openCursor();

    while (cursor) {
      mappedTestData[cursor.key] = cursor.value;

      const testData = cursor.value;

      this._asked += testData.asked;
      this._correct += testData.correct;
      this._wrong += testData.wrong;

      if (testData.lastAsked) {
        let remove = false;
        const diffTime = Math.abs(+testData.lastAsked - +currentDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // remove if needed
        if (
          (testData.box === 2 && diffDays < 1)
          || (testData.box === 3 && diffDays < 3)
          || (testData.box === 4 && diffDays < 7)
          || (testData.box === 5 && diffDays < 30)
        ) {
          remove = true;
        }

        if (remove) {
          // eslint-disable-next-line no-loop-func
          const index = this.todo.findIndex((val) => val === cursor?.key);
          if (index > -1) {
            this.todo.splice(index, 1);
          }
        }
      }

      // eslint-disable-next-line no-await-in-loop
      cursor = await cursor.continue();
    }

    await tx.done;
  }

  private async loadQuizzesFromDatabase(db: IDBPDatabase<RefereeDB>): Promise<void> {
    const tx = db.transaction("quizzes", "readwrite");

    let cursor = await tx.store.openCursor();

    const quizzes = [];
    while (cursor) {
      const quizData = cursor.value;

      const quiz = new Quiz(quizData.name, quizData.settings, quizData.questions, cursor.key);
      quizzes.push(quiz);

      // eslint-disable-next-line no-await-in-loop
      cursor = await cursor.continue();
    }

    this._quizzes = quizzes;
    await tx.done;

    let defaultQuiz = quizzes.find((q) => q.isDefault());
    if (!defaultQuiz) {
      defaultQuiz = this.getDefaultQuiz();

      this._quizzes.push(defaultQuiz);

      defaultQuiz.persist(db);
    }

    await this.loadQuizRunsFromDatabase(db);
  }

  private async loadQuizRunsFromDatabase(db: IDBPDatabase<RefereeDB>): Promise<void> {
    if (this._quizzes.length === 0) return;

    const tx = db.transaction("quizRuns", "readwrite");

    let cursor = await tx.store.openCursor();

    const runMap: Map<string, QuizRun[]> = new Map();
    while (cursor) {
      const quizRunData = cursor.value;

      const runs: QuizRun[] = runMap.get(quizRunData.quizId) || [];
      runs.push(
        new QuizRun(
          quizRunData.quizId,
          quizRunData.total,
          quizRunData.timestamp,
          quizRunData.correct,
          quizRunData.answers,
          cursor.key,
        ),
      );
      runMap.set(quizRunData.quizId, runs);

      // eslint-disable-next-line no-await-in-loop
      cursor = await cursor.continue();
    }

    this._quizzes.forEach((quiz) => {
      quiz.setRuns(runMap.get(quiz.id) || []);
    });

    await tx.done;
  }

  private async switchLanguage(language: string) {
    if (this.loadedLanguages.includes(language)) {
      return;
    }

    const questions = await TestDataManager.loadQuestions(language);
    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      this._data[question.id].updateData(language, question);
    }

    this.loadedLanguages = [...this.loadedLanguages, language];
  }

  private static async loadQuestions(language: string): Promise<IQuestion[]> {
    const response = await fetch(`./data/questions/${language}.json`);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json);
    }

    return json;
  }

  private getDefaultQuiz(): Quiz {
    return new Quiz(
      "IHF Standard Quiz",
      { timeLimit: 60, maxQuestions: 30, instantFeedback: false },
      undefined, "IHF_DEFAULT");
  }
}
