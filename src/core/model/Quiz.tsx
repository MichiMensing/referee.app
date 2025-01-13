/* eslint-disable no-underscore-dangle */
import { IDBPDatabase } from "idb";
import { v4 as uuidv4 } from "uuid";
import {
  IQuizSettings, IRunData, RefereeDB,
} from "./index";
import { t } from "i18next";

export default class Quiz {
  private _id: string;

  private _name: string;

  private _questions: string[] = [];

  private _runs: IRunData[] = [];

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

  public getQuestionSummary(): string {
    const rules = this._questions.reduce((result: Map<string, number>, questionId: string) => {
      const matchRule = questionId.match(/^([0-9]+)\.([0-9]+)/) || [];
      var numberOfQuestions = result.get(matchRule[1]) || 0;
      result.set(matchRule[1], ++numberOfQuestions);
      return result;
    }, new Map<string, number>);
    return rules.size > 0 ? Array.from(rules,([rule, amount]) => `${t(`rules.rule.rule${rule}`)} (${amount})`).join(", ") : t("quizzes.settings.all");
  }

  public async persist(db: IDBPDatabase<RefereeDB>) {
    await db.put("quizzes", {
      name: this._name,
      questions: this._questions,
      runs: this._runs,
      settings: this._settings,
    }, this._id);
  }

  public async reset(db: IDBPDatabase<RefereeDB>) {
    this._runs = [];
    await this.persist(db);
  }

  private getDefaultSettings(): IQuizSettings{
    return {
      "maxQuestions": 0,
      "instantFeedback": true,
      "timeLimit": 0,
    };
  }
}
