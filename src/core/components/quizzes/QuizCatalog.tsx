import React, { FunctionComponent, useId, useState } from "react";
import "./QuizCatalog.css";
import Quiz from "./Quiz";
import { t } from "i18next";
import { v4 as uuidv4 } from 'uuid';


const QuizCatalog: FunctionComponent = () => {
  const [quizzes, setQuizzes] = useState([{
    id: uuidv4(),
    name: "My Quiz"
  }]);

  function handleCreateNew(): void {
    setQuizzes([...quizzes, {
      id: uuidv4(),
      name: "My Quiz"
    }]);
  }

  return (
    <div id="quizzes">
      <div id="quizzes-catalog-header">
        <h2>{t("menu.quizzes")}</h2>
        <button>{t("quizzes.reset")}</button>
      </div>
      <div id="quizzes-list">
        {quizzes.map(quiz => (
          <Quiz
            key={quiz.id}
            id={quiz.id}
            name={quiz.name}
          />
        ))}
      </div>
      <div id="quizzes-create">
        <button className="floating" onClick={handleCreateNew}>{"New Quiz"}</button>
      </div>
    </div>
  );
};

export default QuizCatalog;
