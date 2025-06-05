import React, { FunctionComponent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./IconToggleButton.css";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface Props {
  highlight?: boolean;
  onChange?: () => void;
  label?: string;
  icon?: IconDefinition;
  content?: React.ReactNode;
  downloadLink?: string;
  downloadLabel?: string;
  className?: string;
}

const IconToggleButton: FunctionComponent<Props> = ({
  highlight = false,
  onChange = () => null,
  label = "",
  icon = null,
  content = null,
  downloadLink = "",
  downloadLabel = "",
  className = "",
}) => {
  const handleKeyDown = () => {
    if (onChange) {
      onChange();
    }
  };

  const highlightClass = highlight ? "highlight" : "";
  const clsName = `icon-toggle-btn ${highlightClass} ${className}`;

  let iconComponent;

  if (icon) {
    iconComponent = (<FontAwesomeIcon icon={icon} />);
  } else if (content) {
    iconComponent = content;
  }

  return (
    <div className="toggle-btn">
      {downloadLink === "" && (
        <button
          className={clsName}
          type="button"
          onClick={handleKeyDown}
        >
          <div className="icon-toggle-btn-icon">{iconComponent}</div>
          <div className="icon-toggle-btn-label">{label}</div>
        </button>

      )}
      {downloadLink !== "" && (

        <a href={downloadLink} download={downloadLabel} target="_blank" rel="noreferrer">
          <button
            className={clsName}
            type="button"
            onClick={handleKeyDown}
          >
            <div className="icon-toggle-btn-icon">{iconComponent}</div>
            <div className="icon-toggle-btn-label">{label}</div>
          </button>
        </a>
      )}
    </div>
  );
};

export default IconToggleButton;
