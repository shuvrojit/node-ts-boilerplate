import ApiError from '../../../src/utils/ApiError';

describe('ApiError', () => {
  test('should create an operational error', () => {
    const message = 'Resource not found';
    const statusCode = 404;
    const error = new ApiError(statusCode, message);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(statusCode);
    expect(error.message).toBe(message);
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });

  test('should create an error with custom stack', () => {
    const message = 'Resource not found';
    const statusCode = 404;
    const stack = 'Custom stack trace';
    const error = new ApiError(statusCode, message, true, stack);

    expect(error.stack).toBe(stack);
  });

  test('should create a non-operational error', () => {
    const message = 'Internal server error';
    const statusCode = 500;
    const error = new ApiError(statusCode, message, false);

    expect(error.isOperational).toBe(false);
  });
});
