import React, { FunctionComponent } from "react";
import "./QuizRun.css";
import { useNavigate } from "react-router";
import QuizRunModel from "../../model/QuizRun";
import Question from "../../model/Question";

interface Props {
  run: QuizRunModel;
}

const QuizRun: FunctionComponent<Props> = ({
  run,
}) => {
  const navigate = useNavigate();

  const [classification, _, successRate] = Question
    .getClassificationAndRate(run.correct.length, run.total);

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
