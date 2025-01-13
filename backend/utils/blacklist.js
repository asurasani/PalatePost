const tokenBlacklist = new Set();

export const addToBlacklist = (token) => {
  tokenBlacklist.add(token);
};

export const isBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};
