module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json"],
  testMatch: ["**/__tests__/**/*.test.js"],
  moduleNameMapper: {
    "^react-native$": "<rootDir>/node_modules/react-native",
  },
};
