-- AlterTable
ALTER TABLE "secretarias" ADD COLUMN     "area_tematica_id" TEXT;

-- AddForeignKey
ALTER TABLE "secretarias" ADD CONSTRAINT "secretarias_area_tematica_id_fkey" FOREIGN KEY ("area_tematica_id") REFERENCES "areas_tematicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
