import React, { FunctionComponent, useEffect, useState } from "react";
import "./QuizPDFViewer.css";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useRulesTestData } from "../../context/TestDataContext";
import PDFGenerator from "../../model/PDFGenerator";

let pdfGenerated = false;

const QuizPDFViewer: FunctionComponent = () => {
  const { quizId, runId } = useParams();
  const {
    quizzes, data,
  } = useRulesTestData();
  const { t, i18n: { language } } = useTranslation();
  const [iframeSrc, setIframeSrc] = useState("");

  const currentQuiz = quizzes.find((q, _) => q.id === quizId);
  const currentRun = currentQuiz?.runs.find((r) => r.id === runId);
  const pdfGenerator = new PDFGenerator(language, t);

  const iFrame: React.JSX.Element = (<iframe title="pdf-frame" id="pdf" src={iframeSrc} />);

  if (!pdfGenerated) {
    pdfGenerator.createResultPDF(currentQuiz, currentRun, data).then((resultPDF) => {
      setIframeSrc(resultPDF);
      pdfGenerated = true;
    });
  }

  useEffect(() => () => {
    pdfGenerated = false;
  }, []);

  return (
    <div id="pdf-viewer">
      {iFrame}
    </div>
  );
};

export default QuizPDFViewer;
