import { NextResponse } from "next/server";
import { DEPLOYMENT_URL } from "vercel-url";

const key = JSON.parse(process.env.BITTE_KEY || "{}");
const config = JSON.parse(process.env.BITTE_CONFIG || "{}");

if (!key?.accountId) {
  console.warn("Missing account info.");
}
if (!config || !config.url) {
  console.warn("Missing config or url in config.");
}

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Karma API",
      description:
        "API for retrieving account karma and badges based on actions performed by the account.",
      version: "1.0.0",
    },
    servers: [
      {
        url: config?.url || DEPLOYMENT_URL,
      },
    ],
    "x-mb": {
      "account-id": key.accountId || "",
      assistant: {
        name: "Karma Agent",
        description:
          "An assistant that provides account karma and badges based on actions performed by the account and its current state.",
        instructions:
          "Get information about an account's karma and badges. Karma is calculated as the sum of the karma values of all badges earned by the account.",
        // tools: [{ type: "generate-transaction" }],
      },
    },
    paths: {
      "/api/{account}": {
        get: {
          operationId: "get-account-karma",
          description:
            "Get account karma and badges based on actions performed by the account.",
          parameters: [
            {
              name: "account",
              in: "path",
              description:
                "The identifier for the account to get karma and badges for, e.g. 'ref-finance.near'.",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      karma: {
                        type: "number",
                      },
                      badges: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                            },
                            description: {
                              type: "string",
                            },
                            karma: {
                              type: "number",
                            },
                            minBalance: {
                              type: ["number", "null"],
                              description:
                                "The minimum balance required to earn this badge",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                      },
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
  return NextResponse.json(pluginData);
}
