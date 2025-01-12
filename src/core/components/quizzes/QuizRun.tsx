import React, { FunctionComponent } from "react";
import "./QuizRun.css";

interface Props {
  timestamp: string;
  correct?: number;
  total?: number;
}

const QuizRun: FunctionComponent<Props> = ({
  timestamp, correct = 0, total = 0
}) => {

  const percentage = correct / total * 100;
  const successRate = total !== 0 ? (percentage).toFixed(1) : 0.0;
  const classification = total === 0? 'empty' : percentage >= 80 ? 'good' : percentage >= 50 ? 'ok' : 'bad';

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
