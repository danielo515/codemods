exports.up = (knex) => {
  return knex.schema.table('payslips', function(table) {
    table.integer('ferie_fri_dage_days').defaultsTo(0)
  })
}

exports.down = (knex) => {
  return knex.schema.table('payslips', function(table) {
    table.dropColumn('ferie_fri_dage_days')
  })
}
