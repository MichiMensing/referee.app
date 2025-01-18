/* eslint-disable no-param-reassign */
import React, {
  FunctionComponent, ReactNode, useCallback, useEffect, useRef, useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Routes } from "react-router-dom";
import { getTestDataContext } from "./TestDataContext";
import Loading from "../components/Loading";
import TestDataManager from "../model/TestDataManager";
import Question from "../model/Question";
import { IAnswer } from "../model";
import Quiz from "../model/Quiz";

interface TestDataProviderProps {
  children: ReactNode;
  answerData: IAnswer[];
}

const TestDataProvider: FunctionComponent<TestDataProviderProps> = ({ children, answerData }) => {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<Question | undefined>();
  const [asked, setAsked] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [checked, setChecked] = useState<string[]>([]);
  const [reveal, setReveal] = useState(false);
  const manager = useRef<TestDataManager>(new TestDataManager(answerData));
  const { i18n: { language } } = useTranslation();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quiz, setQuiz] = useState<Quiz | undefined>();

  // Load questions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        setQuestion(await manager.current.initialize(language));
        setAsked(manager.current.asked);
        setCorrect(manager.current.correct);
        setQuizzes(manager.current.quizzes);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [language]);

  const nextQuestion = () => {
    setQuestion(manager.current.next());
    setReveal(false);
    setChecked([]);
  };

  const checkAnswers = async (options: string[]) => {
    const result = manager.current.checkAnswer(options);

    setAsked(manager.current.asked);
    setCorrect(manager.current.correct);
    setChecked(options);
    setReveal(true);

    return result;
  };

  const addQuiz = async (quizParam: Quiz) => {
    await manager.current.addQuiz(quizParam);
    setQuizzes(manager.current.quizzes);
  };

  const saveQuiz = async (quizParam: Quiz) => {
    await manager.current.saveQuiz(quizParam);
    setQuizzes(manager.current.quizzes);
  };

  const startQuiz = async (quizParam: Quiz) => {
    await manager.current.startQuiz(quizParam);
    setQuestion(manager.current.next());
    setQuiz(manager.current.quiz);
    setReveal(false);
    setChecked([]);
  };

  const stopQuiz = async () => {
    await manager.current.stopQuiz();
    setQuestion(manager.current.next());
    setQuiz(manager.current.quiz);
    setReveal(false);
    setChecked([]);
  };

  const resetStats = useCallback(async () => {
    await manager.current!.reset();
    setAsked(manager.current.asked);
    setCorrect(manager.current.correct);
  }, []);

  const TestDataContext = getTestDataContext();
  return (
    <TestDataContext.Consumer>
      {(context = {
        asked: 0,
        correct: 0,
        data: {},
        checked: [],
        reveal: false,
        resetStats,
        quizzes: [],
      }) => {
        context = {
          ...context,
          checkAnswers,
          nextQuestion,
          addQuiz,
          saveQuiz,
          startQuiz,
          stopQuiz,
          question,
          asked,
          correct,
          checked,
          reveal,
          data: manager.current.data,
          resetStats,
          quizzes,
          quiz,
        };

        let content;
        if (loading) {
          content = (
            <Loading />
          );
        } else {
          content = (
            <Routes>
              {children}
            </Routes>
          );
        }

        return (
          <TestDataContext.Provider value={context}>
            {content}
          </TestDataContext.Provider>
        );
      }}
    </TestDataContext.Consumer>
  );
};

export default TestDataProvider;
