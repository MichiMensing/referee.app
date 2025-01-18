import React, { FunctionComponent } from "react";
import "./Quiz.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faSection, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import { t } from "i18next";
import { Link } from "react-router-dom";
import QuizModel from "../../model/Quiz";

interface Props {
  quiz: QuizModel;
}

const Quiz: FunctionComponent<Props> = ({
  quiz,
}) => {
  const timeLimit = quiz.settings.timeLimit || 0;
  const amountQuestions = quiz.settings.maxQuestions > 0 && quiz.questions.length > 0
    ? Math.min(quiz.settings.maxQuestions, quiz.questions.length)
    : Math.max(quiz.settings.maxQuestions, quiz.questions.length);

  const latestRun = quiz.getLatestRun();
  const percentage = (latestRun.correct / latestRun.total) * 100;
  const successRate = latestRun.total !== 0 ? (percentage).toFixed(1) : 0.0;

  let classification;
  if (latestRun.total === 0) {
    classification = "empty";
  } else if (percentage >= 80) {
    classification = "good";
  } else if (percentage >= 50) {
    classification = "ok";
  } else {
    classification = "bad";
  }

  return (
    <Link id="quiz-box" to={`/quizzes/${quiz.id}`} key={`quiz-${quiz.id}`}>
      <div id="quiz-details">
        <div id="quiz-details-header">{quiz.name}</div>
        <div id="quiz-details-footer">
          <div className="quiz-setting">
            <div className="icon"><FontAwesomeIcon icon={faHashtag} size="lg" /></div>
            <div className="title">{t("quizzes.questions")}</div>
            <div className="value">
              {amountQuestions === 0 && t("quizzes.settings.unlimited")}
              {amountQuestions > 0 && amountQuestions}</div>
          </div>
          <div className="quiz-setting">
            <div className="icon"><FontAwesomeIcon icon={faSection} size="lg" /></div>
            <div className="title">{t("quizzes.rules")}</div>
            <div className="value">{quiz.getQuestionSummary()}</div>
          </div>
          {timeLimit > 0 && (
            <div className="quiz-setting">
              <div className="icon"><FontAwesomeIcon icon={faStopwatch} size="lg" /></div>
              <div className="title">{t("quizzes.settings.time-limit")}</div>
              <div className="value">{timeLimit}</div>
            </div>
          )}
        </div>
      </div>
      <div id="quiz-results" className={classification}>
        <div className="quiz-result-absolute">{`${latestRun.correct} / ${latestRun.total}`}</div>
        <div className="quiz-result-percentage">{`(${successRate}%)`}</div>
      </div>
    </Link>
  );
};

export default Quiz;
