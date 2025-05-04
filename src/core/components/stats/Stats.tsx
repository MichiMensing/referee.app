/* eslint-disable no-param-reassign, no-mixed-operators */
import React, { FunctionComponent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  faArrowLeft, faCheck, faPercent, faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRulesTestData } from "../../context/TestDataContext";
import Question from "../../model/Question";
import "./Stats.css";
import Rule from "./Rule";

type OrderedData = {
  [rule: string]: {
    asked: number;
    correct: number;
    questions: Question[];
  };
};

const Stats: FunctionComponent = () => {
  const { quizId, runId } = useParams();
  const {
    asked, correct, data, resetStats, quizzes,
  } = useRulesTestData();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rerender, setRerender] = useState(0);

  const quiz = quizzes.find((q) => q.id === quizId);
  const run = quiz?.runs.find((r) => r.id === runId);

  if ((quizId || runId) && !quiz && !run) {
    navigate("/stats");
    return undefined;
  }

  const askedStat = !run ? asked : run.asked;
  const correctStat = !run ? correct : run.correct.length;

  const percent = askedStat ? Math.round(100 / askedStat * correctStat) : 0;
  const dbOrderedData = useMemo(() => Object.values(data).reduce<OrderedData>((prev, question) => {
    const { rule, numAsked, numCorrect } = question;
    if (!prev[question.rule]) {
      prev[rule] = {
        asked: 0,
        correct: 0,
        questions: [],
      };
    }

    prev[rule] = {
      asked: prev[rule].asked + numAsked,
      correct: prev[rule].correct + numCorrect,
      questions: [...prev[rule].questions, question],
    };

    return prev;
  }, {}), [data, rerender]);

  let orderedData: OrderedData = dbOrderedData;
  if (run) {
    let answeredQuestions: string[] = [];
    if (run.answers) {
      answeredQuestions = Object.keys(run.answers);
      orderedData = answeredQuestions.reduce<OrderedData>((prev, questionId) => {
        const question = data[questionId];
        const { rule } = question;
        if (!prev[question.rule]) {
          prev[rule] = {
            asked: 0,
            correct: 0,
            questions: [],
          };
        }

        const isCorrect = run.correct.find((id) => id === questionId);

        prev[rule] = {
          asked: prev[rule].asked + 1,
          correct: prev[rule].correct + (isCorrect ? 1 : 0),
          questions: [...prev[rule].questions, question],
        };

        return prev;
      }, {});
    }
  }

  const handleReset = async () => {
    await resetStats();
    setRerender(rerender + 1);
  };

  const handleBackButtonClick = () => {
    if (run) {
      navigate(`/quizzes/${quiz?.id}`);
    } else {
      navigate(-1);
    }
  };

  const rules = Object.keys(orderedData).map((id: string) => {
    const ruleData = orderedData[id];
    return (
      <Rule
        key={id}
        id={id}
        asked={ruleData.asked}
        correct={ruleData.correct}
        questions={ruleData.questions}
        run={run}
      />
    );
  });

  let statHeader;
  if (run) {
    statHeader = (
      <div id="stats-overall-header">
        <button
          type="button"
          className="back-button"
          onClick={handleBackButtonClick}
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
        <h2>{`${t("quizzes.runs.statistics")} - ${run.getFormattedTimestamp()}`}</h2>
        <span />
      </div>
    );
  } else {
    statHeader = (
      <div id="stats-overall-header">
        <h2>{t("stats.overall")}</h2>
        <button type="button" onClick={handleReset}>{t("stats.reset")}</button>
      </div>
    );
  }

  return (
    <div id="stats">
      <div id="stats-overall">
        {statHeader}
        <div id="stats-asked">
          <FontAwesomeIcon icon={faQuestion} size="lg" />
          {`${askedStat} ${t("stats.asked")}`}
        </div>
        <div id="stats-correct">
          <FontAwesomeIcon icon={faCheck} size="lg" />
          {`${correctStat} ${t("stats.correct")}`}
        </div>
        <div id="stats-percent">
          <FontAwesomeIcon icon={faPercent} size="lg" />
          {`${percent}%`}
        </div>
      </div>
      {!!run && !run.answers &&
        ((<div className="rules-list-empty">{t("quizzes.no-answers")}</div>))}
      {(!run || !!run.answers) && rules}
    </div>
  );
};

export default Stats;
