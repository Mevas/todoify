# Migration `20200607114106`

This migration has been generated at 6/7/2020, 11:41:07 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE UNIQUE INDEX "User.name" ON "public"."User"("name")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200607084329..20200607114106
--- datamodel.dml
+++ datamodel.dml
@@ -2,9 +2,9 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 generator client {
   provider = "prisma-client-js"
@@ -12,9 +12,9 @@
 model User {
   id        Int         @id @default(autoincrement())
   createdAt DateTime    @default(now())
-  name      String
+  name      String      @unique
   password  String
   tasks     Task[]
 }
```


