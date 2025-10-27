const DOMPurify = {
  sanitize: (dirty: string): string => {
    // Simple mock implementation for tests
    if (typeof dirty === "string") {
      return dirty;
    }
    return String(dirty);
  },
};

export default DOMPurify;
