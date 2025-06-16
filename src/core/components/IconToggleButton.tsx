import React, { FunctionComponent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./IconToggleButton.css";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export enum IconToggleButtonMode {
  LABEL,
  ICON,
  LABEL_AND_ICON,
  CUSTOM
}

interface Props {
  highlight?: boolean;
  onChange?: () => void;
  label?: string;
  icon?: IconDefinition;
  content?: React.ReactNode;
  downloadLink?: string;
  downloadLabel?: string;
  className?: string;
  smallScreenMode?: IconToggleButtonMode;
  largeScreenMode?: IconToggleButtonMode;
}

const IconToggleButton: FunctionComponent<Props> = ({
  highlight = false,
  onChange = () => null,
  label = "",
  icon = null,
  content = null,
  smallScreenMode = IconToggleButtonMode.ICON,
  largeScreenMode = IconToggleButtonMode.LABEL,
  downloadLink = "",
  downloadLabel = "",
  className = "",
}) => {
  const handleKeyDown = () => {
    if (onChange) {
      onChange();
    }
  };

  const clsNames = [
    "icon-toggle-btn",
    className,
  ];

  if (highlight) {
    clsNames.push("highlight");
  }

  switch (smallScreenMode) {
  case IconToggleButtonMode.ICON:
    clsNames.push("sm-label-hide");
    clsNames.push("sm-custom-hide");
    break;
  case IconToggleButtonMode.LABEL:
    clsNames.push("sm-icon-hide");
    clsNames.push("sm-custom-hide");
    break;
  case IconToggleButtonMode.LABEL_AND_ICON:
    clsNames.push("sm-custom-hide");
    break;
  case IconToggleButtonMode.CUSTOM:
    clsNames.push("sm-icon-hide");
    clsNames.push("sm-label-hide");
    break;
  default:
    break;
  }

  switch (largeScreenMode) {
  case IconToggleButtonMode.ICON:
    clsNames.push("lg-label-hide");
    clsNames.push("lg-custom-hide");
    break;
  case IconToggleButtonMode.LABEL:
    clsNames.push("lg-icon-hide");
    clsNames.push("lg-custom-hide");
    break;
  case IconToggleButtonMode.LABEL_AND_ICON:
    clsNames.push("lg-custom-hide");
    break;
  case IconToggleButtonMode.CUSTOM:
    clsNames.push("lg-icon-hide");
    clsNames.push("lg-label-hide");
    break;
  default:
    break;
  }

  let iconComponent;

  if (icon) {
    iconComponent = (<FontAwesomeIcon icon={icon} />);
  }

  return (
    <div className="toggle-btn">
      {downloadLink === "" && (
        <button
          className={clsNames.join(" ")}
          type="button"
          onClick={handleKeyDown}
        >
          <div className="icon-toggle-btn-icon">{iconComponent}</div>
          <div className="icon-toggle-btn-label">{label}</div>
          <div className="icon-toggle-btn-custom">{content}</div>
        </button>

      )}
      {downloadLink !== "" && (
        <a href={downloadLink} download={downloadLabel} target="_blank" rel="noreferrer">
          <button
            className={clsNames.join(" ")}
            type="button"
            onClick={handleKeyDown}
          >
            <div className="icon-toggle-btn-icon">{iconComponent}</div>
            <div className="icon-toggle-btn-label">{label}</div>
            <div className="icon-toggle-btn-custom">{content}</div>
          </button>
        </a>
      )}
    </div>
  );
};

export default IconToggleButton;
