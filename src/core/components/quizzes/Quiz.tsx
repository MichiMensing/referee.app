import React, { FunctionComponent } from "react";
import "./Quiz.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faSection, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QuizModel from "../../model/Quiz";

interface Props {
  quiz: QuizModel;
}

const Quiz: FunctionComponent<Props> = ({
  quiz,
}) => {
  const { t } = useTranslation();
  const timeLimit = quiz.settings.timeLimit || 0;
  const quizStats = quiz.getQuizStatistics();

  const { amountOfQuestions } = quizStats;
  const possibleQuestions: string = quiz.questions.length === 0
    ? `${amountOfQuestions}`
    : `${amountOfQuestions} ${t("quizzes.out-of")} ${quiz.questions.length}`;

  return (
    <Link id="quiz-box" to={`/quizzes/${quiz.id}`} key={`quiz-${quiz.id}`}>
      <div id="quiz-details">
        <div id="quiz-details-header">{quiz.isDefault() ? t("quizzes.standard-quiz") : quiz.name}</div>
        <div id="quiz-details-footer">
          <div className="quiz-setting">
            <div className="icon"><FontAwesomeIcon icon={faHashtag} size="lg" /></div>
            <div className="title">{t("quizzes.questions")}</div>
            <div className="value">
              {quizStats.amountOfQuestions === 0 && t("quizzes.settings.unlimited")}
              {quizStats.amountOfQuestions > 0 && (possibleQuestions)}
            </div>
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
      <div id="quiz-results" className={quizStats.classification}>
        <div className="quiz-result-absolute">{`${quizStats.correct} / ${quizStats.total}`}</div>
        <div className="quiz-result-percentage">{`(${quizStats.percentage}%)`}</div>
      </div>
    </Link>
  );
};

export default Quiz;
