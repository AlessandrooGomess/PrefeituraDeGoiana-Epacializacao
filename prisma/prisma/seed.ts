import { PrismaClient, Role, StatusObra, TipoFoto } from "@prisma/client/extension";

const prisma = new PrismaClient();

async function main() {
    console.log("")
}

await prisma.foto.deleteMany();
await prisma.medicao.deleteMany();
await prisma.obra.deleteMany();
await prisma.usuario.deleteMany();
await prisma.secretaria.deleteMany();