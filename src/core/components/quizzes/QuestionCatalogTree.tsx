import React, {
  Children, FunctionComponent, useMemo, useState,
} from "react";
import "./QuestionCatalogTree.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown, faChevronRight, faMinusSquare, faPlusSquare, faQuestion, faSection,
} from "@fortawesome/free-solid-svg-icons";
import { faCheckSquare, faSquare } from "@fortawesome/free-regular-svg-icons";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { useTranslation } from "react-i18next";
import { useRulesTestData } from "../../context/TestDataContext";
import Question from "../../model/Question";

type OrderedData = {
  [rule: string]: {
    questions: Question[];
  };
};

interface Props {
  showCatalog?: boolean;
}

const QuestionCatalogTree: FunctionComponent<Props> = ({ showCatalog = true }) => {
  const { data } = useRulesTestData();
  const { t, i18n: { language } } = useTranslation();
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

  const questionCatalog = [{
    value: "all",
    label: t("quizzes.settings.all-questions"),
    children: Object.keys(orderedData).map((key) => ({
      value: key,
      label: `Rule ${key}: ${t(`rules.rule.rule${key}`)}`,
      children: orderedData[key].questions.map((question) => ({
        value: question.id,
        label: `${question.id}: ${question.question[language]}`,
      })),
    })),
  }];

  const [checked, setChecked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  const updateCheckedState = (node: any) => {
    const updatedValues: string[] = getValues(node);

    function getValues(nodeElement: any): string[] {
      let result: string[] = [];
      if (nodeElement.children) {
        nodeElement.children.forEach((v: any) => {
          result = [...result, ...getValues(v)];
        });
      } else {
        result = [nodeElement.value];
      }
      return result;
    }

    if (node.checked) {
      setChecked([...checked, ...updatedValues]);
    } else {
      const filteredChecks = checked.filter((check) => !updatedValues.includes(check));
      setChecked(filteredChecks);
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
        onCheck={(_, node) => {
          updateCheckedState(node);
        }}
        onExpand={(expanded) => setExpanded(expanded)}
        icons={{
          check: <FontAwesomeIcon className="rct-icon rct-icon-check" icon={faCheckSquare} />,
          uncheck: <FontAwesomeIcon className="rct-icon rct-icon-uncheck" icon={faSquare} />,
          halfCheck: <FontAwesomeIcon className="rct-icon rct-icon-half-check" icon={faCheckSquare} />,
          expandClose: <FontAwesomeIcon className="rct-icon rct-icon-expand-close" icon={faChevronRight} />,
          expandOpen: <FontAwesomeIcon className="rct-icon rct-icon-expand-open" icon={faChevronDown} />,
          expandAll: <FontAwesomeIcon className="rct-icon rct-icon-expand-all" icon={faPlusSquare} />,
          collapseAll: <FontAwesomeIcon className="rct-icon rct-icon-collapse-all" icon={faMinusSquare} />,
          parentClose: <FontAwesomeIcon className="rct-icon rct-icon-parent-close" icon={faSection} />,
          parentOpen: <FontAwesomeIcon className="rct-icon rct-icon-parent-open" icon={faSection} />,
          leaf: <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faQuestion} />,
        }}
      />
    </div>
  );
};

export default QuestionCatalogTree;
