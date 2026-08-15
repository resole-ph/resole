import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/docs",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Resole API Documentation",
        version: "1.0.0",
        description: "Interactive API documentation for the Resole marketplace application.",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
