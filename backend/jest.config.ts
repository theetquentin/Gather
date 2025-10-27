import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  transformIgnorePatterns: [
    "node_modules/(?!(isomorphic-dompurify|dompurify|parse5)/)",
  ],
  moduleNameMapper: {
    "^isomorphic-dompurify$":
      "<rootDir>/tests/__mocks__/isomorphic-dompurify.ts",
  },
};

export default config;
