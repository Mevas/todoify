# Migration `20200607230319`

This migration has been generated at 6/7/2020, 11:03:19 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Task" DROP COLUMN "status",
ADD COLUMN "done" boolean  NOT NULL DEFAULT false;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200607230054..20200607230319
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
@@ -22,8 +22,8 @@
   id         Int        @id @default(autoincrement())
   createdAt  DateTime   @default(now())
   updatedAt  DateTime   @updatedAt
   body       String
-  status     Boolean    @default(false)
+  done       Boolean    @default(false)
   user       User       @relation(fields:  [userId], references: [id])
   userId     Int
 }
```


