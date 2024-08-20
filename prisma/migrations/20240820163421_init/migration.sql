-- CreateEnum
CREATE TYPE "InstanceState" AS ENUM ('SCHEDULED', 'QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "username" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "workflow_configs" (
    "id" TEXT NOT NULL,
    "workflow_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "cron_expression" TEXT NOT NULL,
    "base_image" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "state" "InstanceState",
    "execution_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "workflow_id" TEXT NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_configs_workflow_name_key" ON "workflow_configs"("workflow_name");

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
