/**
 * Unit tests — validate middleware + schemas
 */
const { validate } = require('../middleware/validate');
const schemas = require('../middleware/schemas');

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const runMiddleware = (schema, body, target = 'body') => {
  const req = { body: {}, query: {}, params: {}, [target]: body };
  const res = mockRes();
  const next = jest.fn();
  validate(schema, target)(req, res, next);
  return { req, res, next };
};

// ── validate middleware ────────────────────────────────────────────────────────

describe('validate middleware', () => {
  it('calls next() when body is valid', () => {
    const { next, res } = runMiddleware(schemas.signIn, { email: 'a@b.com', password: 'secret' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 422 with field details when body is invalid', () => {
    const { res, next } = runMiddleware(schemas.signIn, { email: 'not-an-email', password: '' });
    expect(res.status).toHaveBeenCalledWith(422);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.error.details).toBeInstanceOf(Array);
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(next).not.toHaveBeenCalled();
  });

  it('replaces req.body with coerced/parsed data on success', () => {
    const { req } = runMiddleware(schemas.createPO, {
      poNumber: 'PO-001',
      poAmount: '5000',
      currencyCode: 'EUR',
    });
    // coerce should convert '5000' string → 5000 number
    expect(typeof req.body.poAmount).toBe('number');
    expect(req.body.poAmount).toBe(5000);
  });

  it('can validate req.query when target is query', () => {
    const profileSchema = schemas.updateProfile;
    const { next } = runMiddleware(profileSchema, { email: 'test@test.com' }, 'query');
    expect(next).toHaveBeenCalled();
  });
});

// ── schemas ───────────────────────────────────────────────────────────────────

describe('schemas — signIn', () => {
  it('passes with valid email + password', () => {
    const result = schemas.signIn.safeParse({ email: 'a@b.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = schemas.signIn.safeParse({ email: 'bad', password: '123456' });
    expect(result.success).toBe(false);
    const issues = result.error.issues || [];
    const emailIssue = issues.find((e) => e.path[0] === 'email');
    expect(emailIssue).toBeDefined();
  });

  it('fails with empty password', () => {
    const result = schemas.signIn.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
    const issues = result.error.issues || [];
    const passwordIssue = issues.find((e) => e.path[0] === 'password');
    expect(passwordIssue).toBeDefined();
  });
});

describe('schemas — createPO', () => {
  it('passes with required fields', () => {
    const result = schemas.createPO.safeParse({ poNumber: 'PO-1', poAmount: 1000 });
    expect(result.success).toBe(true);
  });

  it('fails with zero/negative amount', () => {
    const result = schemas.createPO.safeParse({ poNumber: 'PO-1', poAmount: 0 });
    expect(result.success).toBe(false);
  });

  it('coerces string amounts to numbers', () => {
    const result = schemas.createPO.safeParse({ poNumber: 'PO-1', poAmount: '2500' });
    expect(result.success).toBe(true);
    expect(result.data.poAmount).toBe(2500);
  });
});

describe('schemas — createInvoice', () => {
  it('passes with all required fields', () => {
    const result = schemas.createInvoice.safeParse({
      poId: 1,
      invoiceAmount: 500,
      forecastAmount: 600,
      invoiceDate: '2024-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('fails with invalid date', () => {
    const result = schemas.createInvoice.safeParse({
      poId: 1,
      invoiceAmount: 500,
      forecastAmount: 600,
      invoiceDate: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });
});

describe('schemas — createOpportunity', () => {
  it('passes with required opportunity fields', () => {
    const result = schemas.createOpportunity.safeParse({
      OpDescription: 'New Deal',
      OpUnit: 'Consulting',
      AssociatedWP: 'WP-1',
      CustomerContactPoint: 'customer@example.com',
      OpRegion: 'EU',
    });
    expect(result.success).toBe(true);
  });

  it('fails with invalid status', () => {
    const result = schemas.createOpportunity.safeParse({
      OpDescription: 'Deal',
      OpUnit: 'Consulting',
      AssociatedWP: 'WP-1',
      CustomerContactPoint: 'customer@example.com',
      OpRegion: 'EU',
      status: 'Unknown',
    });
    expect(result.success).toBe(false);
  });
});

describe('schemas — updateOpportunity', () => {
  it('fails with empty object (refine check)', () => {
    const result = schemas.updateOpportunity.safeParse({});
    expect(result.success).toBe(false);
  });

  it('passes with at least one valid field', () => {
    const result = schemas.updateOpportunity.safeParse({ status: 'Won' });
    expect(result.success).toBe(true);
  });
});
