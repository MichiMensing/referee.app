import React, { FunctionComponent, useState} from "react";
import "./QuizSettings.css";
import CheckBox from "../CheckBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFloppyDisk, faPen, faPlay, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { t } from "i18next";
import QuestionCatalogTree from "./QuestionCatalogTree";
import { useNavigate, useParams } from "react-router";
import QuizRun from "./QuizRun";

const runs = [(
  <QuizRun
    timestamp="January 15, 2025 3:40 PM"
    correct={28}
    total={30}/>
  ),
  (
  <QuizRun
    timestamp="December 16, 2024 3:40 PM"
    correct={11}
    total={30}/>
  )];

const QuizSettings: FunctionComponent = () => {

  const { quizId } = useParams();
  const [showQuizCatalog, setShowQuizCatalog] = useState<boolean>(false);
  const [editIcon, setEditIcon] = useState<IconDefinition>(faPen);
  const navigate = useNavigate();

  function toggleQuestionCatalog(): void {
    setShowQuizCatalog(!showQuizCatalog);
    setEditIcon(!showQuizCatalog ? faFloppyDisk : faPen);
  }

  function handleBackButtonClick(): void {
    navigate(-1);
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
          <input></input>
        </div>
        <div className="setting">
          <label>{t("quizzes.settings.max-question")}</label>
          <input className="number-input" type="number"></input>
        </div>
        <div className="setting">
          <label>{t("quizzes.settings.time-limit")}</label>
          <select name="time-limit" id="time-limit">
            <option value="none">{t("quizzes.settings.none")}</option>
            <option value="15">15 {t("quizzes.settings.min")}</option>
            <option value="30">30 {t("quizzes.settings.min")}</option>
            <option value="45">45 {t("quizzes.settings.min")}</option>
            <option value="60">1 {t("quizzes.settings.hour")}</option>
          </select>
        </div>
        <div className="setting setting-inline">
          <label>{t("quizzes.settings.instant-feedback")}</label>
          <CheckBox checked={false}></CheckBox>
        </div>
        <div id="quiz-settings-questions" className="setting">
          <label>{t("quizzes.settings.questions")}</label>
          <label>{t("quizzes.settings.all")}</label>
          <button className="icon" onClick={() => toggleQuestionCatalog()}>
            <FontAwesomeIcon icon={editIcon} size="sm" />
          </button>
        </div>
        <QuestionCatalogTree showCatalog={showQuizCatalog} />
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
