import type { JiraConfig } from '../types/jira.js';

/**
 * Creates Jira configuration from environment variables.
 * Follows SRP by only handling configuration creation.
 * Follows DIP by returning an interface type.
 * 
 * @throws Error if required environment variables are missing
 */
export function createJiraConfigFromEnv(): JiraConfig {
  const host = process.env['JIRA_URL'];
  const email = process.env['JIRA_USER_EMAIL'];
  const apiToken = process.env['JIRA_API_TOKEN'];

  if (!host || !email || !apiToken) {
    const missing: string[] = [];
    if (!host) missing.push('JIRA_URL');
    if (!email) missing.push('JIRA_USER_EMAIL');
    if (!apiToken) missing.push('JIRA_API_TOKEN');
    
    throw new Error(`Missing required Jira environment variables: ${missing.join(', ')}`);
  }

  return { host, email, apiToken };
}
