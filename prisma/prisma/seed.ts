import { PrismaClient, Role, StatusObra, TipoFoto } from "@prisma/client/extension";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";

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

const seduc = await prisma.secretaria.create({
    data: {
        nome: "Secretaria de Educação",
        sigla: "SEDUC",
        corIdentificacao: "#DD6B20",
    },
});

const engenheiro = await prisma.usuario.create({
    data: {
        nome: "Fiscal de Obras - Prefeitura de Goiana",
        email: "fiscal.obras@goiana.pe.gov.br",
        cargo: "Engenheiro Civil",
        role: Role.Engenheiro,
        secretariaId: seinfra.id,
    },
});

const obraPontaDePedras = await prisma.obra.create({
    data: {
        titulo: "Pavimentação em Paralelepípedo e Drenagem no Centro de Ponta de Pedras",
        descricao: "PAVIMENTAÇÃO EM PARALELEPÍPEDO E DRENAGEM DO CENTRO DE PONTA DE PEDRAS DE GOIANA/PE",
        endereco: "Centro de Ponta de Pedras",
        latitude: -7.618,
        longitude: -34.8385,
        valorContrato: 2834000.0,
        empresaContratada: "J L MARANHAO CONSTRUTORA LTDA",
        numeroOrdemServico: "OS-737/2025",
        dataOrdemServico: new Date("2025-10-29"),
        previsaoConclusao: new Date("2027-01-03"),
        status: StatusObra.EM_ANDAMENTO,
        secretariaId: seinfra.id,
        engenheiroId: engenheiro.id,
    },
});

await prisma.medicao.create({
    data: {
        obraId: obraPontaDePedras.id,
        engenheiroId: engenheiro.id,
        percentualExecutado: 73.31,
        observacoesTecnicas: "Execução de drenagem avançada e assentamento de paralelepípedo.",
    },
});

const obraCarneDeVaca = await prisma.obra.create({
    data: {
        titulo: "Pavimentação de 18 Ruas em Carne de Vaca",
        latitude: -7.5255,
        longitude: -34.8322,
        valorContrato: 1919999.98,
        empresaContratada: "A2 ENGENHARIA LTDA",
        numeroOrdemServico: "OS-498/2025",
        dataOrdemServico: new Date("2025-07-25"),
        previsaoConclusao: new Date("2026-07-19"),
        status: StatusObra.EM_ANDAMENTO,
        secretariaId: seinfra.id,
        engenheiroId: engenheiro.id,
    },
});

await prisma.medicao.create({
    data: {
        obraId: obraCarneDeVaca.id,
        engenheiroId: engenheiro.id,
        percentualExecutado: 76.72,
        observacoesTecnicas: "Pavimentação granítica em estágio avançado nas vias principais.",
    },
});