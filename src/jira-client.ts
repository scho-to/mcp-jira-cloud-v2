import { createCloudClient, type CloudClient } from 'jira.js';
import type { Issue } from 'jira.js/cloud';
import type { IJiraClient, JiraConfig } from './types/index.js';

const DEFAULT_FIELDS: readonly string[] = ['summary', 'description', 'comment'];
const TICKET_ID_REGEX = /^[A-Za-z0-9]+-\d+$/;

/**
 * Jira API client implementation.
 * Follows SRP by only handling Jira API communication.
 * Follows DIP by implementing IJiraClient interface and accepting config via constructor.
 */
export class JiraClient implements IJiraClient {
  private readonly client: CloudClient;

  /**
   * Creates a new JiraClient with the given configuration.
   * @param config - Jira connection configuration (follows DIP)
   */
  constructor(config: JiraConfig) {
    this.client = createCloudClient({
      host: config.host,
      auth: {
        type: 'basic',
        email: config.email,
        apiToken: config.apiToken,
      },
    });
  }

  async getTicket(
    ticketId: string,
    expand?: readonly string[],
    fields?: readonly string[]
  ): Promise<Issue> {
    if (!TICKET_ID_REGEX.test(ticketId)) {
      throw new Error(`Invalid ticket ID format: ${ticketId}`);
    }

    try {
      const effectiveFields = fields && fields.length > 0 ? fields : DEFAULT_FIELDS;
      const params = {
        issueIdOrKey: ticketId,
        expand: expand?.join(','),
        fields: effectiveFields as string[]
      };
      return await this.client.issues.getIssue(params);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch Jira ticket ${ticketId}: ${message}`);
    }
  }
}
