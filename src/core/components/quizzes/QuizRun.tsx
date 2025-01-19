import React, { FunctionComponent } from "react";
import "./QuizRun.css";
import { useNavigate } from "react-router";
import QuizRunModel from "../../model/QuizRun";

interface Props {
  run: QuizRunModel;
}

const QuizRun: FunctionComponent<Props> = ({
  run,
}) => {
  const navigate = useNavigate();

  const percentage = (run.correct.length / run.total) * 100;
  const successRate = run.total !== 0 ? (percentage).toFixed(1) : 0.0;
  let classification;
  if (run.total === 0) {
    classification = "empty";
  } else if (percentage >= 80) {
    classification = "good";
  } else if (percentage >= 50) {
    classification = "ok";
  } else {
    classification = "bad";
  }

  const handleClick = async () => {
    navigate(`/quizzes/${run.quizId}/runs/${run.id}`);
  };

  return (
    <button type="button" onClick={handleClick} className="quiz-settings-run">
      <div className="timestamp">{run.getFormattedTimestamp()}</div>
      <div id="quiz-results" className={classification}>
        <div className="quiz-result-absolute">{`${run.correct.length} / ${run.total}`}</div>
        <div className="quiz-result-percentage">{`(${successRate}%)`}</div>
      </div>
    </button>
  );
};

export default QuizRun;
