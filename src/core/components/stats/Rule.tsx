/* eslint-disable no-mixed-operators */
import React, { FunctionComponent } from "react";
import "./Rule.css";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import QuestionComponent from "./Question";
import Question from "../../model/Question";
import QuizRun from "../../model/QuizRun";
import Quiz from "../../model/Quiz";
import { useRulesTestData } from "../../context/TestDataContext";

interface Props {
  id: string;
  asked: number;
  correct: number;
  questions: Question[];
  run?: QuizRun;
}

const Rule: FunctionComponent<Props> = ({
  id, asked, correct, questions, run,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addQuiz } = useRulesTestData();

  let key;
  if (id === "SAR") {
    key = "rules.sar";
  } else {
    key = `rules.rule.rule${id}`;
  }

  let [color, percent, _] = Question.getClassificationAndRate(correct, asked);

  const details = questions.map((question) => (
    <QuestionComponent key={question.id} question={question} run={run} />
  ));

  const createQuiz = async () => {
    const quiz = new Quiz(`${t("quizzes.rule-quiz")} ${t(key)}`, undefined, questions.map((q) => q.id));
    if (addQuiz) {
      await addQuiz(quiz);
    }
    navigate(`/quizzes/${quiz.id}`);
  };

  return (
    <div className="rule-stat-box">
      <div className="rule-stat-header">
        <div className="rule-stat-header-front">
          <h2 className="rule-stat-title">{t(key)}</h2>
          <button type="button" onClick={createQuiz}>
            <FontAwesomeIcon icon={faArrowRight} size="lg" />
            {" "}
            <span />
            <FontAwesomeIcon icon={faClipboardQuestion} size="lg" />
          </button>
        </div>
        <div className={`rule-stat-stats ${color}`}>{`${correct} / ${asked} (${percent}%)`}</div>
      </div>
      <div className="rule-stat-content">
        {details}
      </div>
    </div>
  );
};

export default Rule;
