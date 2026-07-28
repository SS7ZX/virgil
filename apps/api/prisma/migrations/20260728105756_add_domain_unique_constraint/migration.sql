/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,hostname]` on the table `Domain` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Domain_organizationId_hostname_key" ON "Domain"("organizationId", "hostname");
