-- CreateEnum
CREATE TYPE "TipoIntercorrencia" AS ENUM ('CHUVA', 'ATRASO_MATERIAL', 'FALTA_PESSOAL', 'ACIDENTE_TRABALHO', 'PROBLEMA_FORNECEDOR', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusRegistro" AS ENUM ('RASCUNHO', 'ENVIADO');

-- AlterTable
ALTER TABLE "fotos" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "registro_campo_id" TEXT;

-- CreateTable
CREATE TABLE "registros_campo" (
    "id" TEXT NOT NULL,
    "obra_id" TEXT NOT NULL,
    "engenheiro_id" TEXT NOT NULL,
    "data_vistoria" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusRegistro" NOT NULL DEFAULT 'RASCUNHO',
    "intercorrencias" "TipoIntercorrencia"[],
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_campo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_registro_campo_id_fkey" FOREIGN KEY ("registro_campo_id") REFERENCES "registros_campo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_campo" ADD CONSTRAINT "registros_campo_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_campo" ADD CONSTRAINT "registros_campo_engenheiro_id_fkey" FOREIGN KEY ("engenheiro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
