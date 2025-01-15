import React, { FunctionComponent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./IconToggleButton.css";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface Props {
  highlight?: boolean;
  onChange?: () => void;
  label?: string;
  icon?: IconDefinition;
}

const IconToggleButton: FunctionComponent<Props> = ({
  highlight = false,
  onChange = () => null,
  label = "",
  icon = null,
}) => {
  const handleKeyDown = () => {
    if (onChange) {
      onChange();
    }
  };

  const highlightClass = highlight ? "highlight" : "";
  const className = `icon-toggle-btn ${highlightClass}`;

  let iconComponent;

  if (icon) {
    iconComponent = (<FontAwesomeIcon icon={icon} />);
  }

  return (
    <button
      className={className}
      type="button"
      onClick={handleKeyDown}
    >
      <div className="icon-toggle-btn-icon">{iconComponent}</div>
      <div className="icon-toggle-btn-label">{label}</div>
    </button>
  );
};

export default IconToggleButton;
