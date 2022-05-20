import { Knex } from "knex";
export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('payslips', function(table) {
    table.integer('ferie_fri_dage_days').defaultsTo(0)
  })
};

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('payslips', function(table) {
    table.dropColumn('ferie_fri_dage_days')
  })
};
