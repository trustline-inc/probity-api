# Liquibase

Set `./dev` or `./test` as the working directory.

Generate a changelog:

```
liquibase \
  --changeLogFile=../db.changelog.xml \
  --classpath=../postgresql-42.2.18.jar \
  generateChangeLog
```

Add a changeset:

Update `db.changelog.xml`, then run:

```
liquibase \
  --changeLogFile=../db.changelog.xml \
  --classpath=../postgresql-42.2.18.jar \
  update
```

Perform a rollback:

```
liquibase \
  --changeLogFile=../db.changelog.xml \
  --classpath=../postgresql-42.2.18.jar \
  rollbackCount 1
```