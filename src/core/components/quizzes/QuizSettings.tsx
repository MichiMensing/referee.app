import React, { ChangeEvent, FunctionComponent, useMemo, useState } from "react";
import "./QuizSettings.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faFloppyDisk, faPen, faPlay, IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { t } from "i18next";
import { useNavigate, useParams } from "react-router";
import QuestionCatalogTree from "./QuestionCatalogTree";
import CheckBox from "../CheckBox";
import QuizRun from "./QuizRun";
import { useRulesTestData } from "../../context/TestDataContext";
import Quiz from "../../model/Quiz";
import Question from "../../model/Question";

type OrderedData = {
  [rule: string]: {
    questions: Question[];
  };
};

const runs = [(
  <QuizRun
    timestamp="January 15, 2025 3:40 PM"
    correct={28}
    total={30}
  />
),
(
  <QuizRun
    timestamp="December 16, 2024 3:40 PM"
    correct={11}
    total={30}
  />
)];

const QuizSettings: FunctionComponent = () => {
  const { quizId } = useParams();
  const { quizzes, data } = useRulesTestData();
  const navigate = useNavigate();

  const currentQuiz = quizzes.find((q, i) => {
    return q.id === quizId;
  })

  if (!currentQuiz) {
    navigate(-1);
    return;
  }

  const [quiz, setQuiz] = useState<Quiz>(currentQuiz);

  const [instantFeedbackChecked, setInstantFeedbackChecked] = useState<boolean>(quiz.instantFeedback);
  const [showQuizCatalog, setShowQuizCatalog] = useState<boolean>(false);
  const [editIcon, setEditIcon] = useState<IconDefinition>(faPen);
  const [timeLimit, setTimeLimit] = useState<number>(quiz.timeLimit);
  const [maxQuestions, setMaxQuestions] = useState<number>(quiz.maxQuestions);
  const [name, setName] = useState<string>(quiz.name);
  const [questions, setQuestions] = useState<string[]>(quiz.questions);
  const [rerender, setRerender] = useState(0);

  const orderedData = useMemo(() => Object.values(data).reduce<OrderedData>((prev, question) => {
    const { rule } = question;
    if (!prev[question.rule]) {
      prev[rule] = {
        questions: [],
      };
    }

    prev[rule] = {
      questions: [...prev[rule].questions, question],
    };

    return prev;
  }, {}), [data, rerender]);

  function toggleQuestionCatalog(): void {
    setShowQuizCatalog(!showQuizCatalog);
    setEditIcon(!showQuizCatalog ? faFloppyDisk : faPen);
  }

  function handleBackButtonClick(): void {
    setQuiz(quiz);
    navigate(-1);
  }

  function handleNameChange(event: React.FormEvent<HTMLInputElement>): void {
    quiz.setName(event.currentTarget.value);
    setQuiz(quiz);
    setName(quiz.name);
  }

  function handleMaxQuestionChange(event: React.FormEvent<HTMLInputElement>): void {
    quiz.setMaxQuestions(+event.currentTarget.value);
    setQuiz(quiz);
    setMaxQuestions(quiz.maxQuestions);
  }

  function handleInstantFeedbackChange(): void {
    quiz.setInstantFeedback(!quiz.instantFeedback);
    setQuiz(quiz);
    setInstantFeedbackChecked(!instantFeedbackChecked);
  }

  function handleTimeLimitChange(event: {
    target: {
      value: string;
    }
  }): void {
    quiz.setTimeLimit(+event.target.value);
    setQuiz(quiz);
    setTimeLimit(quiz.timeLimit);
  }

  function handleQuestionChange(questions: string[]) {
    quiz.setQuestions(questions);
    setQuiz(quiz);
    setQuestions(quiz.questions);
  }

  return (
    <div id="quiz-settings">
      <div id="quizzes-catalog-header">
        <button className="back-button" onClick={handleBackButtonClick}><FontAwesomeIcon icon={faArrowLeft} size="lg" /></button>
        <h2>{t("quizzes.settings.title")}</h2>
        <button>{t("quizzes.settings.delete")}</button>
      </div>
      <div id="quiz-settings-list">
        <div className="setting">
          <label>{t("quizzes.settings.name")}</label>
          <input value={name} onChange={handleNameChange} />
        </div>
        <div className="setting">
          <label>{t("quizzes.settings.max-question")}</label>
          <input className="number-input" type="number" value={maxQuestions} onChange={handleMaxQuestionChange} min={0} />
        </div>
        <div className="setting">
          <label>{t("quizzes.settings.time-limit")}</label>
          <select name="time-limit" id="time-limit" value={timeLimit} onChange={handleTimeLimitChange}>
            <option value="0" label="none">{t("quizzes.settings.none")}</option>
            <option value="15">
              {`15 ${t("quizzes.settings.min")}`}
            </option>
            <option value="30">
              {`30 ${t("quizzes.settings.min")}`}
            </option>
            <option value="45">
              {`45 ${t("quizzes.settings.min")}`}
            </option>
            <option value="60">
              {`1 ${t("quizzes.settings.hour")}`}
            </option>
          </select>
        </div>
        <div className="setting setting-inline">
          <label>{t("quizzes.settings.instant-feedback")}</label>
          <CheckBox checked={quiz.instantFeedback} onChange={handleInstantFeedbackChange} />
        </div>
        <div id="quiz-settings-questions" className="setting">
          <label>{t("quizzes.settings.questions")}</label>
          <label>{quiz.getQuestionSummary()}</label>
          <button className="icon" onClick={() => toggleQuestionCatalog()}>
            <FontAwesomeIcon icon={editIcon} size="sm" />
          </button>
        </div>
        <QuestionCatalogTree showCatalog={showQuizCatalog} quiz={quiz} onChange={handleQuestionChange} />
      </div>
      <div className="quiz-settings-runs-header">
        <h2 className="quiz-settings-runs-title">{t("quizzes.settings.past-runs")}</h2>
      </div>
      <div id="quiz-settings-runs">
        {runs}
      </div>
      <div id="quiz-settings-run">
        <button className="floating"><FontAwesomeIcon icon={faPlay} size="lg" /></button>
      </div>
    </div>
  );
};

export default QuizSettings;
