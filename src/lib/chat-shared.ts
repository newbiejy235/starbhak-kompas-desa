export class NegotiationValidationError extends Error {}

export type SendChatMessageResult = {
  success: boolean;
  id?: number;
  orderId?: number;
  orderCode?: string;
  error?: string;
};
