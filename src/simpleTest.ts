import { JiraClient } from './jira-client';

async function runTest() {
  const ticketId = process.argv[2];

  if (!ticketId) {
    console.error('Usage: node build/simpleTest.js <JIRA_TICKET_ID>');
    process.exit(1);
  }

  try {
    const jiraClient = new JiraClient();
    // Call getTicket without the explicit fields array
    const ticket = await jiraClient.getTicket(ticketId); // No expand, no fields

    console.log(`Summary: ${ticket.fields.summary}`);
    console.log(`Description: ${ticket.fields.description}`);
    // Add console.log for comments
    console.log(`Comments: ${JSON.stringify(ticket.fields.comment, null, 2)}`);

  } catch (error: any) {
    console.error(`Error fetching ticket ${ticketId}: ${error.message}`);
    process.exit(1);
  }
}

runTest();