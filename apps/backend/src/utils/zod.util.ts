// Helper function to validate JSON string structure
export const isValidJsonArray = (val?: string): boolean => {
  if (!val) return true; // Allow undefined values (optional)
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
};

export const isValidJsonObject = (val?: string): boolean => {
  if (!val) return true; // Allow undefined values (optional)
  try {
    const parsed = JSON.parse(val);
    return (
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    );
  } catch {
    return false;
  }
};
