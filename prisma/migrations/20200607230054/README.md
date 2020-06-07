# Migration `20200607230054`

This migration has been generated at 6/7/2020, 11:00:54 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Task" ADD COLUMN "status" boolean  NOT NULL DEFAULT false;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200607230054
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,29 @@
+// This is your Prisma schema file,
+// learn more about it in the docs: https://pris.ly/d/prisma-schema
+
+datasource db {
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
+}
+
+generator client {
+  provider = "prisma-client-js"
+}
+
+model User {
+  id        Int         @id @default(autoincrement())
+  createdAt DateTime    @default(now())
+  name      String      @unique
+  password  String
+  tasks     Task[]
+}
+
+model Task {
+  id         Int        @id @default(autoincrement())
+  createdAt  DateTime   @default(now())
+  updatedAt  DateTime   @updatedAt
+  body       String
+  status     Boolean    @default(false)
+  user       User       @relation(fields:  [userId], references: [id])
+  userId     Int
+}
```


