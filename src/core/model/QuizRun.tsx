/* eslint-disable no-underscore-dangle */
import { IDBPDatabase } from "idb";
import { v4 as uuidv4 } from "uuid";
import { RefereeDB } from "./index";

export default class QuizRun {
  private _id: string;

  private _quizId: string;

  private _correct: string[] = [];

  private _total: number = 0;

  private _timestamp: Date;

  private _answers: { [questionId: string]: string[] } | undefined;

  constructor(
    quizId: string,
    total: number,
    timestamp?: Date,
    correct?: string[],
    answers?: { [questionId: string]: string[] },
    id?: string,
  ) {
    this._id = id || uuidv4();
    this._quizId = quizId;
    this._total = total;
    this._timestamp = timestamp || new Date();
    this._correct = correct || this._correct;
    this._answers = answers;
  }

  get id(): string {
    return this._id;
  }

  get quizId(): string {
    return this._quizId;
  }

  get correct(): string[] {
    return this._correct;
  }

  get answers(): { [questionId: string]: string[] } | undefined {
    return this._answers;
  }

  get total(): number {
    return this._total;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  get asked(): number {
    return !this._answers ? 0 : Object.keys(this._answers).length;
  }

  public recordAnswer(questionId: string, answers: string[]) {
    if (!this._answers) {
      this._answers = {};
    }
    this._answers[questionId] = answers;
  }

  public getFormattedTimestamp(): string {
    return `${this._timestamp.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })} - ${this._timestamp.toLocaleTimeString(undefined, { hour12: false })}`;
  }

  public async persist(db: IDBPDatabase<RefereeDB>) {
    await db.put("quizRuns", {
      quizId: this._quizId,
      correct: this._correct,
      total: this._total,
      timestamp: this._timestamp,
      answers: this._answers,
    }, this._id);
  }

  public async delete(db: IDBPDatabase<RefereeDB>) {
    await db.delete("quizRuns", this._id);
  }
}
