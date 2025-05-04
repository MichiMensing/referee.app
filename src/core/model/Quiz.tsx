/* eslint-disable no-underscore-dangle */
import { IDBPDatabase } from "idb";
import { v4 as uuidv4 } from "uuid";
import { t } from "i18next";
import {
  IQuizSettings, IQuizStats, ITimeObject, RefereeDB,
} from "./index";
import QuizRun from "./QuizRun";

export default class Quiz {
  private _id: string;

  private _name: string;

  private _questions: string[] = [];

  private _runs: QuizRun[] = [];

  private _settings: IQuizSettings;

  constructor(name: string, settings?: IQuizSettings, questions?: string[], id?: string) {
    this._id = id || uuidv4();
    this._name = name;
    this._settings = settings || this.getDefaultSettings();
    this._questions = questions || [];
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get questions(): string[] {
    return this._questions;
  }

  get settings(): IQuizSettings {
    return this._settings;
  }

  get instantFeedback(): boolean {
    return !!this._settings?.instantFeedback;
  }

  get maxQuestions(): number {
    return this._settings?.maxQuestions || 0;
  }

  get timeLimit(): number {
    return this._settings.timeLimit || 0;
  }

  get runs(): QuizRun[] {
    return this._runs;
  }

  public setInstantFeedback(checked: boolean) {
    this._settings.instantFeedback = checked;
  }

  public setMaxQuestions(limit: number) {
    this._settings.maxQuestions = limit;
  }

  public setTimeLimit(timeLimit: number) {
    this._settings.timeLimit = timeLimit;
  }

  public setName(name: string) {
    this._name = name;
  }

  public setQuestions(questions: string[]) {
    this._questions = questions;
  }

  public setRuns(runs: QuizRun[]) {
    this._runs = runs;
  }

  public addRun(run: QuizRun) {
    this._runs.push(run);
  }

  public getLatestRun(): QuizRun | undefined {
    if (this._runs.length === 0) return undefined;
    return this._runs.reduce((max, current) => (current.timestamp > max.timestamp ? current : max));
  }

  public getQuizStatistics(): IQuizStats {
    const amountQuestions = this.settings.maxQuestions > 0 && this.questions.length > 0
      ? Math.min(this.settings.maxQuestions, this.questions.length)
      : Math.max(this.settings.maxQuestions, this.questions.length);

    let correct = 0;
    let total = 0;
    let successRate = "0.0";
    let asked = 0;

    let classification = "empty";
    const latestRun = this.getLatestRun();

    if (latestRun) {
      correct = latestRun.correct.length;
      total = latestRun.total;
      const percentage = (correct / latestRun.total) * 100;
      successRate = latestRun.total !== 0 ? (percentage).toFixed(1) : "0.0";

      if (latestRun.total === 0) {
        classification = "empty";
      } else if (percentage >= 80) {
        classification = "good";
      } else if (percentage >= 50) {
        classification = "ok";
      } else {
        classification = "bad";
      }
      asked = latestRun.asked;
    }

    const progress = amountQuestions !== 0 ? ((asked / amountQuestions) * 100).toFixed(1) : "0.0";

    return {
      amountOfQuestions: amountQuestions,
      asked,
      correct,
      total,
      classification,
      percentage: successRate,
      progress,
    };
  }

  public getQuestionSummary(): string {
    const rules = this._questions.reduce((result: Map<string, number>, questionId: string) => {
      const matchRule = questionId.match(/^([0-9]+)\.([0-9]+)/) || [];
      const numberOfQuestions = result.get(matchRule[1]) || 0;
      result.set(matchRule[1], numberOfQuestions + 1);
      return result;
    }, new Map<string, number>());
    return rules.size > 0 ? Array.from(rules, ([rule, amount]) => `${t(`rules.rule.rule${rule}`)} (${amount})`).join(", ") : t("quizzes.settings.all");
  }

  public async persist(db: IDBPDatabase<RefereeDB>) {
    await db.put("quizzes", {
      name: this._name,
      questions: this._questions,
      runs: this._runs,
      settings: this._settings,
    }, this._id);

    await Promise.all(this._runs.map((run) => run.persist(db)));
  }

  public getTimeRemaining() {
    const run = this.getLatestRun();
    if (!run) return undefined;

    const endTime = new Date(run.timestamp.getTime() + (this._settings.timeLimit * 60000));
    const diffSeconds = (endTime.getTime() - new Date().getTime()) / 1000;
    return this.secondsToTime(diffSeconds);
  }

  public async delete(db: IDBPDatabase<RefereeDB>) {
    await Promise.all(this._runs.map((run) => run.delete(db)));
    await db.delete("quizzes", this._id);
  }

  public start() {
    const stats = this.getQuizStatistics();
    this._runs.push(new QuizRun(this._id, stats.amountOfQuestions));
  }

  public isUnlimited() {
    return this._questions.length === 0 && this._settings.maxQuestions === 0;
  }

  public isDefault() {
    return this._id === "IHF_DEFAULT";
  }

  private secondsToTime(secs: number): ITimeObject {
    const hours = Math.floor(secs / (60 * 60));

    const divisor_for_minutes = secs % (60 * 60);
    const minutes = Math.floor(divisor_for_minutes / 60);

    const divisor_for_seconds = divisor_for_minutes % 60;
    const seconds = Math.ceil(divisor_for_seconds);

    const obj = {
      h: hours,
      m: minutes,
      s: seconds,
    };
    return obj;
  }

  private getDefaultSettings(): IQuizSettings {
    return {
      maxQuestions: 0,
      instantFeedback: true,
      timeLimit: 0,
    };
  }
}
