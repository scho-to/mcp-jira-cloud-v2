import { Version2Client } from 'jira.js/version2';
import type { Issues as Issue } from 'jira.js/version2';
import type { IJiraClient, JiraConfig } from './types/index.js';

const DEFAULT_FIELDS: readonly string[] = ['summary', 'description', 'comment'];

/**
 * Jira API client implementation.
 * Follows SRP by only handling Jira API communication.
 * Follows DIP by implementing IJiraClient interface and accepting config via constructor.
 */
export class JiraClient implements IJiraClient {
  private readonly client: Version2Client;

  /**
   * Creates a new JiraClient with the given configuration.
   * @param config - Jira connection configuration (follows DIP)
   */
  constructor(config: JiraConfig) {
    this.client = new Version2Client({
      host: config.host,
      authentication: {
        basic: {
          email: config.email,
          apiToken: config.apiToken,
        },
      },
    });
  }

  async getTicket(
    ticketId: string,
    expand?: readonly string[],
    fields?: readonly string[]
  ): Promise<Issue> {
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
