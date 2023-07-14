import knex from "knex"
import config from "../config"

/**
 * PostgreSQL Connection
 */
 const client = knex({
  client: 'pg',
  connection: {
    host: config.postgres.host,
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database
  },
  searchPath: ['knex', 'public'],
});

export default client;