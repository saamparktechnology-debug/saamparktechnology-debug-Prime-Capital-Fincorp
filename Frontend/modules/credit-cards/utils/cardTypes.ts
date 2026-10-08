// modules/credit-cards/utils/cardTypes.ts
import type { CardTypeMeta } from "../types";

export const CARD_TYPES: CardTypeMeta[] = [
  {
    value: "fd",
    label: "FD Credit Card",
    description: "Fixed Deposit backed credit card",
    accent: "violet",
  },
  {
    value: "normal",
    label: "Credit Card",
    description: "Standard bank credit card",
    accent: "blue",
  },
];

export const cardTypeLabel = (type: string): string => {
  const meta = CARD_TYPES.find((t) => t.value === type);
  return meta?.label ?? type;
};
