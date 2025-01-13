import React, { FunctionComponent } from "react";
import "./QuizRun.css";

interface Props {
  timestamp: string;
  correct?: number;
  total?: number;
}

const QuizRun: FunctionComponent<Props> = ({
  timestamp, correct = 0, total = 0,
}) => {
  const percentage = (correct / total) * 100;
  const successRate = total !== 0 ? (percentage).toFixed(1) : 0.0;
  let classification;
  if (total === 0) {
    classification = "empty";
  } else if (percentage >= 80) {
    classification = "good";
  } else if (percentage >= 50) {
    classification = "ok";
  } else {
    classification = "bad";
  }

  return (
    <div className="quiz-settings-run">
      <div className="timestamp">{timestamp}</div>
      <div id="quiz-results" className={classification}>
        <div className="quiz-result-absolute">{`${correct} / ${total}`}</div>
        <div className="quiz-result-percentage">{`(${successRate}%)`}</div>
      </div>
    </div>
  );
};

export default QuizRun;
