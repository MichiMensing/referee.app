import React, { FunctionComponent, useEffect, useState } from "react";
import "./QuizCatalog.css";
import { useNavigate } from "react-router";
import { faArrowRotateLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Quiz from "./Quiz";
import QuizModel from "../../model/Quiz";
import { useRulesTestData } from "../../context/TestDataContext";
import IconToggleButton from "../IconToggleButton";
import Loading from "../Loading";

const DEFAULT_QUIZ = (name:string) => new QuizModel(
  name,
  { timeLimit: 60, maxQuestions: 30, instantFeedback: false },
  undefined,
  "IHF_DEFAULT",
);

const QuizCatalog: FunctionComponent = () => {
  const {
    quizzes, addQuiz, resetQuizzes, data,
  } = useRulesTestData();
  const [quizList, setQuizList] = useState<QuizModel[]>(quizzes);
  const [importing, setImporting] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const importCode = searchParams.get("import");
  const defaultQuiz = quizzes.find((q) => q.isDefault()) || DEFAULT_QUIZ(t("quizzes.standard-quiz"));

  const handleImport = async (code: string, questionArray: string[]) => {
    const newQuiz = new QuizModel("Imported Quiz");
    newQuiz.loadSettingsFromCode(code, questionArray);

    if (addQuiz) {
      await addQuiz(newQuiz);
    }
    setQuizList([...quizList]);
    navigate(`/quizzes/${newQuiz.id}`);
  };

  const handleCreateNew = async () => {
    const newQuiz = new QuizModel("New Quiz");
    if (addQuiz) {
      await addQuiz(newQuiz);
    }
    setQuizList([...quizList]);

    setImporting(false);
    navigate(`/quizzes/${newQuiz.id}`);
  };

  const handleReset = async () => {
    if (resetQuizzes) {
      await resetQuizzes();
    }
    setQuizList([]);
  };

  useEffect(() => {
    if (importCode && importCode !== "" && !importing) {
      setImporting(true);
      handleImport(importCode, Object.keys(data));
    }
  }, []);

  if (importCode && importCode !== "" && !importing) {
    return <Loading/>
  }

  return (
    <div id="quizzes">
      <div id="quizzes-catalog-header">
        <h2>{t("menu.quizzes")}</h2>
        <div className="quizzes-button-group">
          <IconToggleButton
            label={t("quizzes.new")}
            icon={faPlus}
            onChange={handleCreateNew}
            highlight
          />
          <IconToggleButton
            label={t("quizzes.reset")}
            icon={faArrowRotateLeft}
            onChange={handleReset}
          />
        </div>
      </div>
      <div id="quizzes-standard-list">
        <Quiz
          key={defaultQuiz.id}
          quiz={defaultQuiz}
        />
      </div>
      <div id="quizzes-my-list-header"><h3>{t("quizzes.my-quizzes")}</h3></div>
      <div id="quizzes-list">
        {quizList.length > 0
          && quizList.filter((q) => q.id !== "IHF_DEFAULT")
            .map((quiz) => (
              <Quiz
                key={quiz.id}
                quiz={quiz}
              />
            ))}
        {quizList.length <= 1
          && (<div className="quizzes-list-empty">{t("quizzes.empty")}</div>
          )}
      </div>
    </div>
  );
};

export default QuizCatalog;
