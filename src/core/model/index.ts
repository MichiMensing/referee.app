import { DBSchema } from "idb";

export interface IQuestion {
  id: string;
  question: string;
  answers: { [key: string]: string };
}

export interface IAnswer {
  id: string;
  correct: string[];
  rule: string[];
}

export interface ITestData {
  box: number;
  lastAsked: Date | null;
  previousResults: boolean[];
  asked: number;
  correct: number;
  wrong: number;
}

export interface ITestResponse {
  correct: string[];
  rules: string[];
  answeredCorrect?: boolean;
}

export interface IQuizSettings {
  maxQuestions: number | null;
  timelimit: number | null;
  instantFeedback: boolean;
}

export interface IRunData {
  correct: number;
  total: number;
  timestamp: Date;
}

export interface IQuizData {
  name: string;
  questions?: string[];
  runs?: IRunData[];
  settings?: IQuizSettings;
}

export interface RefereeDB extends DBSchema {
  questions: {
    key: string;
    value: ITestData;
    indexes: {
      pick: [number, Date];
    };
  };
  quizzes: {
    key: string;
    value: IQuizData;
    indexes: {
      pick: [number, Date];
    };
  }
}
