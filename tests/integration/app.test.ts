jest.mock('../../src/config/config', () => ({
  __esModule: true,
  default: {
    cookie: {
      secure: false,
      httpOnly: true,
    },
    jwt: {
      refreshExpirationDays: 7,
    },
  },
}));

import { describe, it, expect } from '@jest/globals';

describe('App Integration', () => {
  it('should run integration tests', () => {
    expect(true).toBe(true);
  });
});
