import React, { FunctionComponent, useState } from "react";
import "./QuizSettings.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faFloppyDisk, faPen, faPlay, faTrash, IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { t } from "i18next";
import { useNavigate, useParams } from "react-router";
import QuestionCatalogTree from "./QuestionCatalogTree";
import CheckBox from "../CheckBox";
import QuizRun from "./QuizRun";
import { useRulesTestData } from "../../context/TestDataContext";
import Quiz from "../../model/Quiz";
import IconToggleButton from "../IconToggleButton";
import QuizRunModel from "../../model/QuizRun";

const QuizSettings: FunctionComponent = () => {
  const { quizId } = useParams();
  const { quizzes, saveQuiz, startQuiz, deleteQuiz } = useRulesTestData();
  const navigate = useNavigate();

  const currentQuiz = quizzes.find((q, _) => q.id === quizId);
  const readOnly = currentQuiz ? currentQuiz.isDefault() : false;

  if (!currentQuiz) {
    navigate(-1);
    return null;
  }

  const [quiz, setQuiz] = useState<Quiz>(currentQuiz);

  const [
    instantFeedbackChecked,
    setInstantFeedbackChecked,
  ] = useState<boolean>(quiz.instantFeedback);
  const [showQuizCatalog, setShowQuizCatalog] = useState<boolean>(false);
  const [editIcon, setEditIcon] = useState<IconDefinition>(faPen);
  const [timeLimit, setTimeLimit] = useState<number>(quiz.timeLimit);
  const [maxQuestions, setMaxQuestions] = useState<number>(quiz.maxQuestions);
  const [name, setName] = useState<string>(quiz.name);
  const [_, setQuestions] = useState<string[]>(quiz.questions);
  const [runs, setRuns] = useState<QuizRunModel[]>(quiz.runs);

  const toggleQuestionCatalog = () => {
    setShowQuizCatalog(!showQuizCatalog);
    setEditIcon(!showQuizCatalog ? faFloppyDisk : faPen);
  };

  const handleBackButtonClick = () => {
    setQuiz(quiz);
    if (saveQuiz) saveQuiz(quiz);
    navigate("/quizzes");
  };

  const handleNameChange = (event: React.FormEvent<HTMLInputElement>) => {
    quiz.setName(event.currentTarget.value);
    setQuiz(quiz);
    setName(quiz.name);
  };

  const handleMaxQuestionChange = (event: React.FormEvent<HTMLInputElement>) => {
    quiz.setMaxQuestions(+event.currentTarget.value);
    setQuiz(quiz);
    setMaxQuestions(quiz.maxQuestions);
  };

  const handleInstantFeedbackChange = () => {
    quiz.setInstantFeedback(!quiz.instantFeedback);
    setQuiz(quiz);
    setInstantFeedbackChecked(!instantFeedbackChecked);
  };

  const handleTimeLimitChange = (event: {
    target: {
      value: string;
    }
  }) => {
    quiz.setTimeLimit(+event.target.value);
    setQuiz(quiz);
    setTimeLimit(quiz.timeLimit);
  };

  const handleQuestionChange = (questions: string[]) => {
    quiz.setQuestions(questions);
    setQuiz(quiz);
    setQuestions(quiz.questions);
  };

  const handleStartQuiz = async () => {
    if (startQuiz) {
      await startQuiz(quiz);
    }
    setQuiz(quiz);
    setRuns(quiz.runs);

    navigate(`/?${quiz.id}`);
  };

  const handleDelete = async () => {
    if (deleteQuiz) await deleteQuiz(quiz);
    navigate("/quizzes");
  }

  return (
    <div id="quiz-settings">
      <div id="quizzes-catalog-header">
        <button
          type="button"
          className="back-button"
          onClick={handleBackButtonClick}
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
        <h2>{t("quizzes.settings.title")}</h2>
        <div className="quizzes-button-group">
          <IconToggleButton
            label={t("quizzes.start")}
            onChange={handleStartQuiz}
            highlight
            icon={faPlay}
          />
          <IconToggleButton
            label={t("quizzes.settings.delete")}
            icon={faTrash}
            onChange={handleDelete}
          />
        </div>
      </div>
      <div id="quiz-settings-list">
        <div className="setting">
          <div className="label">{t("quizzes.settings.name")}</div>
          {readOnly ?
            <div className="label">{quiz.isDefault() ? t("quizzes.standard-quiz") : name}</div>
            :
            <input value={name} onChange={handleNameChange} />
          }
        </div>
        <div className="setting">
          <div className="label">{t("quizzes.settings.max-question")}</div>
          {readOnly ?
            <div className="label">{maxQuestions}</div>
            :
            <input className="number-input" type="number" value={maxQuestions} onChange={handleMaxQuestionChange} min={0} />
          }
        </div>
        <div className="setting">
          <div className="label">{t("quizzes.settings.time-limit")}</div>
          {readOnly ?
            <div className="label">{`1 ${t("quizzes.settings.hour")}`}</div>
            :
            (<select name="time-limit" id="time-limit" value={timeLimit} onChange={handleTimeLimitChange}>
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
            </select>)
          }
        </div>
        <div className="setting setting-inline">
          <div className="label">{t("quizzes.settings.instant-feedback")}</div>
          <CheckBox checked={quiz.instantFeedback} readOnly={readOnly} onChange={handleInstantFeedbackChange} />
        </div>
        <div id="quiz-settings-questions" className="setting">
          <div className="label">{t("quizzes.settings.questions")}</div>
          <div className="label">{quiz.getQuestionSummary()}</div>
          {!readOnly &&
            <button type="button" className="icon" onClick={toggleQuestionCatalog}>
              <FontAwesomeIcon icon={editIcon} size="sm" />
            </button>
          }
        </div>
        <QuestionCatalogTree
          showCatalog={showQuizCatalog}
          quiz={quiz}
          onChange={handleQuestionChange}
        />
      </div>
      <div className="quiz-settings-runs-header">
        <h2 className="quiz-settings-runs-title">{t("quizzes.settings.past-runs")}</h2>
      </div>
      <div id="quiz-settings-runs">
        {runs.length > 0 && runs
          .sort((a, b) => (b.timestamp.getTime() - a.timestamp.getTime()))
          .map((run) => (
            <QuizRun
              key={run.id}
              run={run}
            />
          ))}
        {runs.length === 0 && (
          <div className="quiz-settings-run-empty">
            {t("quizzes.settings.no-runs")}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSettings;
