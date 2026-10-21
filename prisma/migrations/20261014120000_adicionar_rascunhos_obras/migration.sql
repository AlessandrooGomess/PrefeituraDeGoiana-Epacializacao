CREATE TABLE "rascunhos_obras" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "secretaria_id" TEXT NOT NULL,
    "dados" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rascunhos_obras_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rascunhos_obras_usuario_id_key" ON "rascunhos_obras"("usuario_id");

ALTER TABLE "rascunhos_obras" ADD CONSTRAINT "rascunhos_obras_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rascunhos_obras" ADD CONSTRAINT "rascunhos_obras_secretaria_id_fkey"
FOREIGN KEY ("secretaria_id") REFERENCES "secretarias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
