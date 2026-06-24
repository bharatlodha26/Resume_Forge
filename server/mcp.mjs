import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { AsyncLocalStorage } from "async_hooks";

const PORT = process.env.PORT || 3001;
const LOCAL_API_BASE = `http://localhost:${PORT}`;

// Storage to pass the incoming HTTP request headers (specifically Authorization) to the tool handler context.
export const mcpStorage = new AsyncLocalStorage();

// Active SSE transport sessions
const transports = new Map();

// Initialize the MCP Server
export const mcpServer = new McpServer({
  name: "ResumeForge MCP Server",
  version: "2.0.0",
});

// Helper: Make local authenticated HTTP request
async function localApiCall(method, path, body = null, authHeader = "") {
  const url = `${LOCAL_API_BASE}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (authHeader) {
    options.headers["Authorization"] = authHeader;
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

// ── MCP Tools ────────────────────────────────────────────────────────────────

// 1. Get Master Resume
mcpServer.tool(
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

// 2. Save Master Resume
mcpServer.tool(
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

// 3. Generate PDF
mcpServer.tool(
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

// 4. Email Resume
mcpServer.tool(
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

// 5. List Templates
mcpServer.tool(
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

// ── Express Integration Handlers ─────────────────────────────────────────────

export function setupMcp(app) {
  // GET endpoint to establish SSE stream connection
  app.get("/api/mcp/sse", async (req, res) => {
    try {
      const transport = new SSEServerTransport("/api/mcp/messages", res);
      transports.set(transport.sessionId, transport);

      res.on("close", () => {
        transports.delete(transport.sessionId);
      });

      await mcpServer.connect(transport);
    } catch (err) {
      console.error("Error establishing MCP SSE connection:", err);
      res.status(500).send("Error establishing connection");
    }
  });

  // POST endpoint to handle JSON-RPC messages from client
  app.post("/api/mcp/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports.get(sessionId);

    if (!transport) {
      res.status(400).send("No active MCP transport session found for this sessionId");
      return;
    }

    // Capture the Authorization header from ChatGPT request
    const authHeader = req.headers["authorization"] || "";

    try {
      await mcpStorage.run({ authHeader }, async () => {
        await transport.handlePostMessage(req, res);
      });
    } catch (err) {
      console.error("Error handling MCP message:", err);
      if (!res.headersSent) {
        res.status(500).send("Error processing message");
      }
    }
  });

  console.log("  → MCP:       Endpoints enabled at /api/mcp/sse and /api/mcp/messages");
}
