import type { Issues as Issue } from 'jira.js/version2';

/**
 * Configuration for Jira client connection.
 * Follows ISP by defining only what's needed for connection.
 */
export interface JiraConfig {
  readonly host: string;
  readonly email: string;
  readonly apiToken: string;
}

/**
 * Arguments for fetching a Jira ticket.
 */
export interface GetTicketArgs {
  readonly ticket_id: string;
  readonly expand?: readonly string[];
  readonly fields?: readonly string[];
}

/**
 * Interface for Jira operations.
 * Follows DIP by defining an abstraction that high-level modules depend on.
 * Follows ISP by only exposing methods needed by consumers.
 */
export interface IJiraClient {
  getTicket(ticketId: string, expand?: readonly string[], fields?: readonly string[]): Promise<Issue>;
}
