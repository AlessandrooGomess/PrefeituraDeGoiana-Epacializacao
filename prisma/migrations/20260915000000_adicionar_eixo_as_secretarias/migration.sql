-- AlterTable
ALTER TABLE "secretarias" ADD COLUMN "eixo_id" TEXT;

-- AddForeignKey
ALTER TABLE "secretarias"
ADD CONSTRAINT "secretarias_eixo_id_fkey"
FOREIGN KEY ("eixo_id") REFERENCES "eixos_estrategicos"("id")
ON DELETE SET NULL ON UPDATE CASCADE;