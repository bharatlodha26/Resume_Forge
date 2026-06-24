import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { AsyncLocalStorage } from "async_hooks";

const PORT = process.env.PORT || 3001;
const LOCAL_API_BASE = `http://localhost:${PORT}`;

export const mcpStorage = new AsyncLocalStorage();

const transports = new Map();

function isInitializeRequest(body) {
  return body && body.jsonrpc === "2.0" && body.method === "initialize";
}

async function localApiCall(method, path, body = null, authHeader = "") {
  const url = `${LOCAL_API_BASE}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (authHeader) {
    options.headers.Authorization = authHeader;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || `HTTP error ${response.status}`);
  }

  return response.json();
}

function createMcpServer() {
  const server = new McpServer({
    name: "ResumeForge MCP Server",
    version: "2.0.0",
  });

  server.tool(
    "get_master_resume",
    "Retrieve the authenticated user's master resume JSON from backend storage",
    {},
    async () => {
      const store = mcpStorage.getStore();
      const authHeader = store ? store.authHeader : "";

      if (!authHeader) {
        return {
          content: [{ type: "text", text: "Error: Missing Authorization header. Please log in first." }],
          isError: true,
        };
      }

      try {
        const data = await localApiCall("GET", "/api/resume/master", null, authHeader);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Failed to retrieve master resume: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "save_master_resume",
    "Validate and save (replace) the authenticated user's master resume JSON in backend storage",
    {
      resume: z.record(z.any()).describe("The complete resume JSON payload conforming to the ResumeForge schema"),
    },
    async ({ resume }) => {
      const store = mcpStorage.getStore();
      const authHeader = store ? store.authHeader : "";

      if (!authHeader) {
        return {
          content: [{ type: "text", text: "Error: Missing Authorization header. Please log in first." }],
          isError: true,
        };
      }

      try {
        const result = await localApiCall("PUT", "/api/resume/master", resume, authHeader);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Failed to save master resume: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "generate_pdf",
    "Compile a resume JSON into a high-quality LaTeX PDF, returning the PDF download URL. Stateless.",
    {
      resume_json: z.record(z.any()).describe("The resume JSON content to compile into PDF"),
      template: z.string().optional().describe("The name of the LaTeX template to use (e.g. 'executive')"),
    },
    async ({ resume_json, template }) => {
      const store = mcpStorage.getStore();
      const authHeader = store ? store.authHeader : "";

      try {
        const result = await localApiCall(
          "POST",
          "/api/resume/generate-pdf",
          { resume_json, template: template || "executive" },
          authHeader
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Failed to generate PDF: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "email_resume",
    "Send a compiled PDF resume to the user's email address or an override email address",
    {
      pdf_url: z.string().describe("The relative PDF URL returned by generate_pdf (e.g., '/pdf/job-id/main.pdf')"),
      email: z.string().optional().describe("Override email address. If omitted, defaults to the user's registered account email."),
      subject: z.string().optional().describe("Optional custom subject for the email"),
      message: z.string().optional().describe("Optional custom message body for the email"),
    },
    async ({ pdf_url, email, subject, message }) => {
      const store = mcpStorage.getStore();
      const authHeader = store ? store.authHeader : "";

      if (!authHeader) {
        return {
          content: [{ type: "text", text: "Error: Missing Authorization header. Please log in first." }],
          isError: true,
        };
      }

      try {
        const result = await localApiCall(
          "POST",
          "/api/resume/email",
          { pdf_url, email, subject, message },
          authHeader
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Failed to email resume: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_templates",
    "Get details of all available LaTeX resume templates supported by the compiler",
    {},
    async () => {
      try {
        const data = await localApiCall("GET", "/api/resume/templates");
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Failed to retrieve templates: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  return server;
}

function getAuthHeader(req) {
  return req.headers["authorization"] || "";
}

export function setupMcp(app) {
  app.all("/mcp", async (req, res) => {
    try {
      const sessionId = req.headers["mcp-session-id"];
      let transport;

      if (sessionId && transports.has(sessionId)) {
        const existingTransport = transports.get(sessionId);
        if (!(existingTransport instanceof StreamableHTTPServerTransport)) {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Bad Request: Session exists but uses a different transport protocol",
            },
            id: null,
          });
          return;
        }
        transport = existingTransport;
      } else if (!sessionId && req.method === "POST" && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            transports.set(newSessionId, transport);
          },
        });

        transport.onclose = () => {
          if (transport.sessionId) {
            transports.delete(transport.sessionId);
          }
        };

        const server = createMcpServer();
        await server.connect(transport);
      } else {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Bad Request: No valid session ID provided",
          },
          id: null,
        });
        return;
      }

      await mcpStorage.run({ authHeader: getAuthHeader(req) }, async () => {
        await transport.handleRequest(req, res, req.body);
      });
    } catch (err) {
      console.error("Error handling Streamable MCP request:", err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/api/mcp/sse", async (req, res) => {
    try {
      const transport = new SSEServerTransport("/api/mcp/messages", res);
      transports.set(transport.sessionId, transport);

      res.on("close", () => {
        transports.delete(transport.sessionId);
      });

      const server = createMcpServer();
      await server.connect(transport);
    } catch (err) {
      console.error("Error establishing MCP SSE connection:", err);
      res.status(500).send("Error establishing connection");
    }
  });

  app.post("/api/mcp/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const existingTransport = transports.get(sessionId);

    if (!(existingTransport instanceof SSEServerTransport)) {
      res.status(400).send("No active SSE MCP transport session found for this sessionId");
      return;
    }

    try {
      await mcpStorage.run({ authHeader: getAuthHeader(req) }, async () => {
        await existingTransport.handlePostMessage(req, res, req.body);
      });
    } catch (err) {
      console.error("Error handling MCP message:", err);
      if (!res.headersSent) {
        res.status(500).send("Error processing message");
      }
    }
  });

  console.log("  -> MCP:       Streamable endpoint enabled at /mcp");
  console.log("  -> MCP:       Legacy SSE endpoints enabled at /api/mcp/sse and /api/mcp/messages");
}
