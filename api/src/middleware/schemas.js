/**
 * Zod validation schemas for all API routes.
 * Centralised here to keep routes thin and testable.
 */
const { z } = require('zod');

// ─── Shared atoms ─────────────────────────────────────────────────────────────

const positiveInt = z.coerce.number().int().positive();
const optionalString = z.string().optional();
const dateString = z
  .string()
  .refine((v) => !isNaN(Date.parse(v)), { message: 'Must be a valid date string.' });
const optionalDate = dateString.optional();

// ─── Auth ─────────────────────────────────────────────────────────────────────

const signIn = z.object({
  email: z.string().email({ message: 'Valid email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// ─── Users ────────────────────────────────────────────────────────────────────

const createUser = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  email: z.string().email(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  user_type: z.enum(['admin', 'user', 'manager']).default('user'),
});

const updateUser = z
  .object({
    username: optionalString,
    email: z.string().email().optional(),
    user_type: z.enum(['admin', 'user', 'manager']).optional(),
    active: z.boolean().optional(),
    burden_rate: z.coerce.number().nonnegative().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' });

const updatePassword = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
});

// ─── Projects ─────────────────────────────────────────────────────────────────

const createProject = z.object({
  project_title: z.string().min(1, { message: 'Project title is required.' }),
  cluster: optionalString,
  region: optionalString,
  siglum: optionalString,
  projectType: optionalString,
  oppurtunity_id: z.coerce.number().int().positive().optional(),
  active: z.boolean().default(true),
});

const updateProject = z
  .object({
    project_title: optionalString,
    status: z.enum(['active', 'closed', 'on-hold', 'completed']).optional(),
    active: z.boolean().optional(),
    cluster: optionalString,
    region: optionalString,
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' });

// ─── Opportunities ────────────────────────────────────────────────────────────

const createOpportunity = z.object({
  OpDescription: z.string().min(1, { message: 'Opportunity description is required.' }),
  OpUnit: z.string().min(1, { message: 'Opportunity unit is required.' }),
  AssociatedWP: z.string().min(1, { message: 'Associated work package is required.' }),
  CustomerContactPoint: z.string().min(1, { message: 'Customer contact point is required.' }),
  cluster: optionalString,
  OpRegion: z.string().min(1, { message: 'Opportunity region is required.' }),
  Siglum: optionalString,
  status: z
    .enum(['Prospection', 'Advanced', 'Proposal', 'Won', 'Lost', 'Hold'])
    .default('Prospection'),
  ExpectedDealSize: z.coerce.number().nonnegative().optional(),
  currencyCode: z.string().length(3).default('EUR'),
  MissionStartDate: optionalDate,
  MissionEndDate: optionalDate,
});

const updateOpportunity = z
  .object({
    status: z.enum(['Prospection', 'Advanced', 'Proposal', 'Won', 'Lost', 'Hold']).optional(),
    ExpectedDealSize: z.coerce.number().nonnegative().optional(),
    MarkedOpp: z.boolean().optional(),
    cluster: optionalString,
    OpRegion: optionalString,
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' });

// ─── Purchase Orders ──────────────────────────────────────────────────────────

const createPO = z.object({
  poNumber: z.string().min(1, { message: 'PO number is required.' }),
  poAmount: z.coerce.number().positive({ message: 'PO amount must be positive.' }),
  poDate: optionalDate,
  poEndDate: optionalDate,
  currencyCode: z.string().length(3).default('EUR'),
  cluster: optionalString,
  region: optionalString,
});

const updatePO = z
  .object({
    poStatus: z.enum(['pending', 'open', 'closed']).optional(),
    poAmount: z.coerce.number().positive().optional(),
    currencyCode: z.string().length(3).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' });

// ─── Invoices ─────────────────────────────────────────────────────────────────

const createInvoice = z.object({
  poId: positiveInt,
  invoiceAmount: z.coerce.number().nonnegative(),
  forecastAmount: z.coerce.number().nonnegative(),
  invoiceDate: dateString,
});

const updateInvoice = z
  .object({
    invoiceAmount: z.coerce.number().nonnegative().optional(),
    forecastAmount: z.coerce.number().nonnegative().optional(),
    invoiceDate: optionalDate,
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' });

// ─── Revenue ──────────────────────────────────────────────────────────────────

const createRevenue = z.object({
  revenueSource: z.string().min(1).optional(),
  currencyCode: z.string().length(3).default('EUR'),
  cluster: optionalString,
  region: optionalString,
});

const createRevenueInvoice = z.object({
  forecastRevenue: z.coerce.number().nonnegative(),
  actualRevenue: z.coerce.number().nonnegative(),
  plannedRevenue: z.coerce.number().nonnegative(),
  invoiceDate: dateString,
  status: z.string().optional(),
});

// ─── Extensions ───────────────────────────────────────────────────────────────

const createExtension = z.object({
  extensionProjectId: positiveInt,
  currencyCode: z.string().length(3).default('EUR'),
  likeliness: z.enum(['High', 'Medium', 'Low']).default('Low'),
  revenueProjection: z.coerce.number().nonnegative().optional(),
});

const createExtensionInvoice = z.object({
  revenueProjection: z.coerce.number().nonnegative(),
  actualRevenue: z.coerce.number().nonnegative(),
  invoiceDate: z.string(),
});

// ─── Teams ────────────────────────────────────────────────────────────────────

const createTeam = z.object({
  team_name: z.string().min(1, { message: 'Team name is required.' }),
  active: z.boolean().default(true),
  users: z.array(z.object({ id: positiveInt, active: z.boolean().default(true) })).min(1),
});

const addUsersToTeam = z.object({
  userIds: z.array(positiveInt).min(1, { message: 'At least one user ID is required.' }),
});

const updateUserTeams = z.object({
  occupancy: z.coerce.number().min(0).max(100),
});

// ─── Profile ──────────────────────────────────────────────────────────────────

const updateProfile = z.object({
  email: z.string().email().optional(),
  designation: optionalString,
  bio: optionalString,
  location: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  contactDetails: optionalString,
  contactCode: optionalString,
});

// ─── Mission Cards ────────────────────────────────────────────────────────────

const createMission = z.object({
  projMissionId: positiveInt,
  missionDescription: z.string().min(1),
  missionStartDate: optionalDate,
  missionEndDate: optionalDate,
  cluster: optionalString,
  region: optionalString,
  missionType: optionalString,
});

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  signIn,
  createUser,
  updateUser,
  updatePassword,
  createProject,
  updateProject,
  createOpportunity,
  updateOpportunity,
  createPO,
  updatePO,
  createInvoice,
  updateInvoice,
  createRevenue,
  createRevenueInvoice,
  createExtension,
  createExtensionInvoice,
  createTeam,
  addUsersToTeam,
  updateUserTeams,
  updateProfile,
  createMission,
};
