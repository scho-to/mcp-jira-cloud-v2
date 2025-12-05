import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createJiraConfigFromEnv } from './jira-config.js';

describe('createJiraConfigFromEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create config when all env vars are present', () => {
    process.env['JIRA_URL'] = 'https://test.jira.com';
    process.env['JIRA_USER_EMAIL'] = 'test@example.com';
    process.env['JIRA_API_TOKEN'] = 'test-token';

    const config = createJiraConfigFromEnv();

    expect(config).toEqual({
      host: 'https://test.jira.com',
      email: 'test@example.com',
      apiToken: 'test-token',
    });
  });

  it('should throw error when JIRA_URL is missing', () => {
    process.env['JIRA_USER_EMAIL'] = 'test@example.com';
    process.env['JIRA_API_TOKEN'] = 'test-token';
    delete process.env['JIRA_URL'];

    expect(() => createJiraConfigFromEnv()).toThrow(
      'Missing required Jira environment variables: JIRA_URL'
    );
  });

  it('should throw error when JIRA_USER_EMAIL is missing', () => {
    process.env['JIRA_URL'] = 'https://test.jira.com';
    process.env['JIRA_API_TOKEN'] = 'test-token';
    delete process.env['JIRA_USER_EMAIL'];

    expect(() => createJiraConfigFromEnv()).toThrow(
      'Missing required Jira environment variables: JIRA_USER_EMAIL'
    );
  });

  it('should throw error when JIRA_API_TOKEN is missing', () => {
    process.env['JIRA_URL'] = 'https://test.jira.com';
    process.env['JIRA_USER_EMAIL'] = 'test@example.com';
    delete process.env['JIRA_API_TOKEN'];

    expect(() => createJiraConfigFromEnv()).toThrow(
      'Missing required Jira environment variables: JIRA_API_TOKEN'
    );
  });

  it('should list all missing variables in error message', () => {
    delete process.env['JIRA_URL'];
    delete process.env['JIRA_USER_EMAIL'];
    delete process.env['JIRA_API_TOKEN'];

    expect(() => createJiraConfigFromEnv()).toThrow(
      'Missing required Jira environment variables: JIRA_URL, JIRA_USER_EMAIL, JIRA_API_TOKEN'
    );
  });
});
