# Jira Requester MCP Server

This is a Message Communication Protocol (MCP) server designed to interact with the Jira API (v2 client) to fetch ticket information.

## Prerequisites

- Node.js (Recommended version: >= 18.x)
- npm or yarn
- Jira Cloud instance
- Jira API Token

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/scho-to/mcp-jira-cloud-v2.git
    cd mcp-jira-cloud-v2
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

## Configuration

This server requires environment variables for Jira authentication and connection:

- `JIRA_BASE_URL`: The base URL of your Jira instance (e.g., `https://your-domain.atlassian.net`).
- `JIRA_USER_EMAIL`: The email address associated with your Jira account.
- `JIRA_API_TOKEN`: Your Jira API token. You can generate one from your Atlassian account settings.

Create a `.env` file in the project root and add these variables:

```dotenv
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_USER_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
```

**Important:** Add `.env` to your `.gitignore` file to avoid committing sensitive credentials.

## Usage

1.  **Start the server:**
    Using npm:

    ```bash
    npm start
    ```

    Or using yarn:

    ```bash
    yarn start
    ```

2.  **Interact via MCP:**
    Once the server is running, it will listen for MCP requests. Clients can interact with it by sending tool calls.

## Testing

You can test the Jira client functionality directly using the `simpleTest.ts` script.

2.  **Run the test script:**
    Provide a Jira ticket ID as an argument.
    Using npm:

    ```bash
    npm test <JIRA_TICKET_ID>
    ```

    Or using yarn:

    ```bash
    yarn test <JIRA_TICKET_ID>
    ```

    Replace `<JIRA_TICKET_ID>` with an actual ticket ID from your Jira instance.

3.  **Run the test script in development mode (with hot-reloading):**
    Using npm:
    ```bash
    npm run dev <JIRA_TICKET_ID>
    ```
    Or using yarn:
    ```bash
    yarn dev <JIRA_TICKET_ID>
    ```
    This is useful for rapid iteration during development.

## Building

The project is built using the TypeScript compiler. This compiles the TypeScript source files (`.ts`) into JavaScript files (`.js`) in the `build` directory.

To build the project:

Using npm:

```bash
npm run build
```

Or using yarn:

```bash
yarn run build
```

## MCP Server Configuration

To set up this server within an MCP environment, add the following configuration to your MCP config file:

```json
{
  "mcpServers": {
    "jira-requester": {
      "command": "node",
      "env": {
        "JIRA_URL": "https://your-instance.atlassian.net",
        "JIRA_USER_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      },
      "args": ["/path/to/mcp-jira-cloud-v2/build/index.js"]
    }
  }
}
```

**Note:** Replace placeholders like `https://your-instance.atlassian.net`, `your-email@example.com`, `your-api-token`, and `/path/to/mcp-jira-cloud-v2/build/index.js` with your actual Jira instance URL, credentials, and the correct path to the built `index.js` file.

**Security Warning:** Avoid committing sensitive information like API tokens directly into your configuration files. Consider using environment variables or a secrets management system.

### Available Tools

#### `get_jira_ticket`

Fetches details for a specific Jira ticket.

**Parameters:**

- `ticket_id` (string, required): The ID of the Jira ticket (e.g., `PROJ-123`).
- `fields` (array of strings, optional): Specify which fields to include in the response. If omitted, default fields might be returned.
- `expand` (array of strings, optional): Specify Jira fields to expand (e.g., `changelog`, `renderedFields`).

**Example MCP Request:**

```json
{
  "tool_name": "get_jira_ticket",
  "parameters": {
    "ticket_id": "PROJ-123",
    "fields": ["summary", "status", "assignee"],
    "expand": ["renderedFields"]
  }
}
```
