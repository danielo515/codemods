exports.up = function(knex) {
  return knex.schema.table('payslips', function(table) {
    table.integer('ferie_fri_dage_days').defaultsTo(0)
  })
}

exports.down = function(knex) {
  return knex.schema.table('payslips', function(table) {
    table.dropColumn('ferie_fri_dage_days')
  })
}
