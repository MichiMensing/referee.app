import React, { FunctionComponent, JSXElementConstructor, useEffect, useState } from "react";
import "./QuizPDFViewer.css";
import { useParams } from "react-router";
import { useRulesTestData } from "../../context/TestDataContext";
import PDFGenerator from "../../model/PDFGenerator";
import { useTranslation } from "react-i18next";

let pdfGenerated = false;

const QuizPDFViewer: FunctionComponent = () => {
  const { quizId } = useParams();
  const {
    quizzes, data
  } = useRulesTestData();
  const {t,  i18n: { language } } = useTranslation();
  const [iframeSrc, setIframeSrc] = useState('https://example.com');

  const currentQuiz = quizzes.find((q, _) => q.id === quizId);
  const pdfGenerator = new PDFGenerator(language, t);

  const iFrame: React.JSX.Element = (<iframe id="pdf" src={iframeSrc}></iframe>);

  if (!pdfGenerated) {
    pdfGenerator.createQuizPDF(currentQuiz, data).then((uri) => {
      setIframeSrc(uri);
      pdfGenerated = true;
    });
  }

  useEffect(() => {
    return () => {
      pdfGenerated = false;
    };
  }, []);

  return (
    <div id="pdf-viewer">
      {iFrame}
    </div>
  )
};

export default QuizPDFViewer;
