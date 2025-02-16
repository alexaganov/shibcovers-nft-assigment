export const getErrorMessage = (error: unknown): string | null => {
  if (typeof error === "string") {
    return error;
  }

  if (
    !!error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return null;
};
