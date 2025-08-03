
export const createThemeContext = () => {
  // Theme utility functions can be exported from here
  return {
    theme: 'light' as const
  };
};
