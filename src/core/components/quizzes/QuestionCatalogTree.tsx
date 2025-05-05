import React, {
  FunctionComponent, useMemo, useState,
} from "react";
import "./QuestionCatalogTree.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown, faChevronRight, faCircle, faMinusSquare, faPlusSquare, faQuestion, faSection,
} from "@fortawesome/free-solid-svg-icons";
import { faCheckSquare, faSquare } from "@fortawesome/free-regular-svg-icons";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { useTranslation } from "react-i18next";
import { useRulesTestData } from "../../context/TestDataContext";
import Question from "../../model/Question";
import Quiz from "../../model/Quiz";

type OrderedData = {
  [rule: string]: {
    asked: number;
    correct: number;
    questions: Question[];
  };
};

type NodeElement = {
  value: string;
  children?: NodeElement[];
  checked?: boolean;
}

interface Props {
  showCatalog?: boolean;
  quiz: Quiz;
  onChange?: (questions: string[]) => void;
}

const QuestionCatalogTree: FunctionComponent<Props> = ({ showCatalog = true, quiz, onChange }) => {
  const { data } = useRulesTestData();
  const { t, i18n: { language } } = useTranslation();
  const [rerender, _] = useState(0);

  const orderedData = useMemo(() => Object.values(data).reduce<OrderedData>((prev, question) => {
    const { rule, numAsked, numCorrect } = question;
    if (!prev[question.rule]) {
      prev[rule] = {
        asked: 0,
        correct: 0,
        questions: [],
      };
    }

    prev[rule] = {
      asked: prev[rule].asked + numAsked,
      correct: prev[rule].correct + numCorrect,
      questions: [...prev[rule].questions, question],
    };

    return prev;
  }, {}), [data, rerender]);

  const questionCatalog = [{
    value: "all",
    label: t("quizzes.settings.all-questions"),
    children: Object.keys(orderedData).map((key) => ({
      value: key,
      label: `Rule ${key}: ${t(`rules.rule.rule${key}`)}`,
      className: Question.getClassificationAndRate(orderedData[key].correct, orderedData[key].asked)[0],
      children: orderedData[key].questions.map((question) => ({
        value: question.id,
        label: `${question.id}: ${question.question[language]}`,
        className: Question.getClassificationAndRate(question.numCorrect, question.numAsked)[0]
      })),
    })),
  }];

  const [checked, setChecked] = useState<string[]>(quiz.questions);
  const [expanded, setExpanded] = useState<string[]>([]);

  const updateCheckedState = (node: NodeElement) => {
    function getValues(nodeElement: NodeElement): string[] {
      let result: string[] = [];
      if (nodeElement.children) {
        nodeElement.children.forEach((v: NodeElement) => {
          result = [...result, ...getValues(v)];
        });
      } else {
        result = [nodeElement.value];
      }
      return result;
    }

    const updatedValues: string[] = getValues(node);

    let updateChecks;
    if (node.checked) {
      updateChecks = [...checked, ...updatedValues];
      setChecked(updateChecks);
    } else {
      updateChecks = checked.filter((check) => !updatedValues.includes(check));
      setChecked(updateChecks);
    }

    if (onChange) {
      onChange(updateChecks);
    }
  };

  const className = showCatalog ? "display" : "hidden";

  return (
    <div id="question-catalog-tree" className={className}>
      <CheckboxTree
        nodes={questionCatalog}
        checked={checked}
        expanded={expanded}
        checkModel="all"
        showExpandAll
        onCheck={(_x, node) => {
          updateCheckedState(node);
        }}
        onExpand={(expandedList) => setExpanded(expandedList)}
        icons={{
          check: <FontAwesomeIcon className="rct-icon rct-icon-check" icon={faCheckSquare} />,
          uncheck: <FontAwesomeIcon className="rct-icon rct-icon-uncheck" icon={faSquare} />,
          halfCheck: <FontAwesomeIcon className="rct-icon rct-icon-half-check" icon={faCheckSquare} />,
          expandClose: <FontAwesomeIcon className="rct-icon rct-icon-expand-close" icon={faChevronRight} />,
          expandOpen: <FontAwesomeIcon className="rct-icon rct-icon-expand-open" icon={faChevronDown} />,
          expandAll: <FontAwesomeIcon className="rct-icon rct-icon-expand-all" icon={faPlusSquare} />,
          collapseAll: <FontAwesomeIcon className="rct-icon rct-icon-collapse-all" icon={faMinusSquare} />,
          parentClose: (<div className="catalog-tree-parent-icon-status">
            <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faSection} />
            <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faCircle} />
            </div>),
          parentOpen: (<div className="catalog-tree-parent-icon-status">
            <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faSection} />
            <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faCircle} />
            </div>),
          leaf: (<div className="catalog-tree-icon-status">
            <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faQuestion} />
            <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faCircle} />
            </div>),
        }}
      />
    </div>
  );
};

export default QuestionCatalogTree;
