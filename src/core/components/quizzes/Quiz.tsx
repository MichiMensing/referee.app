import React, { FunctionComponent } from "react";
import "./Quiz.css";
import Question from "../../model/Question";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faSection } from "@fortawesome/free-solid-svg-icons";
import { t } from "i18next";
import { Link } from "react-router-dom";

interface Props {
  id: string;
  settings?: object;
  name: string;
  questions?: Question[];
  runs?: string[];
}

const Quiz: FunctionComponent<Props> = ({
  id, settings = null, name, questions = [], runs = []
}) => {

  return (
    <Link id="quiz-box" to={`/quizzes/${id}`} key={`quiz-${id}`}>
      <div id="quiz-details">
        <div id="quiz-details-header">{name}</div>
        <div id="quiz-details-footer">
          <div className="quiz-setting">
            <div className="icon"><FontAwesomeIcon icon={faHashtag} size="lg" /></div>
            <div className="title">{t("quizzes.questions")}</div>
            <div className="value">30</div>
          </div>
          <div className="quiz-setting">
            <div className="icon"><FontAwesomeIcon icon={faSection} size="lg" /></div>
            <div className="title">{t("quizzes.rules")}</div>
            <div className="value">{t("rules.rule.rule1")}</div>
          </div>
        </div>
      </div>
      <div id="quiz-results" className="good">
        <div className="quiz-result-absolute">28 / 30</div>
        <div className="quiz-result-percentage">(93.3%)</div>
      </div>
    </Link>
  );
};

export default Quiz;
