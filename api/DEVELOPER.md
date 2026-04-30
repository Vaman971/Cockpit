# BluebirdCockpit API — Developer Guide

Quick reference for working on the API codebase.

---

## Directory Map

```
api/src/
├── controllers/        One file per resource — business logic lives here
│   ├── authController.js
│   ├── projectController.js
│   ├── opportunityController.js
│   ├── poController.js
│   ├── invoiceController.js
│   ├── missionController.js
│   ├── teamController.js
│   ├── profileController.js
│   ├── revenueController.js
│   ├── revenueInvoiceController.js
│   ├── extensionController.js      ← NEW (canonical spelling)
│   ├── extentionController.js      ← DEPRECATED (alias routes only)
│   ├── extensionInvoiceController.js  ← NEW
│   ├── extentionInvoiceController.js  ← DEPRECATED
│   ├── savingsController.js
│   ├── financeController.js
│   ├── newFinanceController.js
│   ├── analyticsController.js
│   ├── customerController.js
│   └── userController.js
│
├── models/             One file per DB table — Sequelize model definitions
│   ├── extensionModel.js     ← NEW
│   ├── extentionModel.js     ← DEPRECATED (kept for alias routes)
│   ├── extensionInvoice.js   ← NEW
│   ├── extentionInvoice.js   ← DEPRECATED
│   └── sync.js               Requires all models, used at startup
│
├── routes/             Thin Express routers — mount middleware + controllers
│   ├── extensionRoute.js     ← NEW canonical (/extension)
│   ├── extentionRoute.js     ← DEPRECATED alias (/extention)
│   └── ...
│
├── middleware/
│   ├── validate.js     Zod middleware factory — validate(schema) → 422 on fail
│   ├── schemas.js      All Zod schemas in one place
│   ├── errorHandler.js Global error handler (must be last in Express chain)
│   ├── rateLimiter.js  apiLimiter (200/15min) + authLimiter (10/15min)
│   └── requestLogger.js  HTTP request logging via Morgan + Winston
│
├── utils/
│   ├── logger.js       Winston logger singleton
│   ├── verifyToken.js  JWT cookie → req.user
│   └── verifyAuth.js   Role check middleware
│
└── db/
    ├── config.js       Sequelize CLI config (reads from .env)
    ├── connection.js   Sequelize instance (singleton)
    ├── migrations/     20 migration files — run in order
    └── seeders/        Initial data seeders
```

---

## Writing a New Controller

Every controller must follow this pattern:

```js
const logger = require('../utils/logger');

const myHandler = async (req, res, next) => {
  try {
    // 1. Query DB
    const result = await MyModel.findByPk(req.params.id);

    // 2. Guard 404s
    if (!result) {
      return res.status(404).json({ success: false, error: 'Not found.' });
    }

    // 3. Return standardised response
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    // 4. Always pass to global error handler — never swallow errors
    logger.error('myHandler error:', error);
    next(error);
  }
};
```

**Status code cheatsheet:**

| Action | Code |
|--------|------|
| Read / Update | 200 |
| Create | 201 |
| Missing required body field | 400 |
| Not found | 404 |
| Duplicate resource | 409 |
| Validation failed (Zod) | 422 |

---

## Adding Validation to a Route

1. **Add schema** to `src/middleware/schemas.js`:

```js
const createWidget = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  value: z.coerce.number().positive(),
});
```

2. **Wire it** in the route file:

```js
const { validate } = require('../middleware/validate');
const schemas = require('../middleware/schemas');

router.post('/create', verifyToken, verifyAuth, validate(schemas.createWidget), createWidget);
```

That's it — invalid requests get a 422 before the controller is ever called.

---

## Writing Tests

Tests live in `src/__tests__/`. Each test file should:

1. Mock all Sequelize models at the top — `jest.mock('../models/...')`
2. Import the controller functions directly
3. Use `mockRes()` / `mockRow()` helpers from `helpers/modelMock.js`

```js
const { mockRow } = require('./helpers/modelMock');

jest.mock('../models/myModel', () => ({
  findByPk: jest.fn(),
  create: jest.fn(),
  afterCreate: jest.fn(),  // ← must mock all hooks
}));

const MyModel = require('../models/myModel');
const { getById } = require('../controllers/myController');

it('returns 404 when not found', async () => {
  MyModel.findByPk.mockResolvedValue(null);
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await getById({ params: { id: '999' } }, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(404);
});
```

---

## Model Hooks — Rules

Sequelize hooks (`afterSave`, `afterUpdate`, `beforeDestroy`, etc.) **must**:

- ✅ Use `logger.error()` on failures
- ✅ Use `Promise.all()` for concurrent child-record updates
- ❌ Never reference `res` — hooks run outside HTTP context
- ❌ Never re-throw inside a hook — use `logger.error` and return

---

## Git Workflow

Husky runs **automatically** on every `git commit`:

```
staged src/**/*.js
  → ESLint --fix
  → Prettier --write
  → [commit proceeds if no errors, blocked if errors remain]
```

To bypass in an emergency: `git commit --no-verify` (use sparingly).

---

## Useful Commands

```bash
# Development
npm run dev               # Start API with hot-reload (nodemon)
npm run lint              # Check for lint errors
npm run lint:fix          # Auto-fix lint errors
npm run format            # Format all source files

# Testing
npm test                  # All tests + coverage report
npx jest --watch          # Watch mode

# Database
npm run db:migrate        # Apply pending migrations
npm run db:migrate:undo   # Roll back all migrations
npm run db:seed           # Insert seed data
npm run db:reset          # Full reset (⚠️ destroys all data)

# Generate a new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Known Tech Debt

| Item | Location | Notes |
|------|----------|-------|
| Large file | `analyticsController.js` (2000+ lines) | Candidate for modularisation |
| Deprecated routes | `/extention`, `/extentionInvoice` | Remove once frontend migrated |
| Deprecated models | `extentionModel.js`, `extentionInvoice.js` | Remove once deprecated routes removed |
| `console.log` in finance/analytics | `financeController.js` | Legacy — warnings only, not errors |
| Test coverage gaps | `analyticsController`, `financeController`, `teamController` | Prioritise for next sprint |
