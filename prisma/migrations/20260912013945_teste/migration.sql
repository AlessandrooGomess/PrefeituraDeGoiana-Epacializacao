/*
  Warnings:

  - Added the required column `area_tematica_id` to the `obras` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eixo_id` to the `obras` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "obras" ADD COLUMN     "area_tematica_id" TEXT NOT NULL,
ADD COLUMN     "eixo_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "eixos_estrategicos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cor" TEXT DEFAULT '#3182CE',
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eixos_estrategicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas_tematicas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eixo_id" TEXT NOT NULL,

    CONSTRAINT "areas_tematicas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eixos_estrategicos_nome_key" ON "eixos_estrategicos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "eixos_estrategicos_slug_key" ON "eixos_estrategicos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "areas_tematicas_nome_key" ON "areas_tematicas"("nome");

-- AddForeignKey
ALTER TABLE "areas_tematicas" ADD CONSTRAINT "areas_tematicas_eixo_id_fkey" FOREIGN KEY ("eixo_id") REFERENCES "eixos_estrategicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_eixo_id_fkey" FOREIGN KEY ("eixo_id") REFERENCES "eixos_estrategicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_area_tematica_id_fkey" FOREIGN KEY ("area_tematica_id") REFERENCES "areas_tematicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
