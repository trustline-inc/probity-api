# Probity API

Secure backend for [Probity UI](https://github.com/trustline-inc/probity-ui) integrated with Modern Treasury for money movement and Plaid for identity verification and compliance.

## Getting Started

After cloning the repo run `yarn` in the project to install dependencies.

Next, [install Postgres](https://gist.github.com/ibraheem4/ce5ccd3e4d7a65589ce84f2a3b7c23a3).

Then set up a local dev database:

> You should also do this for a `probity_test` database.

```
$ psql -d postgres
psql (14.5 (Homebrew))
Type "help" for help.

postgres=# CREATE DATABASE probity;
CREATE DATABASE
postgres=# CREATE ROLE probity;
CREATE ROLE
postgres=# ALTER ROLE probity WITH PASSWORD '**************';
ALTER ROLE
postgres=# ALTER DATABASE probity OWNER TO probity;
ALTER DATABASE
postgres=# ALTER ROLE "probity" WITH LOGIN;
ALTER ROLE
```

For a fresh database, you'll have to run the database migrations with [Liquibase](https://www.liquibase.org/download). See the [Liquibase commands](./src/db/README.md) for further usage.

Set the environment variables in the appropriate `.env.<environment>` file.

Finally, start the server:

```
yarn run dev
```
