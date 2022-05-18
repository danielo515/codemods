exports.seed = function (knex, Promise) {
  return knex('uk_companies')
    .del()
    .then(function () {
      return knex('uk_companies').insert([]);
  })
};
