module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  testMatch: ["**/__tests__/**/*.test.(js|ts)"],
  moduleNameMapper: {
    "^react-native$": "<rootDir>/node_modules/react-native",
  },
};
