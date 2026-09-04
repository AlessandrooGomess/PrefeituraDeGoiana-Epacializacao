/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'GESTAO', 'ADM_SECRETARIA', 'ENGENHEIRO', 'CIDADAO');
ALTER TABLE "public"."usuarios" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "usuarios" ALTER COLUMN "role" SET DEFAULT 'CIDADAO';
COMMIT;

-- AlterTable
ALTER TABLE "fotos" ADD COLUMN     "usuario_id" TEXT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "secretaria_id" TEXT,
ADD COLUMN     "telefone" TEXT;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_secretaria_id_fkey" FOREIGN KEY ("secretaria_id") REFERENCES "secretarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
