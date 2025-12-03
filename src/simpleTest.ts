import { JiraClient } from './jira-client.js';
import { createJiraConfigFromEnv } from './config/index.js';

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

    // Assuming 'ticket' itself contains the fields directly, or the type is too broad.
    // We'll cast to `any` for now to bypass TS error and see at runtime if data exists.
    const ticketData = ticket as unknown as Record<string, unknown>;

    console.log(`Summary: ${ticketData['summary']}`);
    console.log(`Description: ${ticketData['description']}`);
    // Add console.log for comments
    // The 'comment' field is often an object with a 'comments' array.
    // Let's log the whole comment object if it exists, or just ticketData.comment
    console.log(`Comments: ${JSON.stringify(ticketData['comment'], null, 2)}`);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching ticket ${ticketId}: ${message}`);
    process.exit(1);
  }
}

runTest();