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

const seinfra = await prisma.secretaria.create({
    data: {
        nome: "Secretaria de Infraestrutura e Serviços Públicos",
        sigla: "SEINFRA",
        corIdentificacao: "#3182CE",
    },
});