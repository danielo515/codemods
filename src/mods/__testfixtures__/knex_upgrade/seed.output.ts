import { Knex } from "knex";
export async function seed(knex: Knex): Promise<void> {
  return knex('uk_companies')
    .del()
    .then(function () {
      return knex('uk_companies').insert([]);
  })
};
