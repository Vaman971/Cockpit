/**
 * Unit tests — errorHandler middleware
 */

// We test the middleware directly, no need to boot the full app
const errorHandler = require('../middleware/errorHandler');

const mockReq = (overrides = {}) => ({
  method: 'GET',
  path: '/test',
  body: {},
  params: {},
  query: {},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler middleware', () => {
  it('returns statusCode from err.statusCode', () => {
    const err = { statusCode: 422, message: 'Unprocessable' };
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ message: 'Unprocessable' }),
      })
    );
  });

  it('returns 500 as default status code', () => {
    const err = new Error('Unknown error');
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('includes stack trace in development mode', () => {
    const savedEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const err = new Error('Dev error');
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.error.stack).toBeDefined();
    process.env.NODE_ENV = savedEnv;
  });

  it('does not include stack trace in production mode', () => {
    const savedEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = new Error('Prod error');
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.error.stack).toBeUndefined();
    process.env.NODE_ENV = savedEnv;
  });

  it('uses err.status as fallback status code', () => {
    const err = { status: 403, message: 'Forbidden' };
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
