import { defineTest } from 'jscodeshift/dist/testUtils';

describe('Upgrades knex file to 2.0 with typescript', () =>
{
    defineTest(
        __dirname,
        'knex_upgrade',
        {
            api: { report: console.log },
        },
        'knex_upgrade/seed'
        ,({
            parser: 'ts',
        })
    );
    defineTest(
        __dirname,
        'knex_upgrade',
        {
            api: { report: console.log },
        },
        'knex_upgrade/migration-arrow'
        ,({
            parser: 'ts',
        })
    );
    defineTest(
        __dirname,
        'knex_upgrade',
        {
            api: { report: console.log },
        },
        'knex_upgrade/migration'
        ,({
            parser: 'ts',
        })
    );
}
);
