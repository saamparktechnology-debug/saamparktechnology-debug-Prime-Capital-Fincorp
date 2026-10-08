// swaggerGen.js
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Microfinance Management System API",
    description:
      "Auto-generated Swagger documentation for all backend endpoints",
  },
  host: "localhost:5000",
  basePath: "/api/v1",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Enter your JWT token as: Bearer <token>",
    },
  },
};

const outputFile = "./src/config/swagger_output.json";
const endpointsFiles = [
  "./src/server.js",
  "./src/routes/authRoutes.js",
  "./src/routes/agentRoutes.js",
  "./src/routes/customerRoutes.js",
  "./src/routes/kycRoutes.js",
  "./src/routes/loanRoutes.js",
  "./src/routes/emiRoutes.js",
  "./src/routes/auditRoutes.js",
  "./src/routes/reportRoutes.js",
  "./src/routes/analyticsRoutes.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation successfully generated!");
});
