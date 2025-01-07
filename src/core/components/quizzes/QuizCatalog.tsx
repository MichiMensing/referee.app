import React, { FunctionComponent} from "react";
import "./QuizCatalog.css";
import Quiz from "./Quiz";
import { t } from "i18next";
import QuizSettings from "./QuizSettings";

const quizzes = [(
  <Quiz
    id="xx"
    name="My Quiz"
  />
),
(
  <Quiz
    id="yy"
    name="My Quiz 2"
  />
)];

const QuizCatalog: FunctionComponent = () => {

  return (
    <div id="quizzes">
      <div id="quizzes-catalog-header">
          <h2>{t("menu.quizzes")}</h2>
          <button>{t("quizzes.reset")}</button>
      </div>
      <div id="quizzes-list">
        {quizzes}
      </div>
      <div id="quizzes-create">
        <button className="floating">{"New Quiz"}</button>
      </div>
    </div>
  );

  // return (
  //   <div id="quizzes">
  //     <QuizSettings />
  //   </div>
  // )
};

export default QuizCatalog;
