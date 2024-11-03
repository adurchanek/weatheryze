export default {
  verbose: true,
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
