import React, { FunctionComponent, useState } from "react";
import "./QuizCatalog.css";
import { t } from "i18next";
import { useNavigate } from "react-router";
import Quiz from "./Quiz";
import QuizModel from "../../model/Quiz";
import { useRulesTestData } from "../../context/TestDataContext";

const QuizCatalog: FunctionComponent = () => {
  const { quizzes, addQuiz } = useRulesTestData();
  const [quizList, setQuizList] = useState<QuizModel[]>(quizzes);
  const navigate = useNavigate();

  const handleCreateNew = async () => {
    const newQuiz = new QuizModel("New Quiz");
    if (addQuiz) {
      await addQuiz(newQuiz);
    }
    setQuizList([...quizList]);
    navigate(`/quizzes/${newQuiz.id}`);
  };

  return (
    <div id="quizzes">
      <div id="quizzes-catalog-header">
        <h2>{t("menu.quizzes")}</h2>
        <div className="quizzes-button-group">
          <button
            className="highlight"
            type="button"
            onClick={handleCreateNew}
          >
            {t("quizzes.new")}
          </button>
          <button type="button">{t("quizzes.reset")}</button>
        </div>
      </div>
      <div id="quizzes-list">
        {quizList.map((quiz) => (
          <Quiz
            key={quiz.id}
            quiz={quiz}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizCatalog;
