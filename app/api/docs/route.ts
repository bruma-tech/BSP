import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.0",
  info: {
    title: "Bruma Portal — SQL Query API",
    version: "1.0.0",
    description: "Execute raw SQL queries against the database.",
  },
  paths: {
    "/api/sql": {
      post: {
        summary: "Execute a raw SQL query",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["query"],
                properties: {
                  query: {
                    type: "string",
                    example: 'SELECT * FROM "User" LIMIT 10',
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Query executed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request — missing or invalid query",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "SQL execution error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
