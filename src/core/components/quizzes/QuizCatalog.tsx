import React, { FunctionComponent, useState } from "react";
import "./QuizCatalog.css";
import { t } from "i18next";
import { useNavigate } from "react-router";
import { faArrowRotateLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import Quiz from "./Quiz";
import QuizModel from "../../model/Quiz";
import { useRulesTestData } from "../../context/TestDataContext";
import IconToggleButton from "../IconToggleButton";

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
          <IconToggleButton
            label={t("quizzes.new")}
            icon={faPlus}
            onChange={handleCreateNew}
            highlight
          />
          <IconToggleButton
            label={t("quizzes.reset")}
            icon={faArrowRotateLeft}
          />
        </div>
      </div>
      <div id="quizzes-list">
        { quizList.length > 0
          && quizList.map((quiz) => (
            <Quiz
              key={quiz.id}
              quiz={quiz}
            />
          ))}
        { quizList.length === 0
          && (<div className="quizzes-list-empty">{t("quizzes.empty")}</div>
          )}
      </div>
    </div>
  );
};

export default QuizCatalog;
