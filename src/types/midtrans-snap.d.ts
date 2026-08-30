export {};

declare global {
  interface Window {
    snap?: {
      pay(
        snapToken: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ): void;
    };
  }
}