import { Version2Client } from 'jira.js';
import * as dotenv from 'dotenv';
import { Issue } from 'jira.js/out/version2/models';

dotenv.config();

export class JiraClient {
  private client: Version2Client;

  constructor() {
    if (!process.env.JIRA_URL || !process.env.JIRA_USER_EMAIL || !process.env.JIRA_API_TOKEN) {
      throw new Error('Missing required Jira environment variables');
    }

    this.client = new Version2Client({
      host: process.env.JIRA_URL,
      authentication: {
        basic: {
          email: process.env.JIRA_USER_EMAIL,
          apiToken: process.env.JIRA_API_TOKEN,
        },
      },
    });
  }

  async getTicket(ticketId: string, expand?: string[], fields?: string[]): Promise<Issue> {
    try {
      const params = {
        issueIdOrKey: ticketId,
        expand: expand?.join(','),
        fields
      };
      return await this.client.issues.getIssue(params);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch Jira ticket ${ticketId}: ${message}`);
    }
  }
}
