const fs = require('fs');
const path = require('path');

jest.mock('../db/connection', () => {
  const { Sequelize } = require('sequelize');
  return new Sequelize('test', 'root', 'test', {
    dialect: 'mysql',
    logging: false,
  });
});

const modelsDir = path.join(__dirname, '..', 'models');
const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');

const parseMigrationTables = () => {
  const tables = {};

  for (const file of fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const match = source.match(/createTable\(['"]([^'"]+)['"],\s*\{([\s\S]*?)\n\s*\}\);/);

    if (!match) {
      continue;
    }

    const [, tableName, body] = match;
    tables[tableName.toLowerCase()] = new Set(
      [...body.matchAll(/^\s{6}([A-Za-z0-9_]+):\s*\{/gm)].map((columnMatch) => columnMatch[1])
    );
  }

  return tables;
};

const getModelTableName = (model) => {
  const tableName = model.getTableName();
  return typeof tableName === 'string' ? tableName : tableName.tableName;
};

describe('Sequelize models match migration columns', () => {
  it('does not reference columns missing from the migrated schema', () => {
    const migrationTables = parseMigrationTables();
    const mismatches = [];

    for (const file of fs.readdirSync(modelsDir).filter((name) => name.endsWith('.js'))) {
      if (file === 'sync.js') {
        continue;
      }

      const model = require(path.join(modelsDir, file));
      const tableName = getModelTableName(model);
      const migrationColumns = migrationTables[tableName.toLowerCase()];

      if (!migrationColumns) {
        mismatches.push(`${file}: no migration creates table "${tableName}"`);
        continue;
      }

      for (const [attributeName, attribute] of Object.entries(model.rawAttributes)) {
        const columnName = attribute.field || attributeName;

        if (!migrationColumns.has(columnName)) {
          mismatches.push(`${file}: ${attributeName} maps to missing column "${columnName}"`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });

  it('keeps opportunity legacy API names mapped to current snake_case columns', () => {
    const Opportunity = require('../models/opportunityModel');

    expect(Opportunity.rawAttributes.OpRegion.field).toBe('op_region');
    expect(Opportunity.rawAttributes.OpDescription.field).toBe('op_description');
    expect(Opportunity.rawAttributes.opportunityType.field).toBe('opportunity_type');
    expect(Opportunity.rawAttributes.createdAt.field).toBe('created_at');
    expect(Opportunity.rawAttributes.updatedAt.field).toBe('updated_at');
  });
});
