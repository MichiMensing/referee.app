/* eslint-disable no-param-reassign, no-mixed-operators */
import React, {
  FunctionComponent, useEffect, useMemo, useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  faArrowLeft, faArrowRotateLeft, faCheck, faClipboardQuestion, faFile, faPercent, faQuestion,
  faRepeat,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRulesTestData } from "../../context/TestDataContext";
import Question from "../../model/Question";
import Rule from "./Rule";
import IconToggleButton, { IconToggleButtonMode } from "../IconToggleButton";
import "./Stats.css";
import Quiz from "../../model/Quiz";
import PDFGenerator from "../../model/PDFGenerator";

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
    asked, correct, data, resetStats, quizzes, addQuiz,
  } = useRulesTestData();
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const [rerender, setRerender] = useState(0);
  const [resultPDFLink, setResultPDFLink] = useState("");

  const quiz = quizzes.find((q) => q.id === quizId);
  const run = quiz?.runs.find((r) => r.id === runId);

  useEffect(() => {
    if ((quizId || runId) && !quiz && !run) {
      navigate("/stats");
      return;
    }

    if (resultPDFLink === "") {
      const pdfGenerator = new PDFGenerator(language, t);
      setResultPDFLink("Loading");
      pdfGenerator.createResultPDF(quiz, run, data).then((resultPDF) => {
        setResultPDFLink(resultPDF);
      });
    }
  }, []);

  const askedStat = !run ? asked : run.asked;
  const correctStat = !run ? correct : run.correct.length;

  const isNeededForRetry = (q: Question) => {
    // all red marked questions
    if (q.numAsked > 0 && q.numCorrect / q.numAsked * 100 < 50) {
      return true;
    }
    return false;
  };

  const percent = askedStat ? Math.round(100 / askedStat * correctStat) : 0;
  const [dbOrderedData, dbWrongAnswers] = useMemo(
    () => {
      const wrongAnswers: string[] = [];
      const tmpData = Object.values(data).reduce<OrderedData>((prev, question) => {
        const { rule, numAsked, numCorrect } = question;
        if (!prev[question.rule]) {
          prev[rule] = {
            asked: 0,
            correct: 0,
            questions: [],
          };
        }

        if (isNeededForRetry(question)) {
          wrongAnswers.push(question.id);
        }

        prev[rule] = {
          asked: prev[rule].asked + numAsked,
          correct: prev[rule].correct + numCorrect,
          questions: [...prev[rule].questions, question],
        };

        return prev;
      }, {});

      return [tmpData, wrongAnswers];
    },
    [data, rerender],
  );

  let orderedData: OrderedData = dbOrderedData;
  let runWrongAnswers: string[] = [];
  if (run) {
    let answeredQuestions: string[] = [];
    runWrongAnswers = [];
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

        if (!isCorrect) {
          runWrongAnswers.push(questionId);
        }

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

  const handleRetryFailed = async () => {
    const questions = run ? runWrongAnswers : dbWrongAnswers;
    const newQuiz = new Quiz("Retry failed questions", undefined, questions);
    if (addQuiz) {
      await addQuiz(newQuiz);
    }
    navigate(`/quizzes/${newQuiz.id}`);
  };

  const retryBtn = (
    <IconToggleButton
      label="Retry Failed Questions"
      smallScreenMode={IconToggleButtonMode.CUSTOM}
      content={(
        <div>
          <FontAwesomeIcon icon={faRepeat} />
          <span className="spacer" />
          <FontAwesomeIcon icon={faClipboardQuestion} />
        </div>
      )}
      onChange={handleRetryFailed}
      highlight
    />
  );

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
        {(!run || !!run.answers) && (
          <div className="stats-button-group">
            {retryBtn}
            <IconToggleButton
              label="PDF"
              icon={faFile}
              downloadLabel="Beach Handball Rules Quiz Result"
              downloadLink={resultPDFLink}
            />
          </div>
        )}
      </div>
    );
  } else {
    statHeader = (
      <div id="stats-overall-header">
        <h2>{t("stats.overall")}</h2>
        <div className="stats-button-group">
          {retryBtn}
          <IconToggleButton
            label={t("stats.reset")}
            icon={faArrowRotateLeft}
            onChange={handleReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div id="stats">
      <div id="stats-overall">
        {statHeader}
        <div id="stats-asked" className="equal-width-icon">
          <FontAwesomeIcon icon={faQuestion} size="lg" />
          {`${askedStat} ${t("stats.asked")}`}
        </div>
        <div id="stats-correct" className="equal-width-icon">
          <FontAwesomeIcon icon={faCheck} size="lg" />
          {`${correctStat} ${t("stats.correct")}`}
        </div>
        <div id="stats-percent" className="equal-width-icon">
          <FontAwesomeIcon icon={faPercent} size="lg" />
          {`${percent}%`}
        </div>
      </div>
      {!!run && !run.answers
        && ((<div className="rules-list-empty">{t("quizzes.no-answers")}</div>))}
      {(!run || !!run.answers) && rules}
    </div>
  );
};

export default Stats;
