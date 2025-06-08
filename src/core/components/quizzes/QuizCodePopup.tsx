import React, { FunctionComponent, useState } from "react";
import "./QuizCodePopup.css";
import Popup from "reactjs-popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCopy, faShare } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import Quiz from "../../model/Quiz";
import { useRulesTestData } from "../../context/TestDataContext";
import IconToggleButton, { IconToggleButtonMode } from "../IconToggleButton";

interface Props {
  quiz: Quiz;
}

const QuizCodePopup: FunctionComponent<Props> = ({
  quiz,
}) => {
  const { data } = useRulesTestData();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  const questionArray = Object.keys(data);
  const code = quiz.encode(questionArray);
  const codeString = `www.usabeachtour.online/referee-quiz/quizzes?import=${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
    } catch (_) {
      // ignore
    }
  };

  return (
    <div>
      <IconToggleButton
        label="Share"
        icon={faShare}
        onChange={() => setOpen((o) => !o)}
      />
      <Popup open={open} closeOnDocumentClick onClose={closeModal} modal>
        <div className="popup-header">
          <h2>{t("quizzes.share.title")}</h2>
          <button
            type="button"
            className="back-button"
          >
            <FontAwesomeIcon icon={faClose} onClick={closeModal} />
          </button>
        </div>
        <div className="popup-body">
          <div className="popup-content-label">{t("quizzes.share.description")}</div>
          <div className="popup-content-value">
            <textarea
              defaultValue={codeString}
              readOnly
            />
            <IconToggleButton
              label={t("quizzes.share.copy")}
              icon={faCopy}
              smallScreenMode={IconToggleButtonMode.LABEL_AND_ICON}
              largeScreenMode={IconToggleButtonMode.ICON}
              onChange={handleCopy}
            />
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default QuizCodePopup;
