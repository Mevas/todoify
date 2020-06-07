# Migration `20200607084329`

This migration has been generated at 6/7/2020, 8:43:29 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"id" SERIAL,"name" text  NOT NULL ,"password" text  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Task" (
"body" text  NOT NULL ,"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"id" SERIAL,"updatedAt" timestamp(3)  NOT NULL ,"userId" integer  NOT NULL ,
    PRIMARY KEY ("id"))

ALTER TABLE "public"."Task" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200607084329
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,28 @@
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
+  name      String
+  password  String
+  tasks     Task[]
+}
+
+model Task {
+  id         Int        @id @default(autoincrement())
+  createdAt  DateTime   @default(now())
+  updatedAt  DateTime   @updatedAt
+  body       String
+  user       User       @relation(fields:  [userId], references: [id])
+  userId     Int
+}
```


