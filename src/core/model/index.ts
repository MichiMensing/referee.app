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
  maxQuestions: number;
  timeLimit: number;
  instantFeedback: boolean;
}

export interface IRunData {
  quizId: string;
  correct: string[];
  total: number;
  timestamp: Date;
  answers?: { [questionId: string]: string[] };
}

export interface IQuizData {
  name: string;
  questions?: string[];
  runs?: IRunData[];
  settings?: IQuizSettings;
}

export interface IQuizStats {
  amountOfQuestions: number;
  asked: number;
  correct: number;
  total: number;
  classification: string;
  percentage: string;
  progress: string;
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
  };
  quizRuns: {
    key: string;
    value: IRunData;
    indexes: {
      pick: [number, Date];
    }
  }
}

export interface ITimeObject {
  h: number;
  m: number;
  s: number;
}
