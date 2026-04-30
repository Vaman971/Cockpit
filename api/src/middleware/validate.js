/**
 * validate — Zod request validation middleware factory.
 *
 * Usage:
 *   router.post('/signIn', validate(schemas.signIn), signIn);
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} [target='body'] - which part of req to validate
 */
const { ZodError } = require('zod');

const validate =
  (schema, target = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      // Zod v4 uses `.issues`, v3 used `.errors` — support both
      const issues = result.error.issues || result.error.errors || [];
      const errors = issues.map((e) => ({
        field: e.path.join('.') || 'root',
        message: e.message,
      }));
      return res.status(422).json({
        success: false,
        error: { message: 'Validation failed.', details: errors },
      });
    }
    // Replace the target with the parsed (coerced) data
    req[target] = result.data;
    return next();
  };

module.exports = { validate, ZodError };
