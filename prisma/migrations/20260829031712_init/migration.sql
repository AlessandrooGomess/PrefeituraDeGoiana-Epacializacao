-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ENGENHEIRO', 'CIDADAO');

-- CreateEnum
CREATE TYPE "StatusObra" AS ENUM ('PLANEJADA', 'ORDEM_EMITIDA', 'EM_ANDAMENTO', 'PARALISADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "TipoFoto" AS ENUM ('RENDER_PROJETO', 'ANTES', 'EM_ANDAMENTO', 'CONCLUIDO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CIDADAO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretarias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "cor_identificacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secretarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obras" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "valor_contrato" DECIMAL(12,2),
    "empresa_contratada" TEXT,
    "numero_ordem_servico" TEXT,
    "data_ordem_servico" TIMESTAMP(3),
    "previsao_conclusao" TIMESTAMP(3),
    "data_conclusao_real" TIMESTAMP(3),
    "status" "StatusObra" NOT NULL DEFAULT 'PLANEJADA',
    "secretaria_id" TEXT NOT NULL,
    "engenheiro_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicoes" (
    "id" TEXT NOT NULL,
    "obra_id" TEXT NOT NULL,
    "engenheiro_id" TEXT NOT NULL,
    "data_vistoria" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "percentual_executado" DECIMAL(5,2) NOT NULL,
    "observacoes_tecnicas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos" (
    "id" TEXT NOT NULL,
    "obra_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" "TipoFoto" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "descricao" TEXT,
    "data_foto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_secretaria_id_fkey" FOREIGN KEY ("secretaria_id") REFERENCES "secretarias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_engenheiro_id_fkey" FOREIGN KEY ("engenheiro_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicoes" ADD CONSTRAINT "medicoes_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicoes" ADD CONSTRAINT "medicoes_engenheiro_id_fkey" FOREIGN KEY ("engenheiro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
