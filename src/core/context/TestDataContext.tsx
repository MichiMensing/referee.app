import React from "react";
import invariant from "ts-invariant";
import Question from "../model/Question";
import { ITestResponse } from "../model";
import Quiz from "../model/Quiz";

export interface TestDataContextValue {
  checkAnswers?: (options: string[]) => Promise<ITestResponse>;
  nextQuestion?: () => void;
  addQuiz?: (quiz: Quiz) => Promise<void>;
  saveQuiz?: (quiz: Quiz) => Promise<void>;
  startQuiz?: (quiz: Quiz) => Promise<void>;
  deleteQuiz?: (quiz: Quiz) => Promise<void>;
  stopQuiz?: () => Promise<void>;
  resetQuizzes?: () => Promise<void>;
  question?: Question;
  asked: number;
  correct: number;
  checked: string[];
  data: { [id: string]: Question };
  reveal: boolean;
  resetStats: () => Promise<void>;
  quizzes: Quiz[];
  quiz?: Quiz;
}

let TestDataContext: React.Context<TestDataContextValue>;

export function getTestDataContext() {
  if (!TestDataContext) {
    TestDataContext = React.createContext<TestDataContextValue>({
      asked: 0,
      correct: 0,
      data: {},
      checked: [],
      reveal: false,
      resetStats: async () => { },
      quizzes: [],
    });
  }
  return TestDataContext;
}

export function useRulesTestData(): TestDataContextValue {
  const ctx = React.useContext(getTestDataContext());
  invariant(
    ctx.checkAnswers,
    "Can't initialize test data. Please ensure that you have called `TestDataProvider` higher up in your tree.",
  );
  return ctx!;
}
