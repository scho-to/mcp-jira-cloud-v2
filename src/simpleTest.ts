import { JiraClient } from './jira-client';

async function runTest() {
  const ticketId = process.argv[2];

  if (!ticketId) {
    console.error('Usage: node build/simpleTest.js <JIRA_TICKET_ID>');
    process.exit(1);
  }

  try {
    const jiraClient = new JiraClient();
    const ticket = await jiraClient.getTicket(ticketId, ['summary', 'description']);

    console.log(`Summary: ${ticket.fields.summary}`);
    console.log(`Description: ${ticket.fields.description}`);

  } catch (error: any) {
    console.error(`Error fetching ticket ${ticketId}: ${error.message}`);
    process.exit(1);
  }
}

runTest();