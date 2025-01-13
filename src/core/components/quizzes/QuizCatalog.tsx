import React, { FunctionComponent, useId, useState } from "react";
import "./QuizCatalog.css";
import { t } from "i18next";
import Quiz from "./Quiz";
import QuizModel from "../../model/Quiz";
import { useRulesTestData } from "../../context/TestDataContext";

const QuizCatalog: FunctionComponent = () => {
  const { quizzes, addQuiz } = useRulesTestData();
  const [quizList, setQuizList] = useState<QuizModel[]>(quizzes);

  const handleCreateNew = async () => {
    const newQuiz = new QuizModel("New Quiz");
    if (addQuiz) {
      await addQuiz(newQuiz);
    }
    setQuizList([...quizList]);
  };

  return (
    <div id="quizzes">
      <div id="quizzes-catalog-header">
        <h2>{t("menu.quizzes")}</h2>
        <button>{t("quizzes.reset")}</button>
      </div>
      <div id="quizzes-list">
        {quizList.map((quiz) => (
          <Quiz
            key={quiz.id}
            id={quiz.id}
            name={quiz.name}
          />
        ))}
      </div>
      <div id="quizzes-create">
        <button className="floating" onClick={handleCreateNew}>New Quiz</button>
      </div>
    </div>
  );
};

export default QuizCatalog;
