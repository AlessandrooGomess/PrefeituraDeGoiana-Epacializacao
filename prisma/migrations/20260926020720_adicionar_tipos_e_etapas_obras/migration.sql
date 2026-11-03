-- CreateEnum
CREATE TYPE "StatusEtapa" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'PARALISADA');

-- AlterTable
ALTER TABLE "obras" ADD COLUMN     "tipo_obra_id" TEXT;

-- CreateTable
CREATE TABLE "tipo_obras" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_obras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas_template" (
    "id" TEXT NOT NULL,
    "tipo_obra_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_cidadao" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL,
    "peso" INTEGER NOT NULL DEFAULT 10,
    "eh_continua" BOOLEAN NOT NULL DEFAULT false,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapas_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_etapas_template" (
    "id" TEXT NOT NULL,
    "etapa_template_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL,
    "peso" INTEGER NOT NULL DEFAULT 10,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_etapas_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas_obra" (
    "id" TEXT NOT NULL,
    "obra_id" TEXT NOT NULL,
    "etapa_template_id" TEXT NOT NULL,
    "status" "StatusEtapa" NOT NULL DEFAULT 'PENDENTE',
    "percentual_concluido" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "data_inicio" TIMESTAMP(3),
    "data_previsao" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etapas_obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_etapas_obra" (
    "id" TEXT NOT NULL,
    "etapa_obra_id" TEXT NOT NULL,
    "sub_etapa_template_id" TEXT NOT NULL,
    "status" "StatusEtapa" NOT NULL DEFAULT 'PENDENTE',
    "percentual_concluido" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "data_inicio" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_etapas_obra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_obras_nome_key" ON "tipo_obras"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_obras_slug_key" ON "tipo_obras"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_template_tipo_obra_id_ordem_key" ON "etapas_template"("tipo_obra_id", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "sub_etapas_template_etapa_template_id_ordem_key" ON "sub_etapas_template"("etapa_template_id", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_obra_obra_id_etapa_template_id_key" ON "etapas_obra"("obra_id", "etapa_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_etapas_obra_etapa_obra_id_sub_etapa_template_id_key" ON "sub_etapas_obra"("etapa_obra_id", "sub_etapa_template_id");

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_tipo_obra_id_fkey" FOREIGN KEY ("tipo_obra_id") REFERENCES "tipo_obras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_template" ADD CONSTRAINT "etapas_template_tipo_obra_id_fkey" FOREIGN KEY ("tipo_obra_id") REFERENCES "tipo_obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_etapas_template" ADD CONSTRAINT "sub_etapas_template_etapa_template_id_fkey" FOREIGN KEY ("etapa_template_id") REFERENCES "etapas_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_obra" ADD CONSTRAINT "etapas_obra_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_obra" ADD CONSTRAINT "etapas_obra_etapa_template_id_fkey" FOREIGN KEY ("etapa_template_id") REFERENCES "etapas_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_etapas_obra" ADD CONSTRAINT "sub_etapas_obra_etapa_obra_id_fkey" FOREIGN KEY ("etapa_obra_id") REFERENCES "etapas_obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_etapas_obra" ADD CONSTRAINT "sub_etapas_obra_sub_etapa_template_id_fkey" FOREIGN KEY ("sub_etapa_template_id") REFERENCES "sub_etapas_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
