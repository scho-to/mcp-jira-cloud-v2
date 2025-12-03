import { JiraClient } from './jira-client.js';
import { createJiraConfigFromEnv } from './config/index.js';

/**
 * Interface for ticket fields returned by Jira API.
 * This represents the subset of fields we're interested in for testing.
 */
interface TicketFields {
  summary?: string;
  description?: string;
  comment?: {
    comments?: Array<{
      body?: string;
      author?: { displayName?: string };
    }>;
  };
}

/**
 * Interface for the Jira issue response structure.
 */
interface JiraIssueResponse {
  fields?: TicketFields;
}

async function runTest(): Promise<void> {
  const ticketId = process.argv[2];

  if (!ticketId) {
    console.error('Usage: node build/simpleTest.js <JIRA_TICKET_ID>');
    process.exit(1);
  }

  try {
    const config = createJiraConfigFromEnv();
    const jiraClient = new JiraClient(config);
    // Call getTicket without the explicit fields array
    const ticket = await jiraClient.getTicket(ticketId); // No expand, no fields

    // Cast to proper interface structure
    const ticketData = ticket as JiraIssueResponse;
    const fields = ticketData.fields;

    console.log(`Summary: ${fields?.summary ?? 'N/A'}`);
    console.log(`Description: ${fields?.description ?? 'N/A'}`);
    // The 'comment' field is often an object with a 'comments' array.
    console.log(`Comments: ${JSON.stringify(fields?.comment, null, 2)}`);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching ticket ${ticketId}: ${message}`);
    process.exit(1);
  }
}

runTest();