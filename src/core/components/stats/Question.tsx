/* eslint-disable no-mixed-operators */
import React, { FunctionComponent, KeyboardEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { faChevronDown, faChevronRight, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import Question from "../../model/Question";
import "./Question.css";
import CheckBox from "../CheckBox";
import mapRuleToAnchor from "../../../beach/utils/mapRuleToAnchor";
import QuizRun from "../../model/QuizRun";

interface Props {
  question: Question;
  run?: QuizRun;
}

const QuestionComponent: FunctionComponent<Props> = ({ question, run }) => {
  const [open, setOpen] = useState(false);
  const { t, i18n: { language } } = useTranslation();

  const toggleOpen = () => {
    setOpen(!open);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode === 32) {
      setOpen(!open);
    } else {
      return;
    }

    event.preventDefault();
  };

  const asked = run ? 1 : question.numAsked;
  let correct = question.numCorrect;
  if (run) {
    correct = (run.correct.find((id) => id === question.id)) ? 1 : 0;
  }

  let [color, percent, _] = Question.getClassificationAndRate(correct, asked);
  let icon;
  let content;
  if (open) {
    icon = faChevronDown;

    const answers = question.answers[language] || [];
    const options = Object.keys(answers).map((key) => {
      const isCorrect = question.correct.includes(key);
      let isChecked = question.correct.includes(key);
      let className = "";
      if (run && run.answers) {
        isChecked = run.answers[question.id].includes(key);
        className = classnames("text", {
          correct: isCorrect && isChecked,
          "correct-unchecked": isCorrect === true && isChecked === false,
          wrong: !isCorrect && isChecked,
        });
      }

      return (
        <React.Fragment key={key}>
          <div className="check">
            <CheckBox
              checked={isChecked}
              labelledBy={`test-option-${key}`}
              readOnly
            />
          </div>
          <div className={className}>
            {question?.answers[language][key]}
          </div>
        </React.Fragment>
      );
    });

    content = (
      <div className="content">
        <div className="text">
          {question.question[language]}
        </div>
        <div className="options">
          {options}
        </div>
        <div className="related-rules">
          <span>{t("rulestest.relevant-rules")}</span>
          {": "}
          {question.rules.map((rule) => (
            <Link key={rule} to={`/rules${mapRuleToAnchor(rule, language)}`}>{rule}</Link>
          ))}
        </div>
      </div>
    );
  } else {
    icon = faChevronRight;
  }

  return (
    <div
      key={question.id}
      className="stat-question"
      role="switch"
      aria-checked={open}
      tabIndex={0}
      onClick={toggleOpen}
      onKeyDown={handleKeyDown}
    >
      <FontAwesomeIcon icon={icon} size="lg" />
      <div className="number">
        {question.id}
      </div>
      {
        !run && (
          <div className="box">
            <FontAwesomeIcon icon={faFolderOpen} size="lg" />
            <span>{question.box}</span>
          </div>
        )
      }
      <div className={`result ${color}`}>{`${correct} / ${asked} (${percent}%)`}</div>
      {content}
    </div>
  );
};

export default QuestionComponent;
