/* eslint-disable no-mixed-operators */
import React, {
  FunctionComponent, useState, MouseEvent, useEffect,
} from "react";
import classnames from "classnames";
import "./RulesTest.css";
import { useTranslation } from "react-i18next";
import { faChartPie, faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { useRulesTestData } from "../../context/TestDataContext";
import CheckBox from "../CheckBox";
import useAnalytics from "../../hooks/useAnalytics";
import RelevantRules from "./RelevantRules";
import { ITimeObject } from "../../model";
import Quiz from "../../model/Quiz";

interface RulesTestProps {
  mapRuleToAnchor: (rule: string, language: string) => string;
}

const formatTime = (timeObject?: ITimeObject) => {
  if (!timeObject) return "00:00:00";
  const hours = `${timeObject.h}`.padStart(2, "0");
  const minutes = `${timeObject.m}`.padStart(2, "0");
  const seconds = `${timeObject.s}`.padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const ZERO_TIME: ITimeObject = { h: 0, m: 0, s: 0 };

const RulesTest: FunctionComponent<RulesTestProps> = ({ mapRuleToAnchor }) => {
  const navigate = useNavigate();
  const {
    question,
    nextQuestion,
    checkAnswers,
    stopQuiz,
    asked: numAsked,
    correct: numCorrect,
    checked: initialChecked,
    reveal,
    quiz,
  } = useRulesTestData();
  const { t, i18n: { language } } = useTranslation();
  const { trackEvent } = useAnalytics();

  const [checked, setChecked] = useState<string[]>(initialChecked);
  let timeRemaining;
  if (quiz) timeRemaining = quiz.getTimeRemaining();
  const [time, setTime] = useState<ITimeObject>(timeRemaining || ZERO_TIME);

  const showResult = async (q: Quiz) => {
    if (stopQuiz) await stopQuiz();
    navigate(`quizzes/${q.id}/runs/${q.getLatestRun()?.id}`);
  };

  useEffect(() => {
    if (!quiz) return () => { };
    const interval = setInterval(() => {
      const remaining = quiz?.getTimeRemaining();
      if (remaining) {
        setTime(remaining);
        if (remaining.h <= 0 && remaining.m <= 0 && remaining.s <= 0) {
          showResult(quiz);
        }
      } else {
        setTime(ZERO_TIME);
      }
    }, 1000);
    if (quiz.timeLimit === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, []);

  const handleButtonClick = async (event: MouseEvent) => {
    event.preventDefault();

    if (!nextQuestion || !checkAnswers) {
      return;
    }

    if (!reveal) {
      const response = await checkAnswers(checked, quiz?.instantFeedback);
      trackEvent("answer", {
        event_category: "test",
        event_label: question?.id,
        value: response.answeredCorrect ? 1 : 0,
      });
    }

    if (reveal || quiz && !quiz.instantFeedback) {
      nextQuestion();
      setChecked([]);

      trackEvent("next_question", {
        event_category: "engagement",
      });
    }
  };

  const updateChecked = (key: string) => {
    if (reveal) {
      return;
    }

    const currentChecked = [...checked];
    const index = currentChecked.indexOf(key);
    if (index > -1) {
      currentChecked.splice(index, 1);
    } else {
      currentChecked.push(key);
    }
    currentChecked.sort();
    setChecked(currentChecked);
  };

  useEffect(() => {
    if (!question && quiz) {
      showResult(quiz);
    }
  }, [question]);

  if (!question) {
    return <div className="no-questions">{t("rulestest.no-questions")}</div>;
  }

  const answers = question.answers[language] || [];
  const options = Object.keys(answers).map((key) => {
    const isCorrect = question.correct.includes(key);
    const isChecked = checked.includes(key);
    const className = classnames("option", {
      correct: reveal && isCorrect && isChecked,
      "correct-unchecked": reveal && isCorrect === true && isChecked === false,
      wrong: reveal && !isCorrect && isChecked,
    });

    return (
      <div key={key} className={className}>
        <div className="check">
          <CheckBox
            checked={isChecked}
            onChange={() => updateChecked(key)}
            labelledBy={`test-option-${key}`}
          />
        </div>
        <div id={`test-option-${key}`} className="text">
          {question?.answers[language][key]}
        </div>
      </div>
    );
  });

  const buttonText = reveal ? t("rulestest.next") : t("rulestest.check");
  const percentOverall = numAsked ? Math.round(100 / numAsked * numCorrect) : 0;
  const percentQuestion = question.numAsked
    ? Math.round(100 / question.numAsked * question.numCorrect) : 0;

  let relevantRules;
  if (reveal) {
    relevantRules = (
      <RelevantRules question={question} mapRuleToAnchor={mapRuleToAnchor} />
    );
  }

  let testHeader;
  if (quiz) {
    const stats = quiz.getQuizStatistics();
    let timerWidget;
    if (quiz.timeLimit > 0) {
      timerWidget = formatTime(time);
    }
    testHeader = (
      <div id="test-header">
        <div className="test-header-details">
          <FontAwesomeIcon icon={faClipboardQuestion} />
          <span>{`${t("quizzes.quiz")}: ${quiz.isDefault() ? t("quizzes.standard-quiz") : quiz.name}`}</span>
          <span> - </span>
          <span>{`${t("rulestest.question")} #${stats.asked + 1}`}</span>
          <span> - </span>
          {quiz.instantFeedback ? (
            <span>{`${t("rulestest.overall")} ${stats.correct}/${quiz.isUnlimited() && stats.amountOfQuestions === 0 ? "∞" : stats.total}${quiz.isUnlimited() ? "" : ` (${stats.percentage}%)`}`}</span>
          ) : (
            <span>{`${t("rulestest.overall")} ${stats.asked}/${quiz.isUnlimited() && stats.amountOfQuestions === 0 ? "∞" : stats.total}${quiz.isUnlimited() ? "" : ` (${stats.progress}%)`}`}</span>
          )}

        </div>
        <div className="test-header-timer">
          {timerWidget}
        </div>
      </div>
    );
  } else {
    testHeader = (
      <div id="test-header">
        <div className="test-header-details">
          <FontAwesomeIcon icon={faChartPie} />
          <span>{`${t("rulestest.overall")} ${numCorrect}/${numAsked} (${percentOverall}%)`}</span>
          <span> - </span>
          <span>{`${t("rulestest.question")} ${question.numCorrect}/${question.numAsked} (${percentQuestion}%)`}</span>
        </div>
        <div className="test-header-timer" />
      </div>
    );
  }

  return (
    <>
      {testHeader}
      <form id="test-content">
        <div id="test-question" className="box-with-header">
          <h2>
            {`${t("rulestest.question")} ${question.id}`}
          </h2>
          <div>
            {question.question[language]}
          </div>
        </div>
        <div id="test-options">
          {options}
        </div>
        {relevantRules}
        <button type="submit" onClick={handleButtonClick}>{buttonText}</button>
      </form>
    </>
  );
};

export default RulesTest;
