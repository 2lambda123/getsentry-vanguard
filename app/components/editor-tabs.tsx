import styled from "styled-components";
import * as TabsPrimitive from "@radix-ui/react-tabs";

const StyledTabs = styled(TabsPrimitive.Root)`
  display: flex;
  flex-direction: column;
`;

const StyledList = styled(TabsPrimitive.List)`
  flex-shrink: 0;
  display: flex;
  border-bottom: 1px solid ${(p) => p.theme.borderColor};
`;

const StyledTrigger = styled(TabsPrimitive.Trigger)`
  all: unset;
  font-family: inherit;
  background-color: ${(p) => p.theme.bgColor};
  padding: 0 20px;
  height: 45px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
  color: ${(p) => p.theme.textMuted};
  user-select: none;

  &:first-child {
    border-top-left-radius: 6px;
  }

  &:last-child {
    border-top-right-radius: 6px;
  }

  &:hover {
    color: ${(p) => p.theme.textColor};
  }

  &[data-state="active"] {
    color: ${(p) => p.theme.tabActiveColor};
    box-shadow: inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor;
  }

  &:focus {
    position: relative;
  }
`;

const StyledContent = styled(TabsPrimitive.Content)`
  flex-grow: 1;
  padding-top: 20px;
  background-color: ${(p) => p.theme.bgColor};
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  outline: none;
  &:focus {
    boxShadow: 0 0 0 2px black;
  },
`;

// Exports
export const Tabs = StyledTabs;
export const List = StyledList;
export const Trigger = StyledTrigger;
export const Content = StyledContent;
