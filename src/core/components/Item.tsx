import React, { FunctionComponent, ReactNode } from "react";

export interface ItemProps {
  code: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  children: ReactNode;
}

const Item: FunctionComponent<ItemProps> = ({
  selected = false,
  children,
  onClick = () => null,
  className = "",
  code,
}) => (
  <li
    className={className}
    role="option"
    aria-selected={selected}
    value={code}
    onClick={onClick}
    onKeyDown={onClick}
  >
    {children}
  </li>
);

export default Item;
