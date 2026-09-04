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
        bairro: "Ponta de Pedras",
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
        descricao: "PAVIMENTACAO EM PARALELEPÍPEDOS GRANÍTICOS DE 18 RUAS NA COMUNIDADE DE CARNE DE VACA",
        endereco: "Comunidade de Carne de Vaca",
        bairro: "Ponta de Pedras",
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

const obraRestauroCentro = await prisma.obra.create({
    data: {
        titulo: "Restauro do Prédio da Secretaria de Urbanismo e Obras",
        descricao: "RESTAURO DO ANTIGO PRÉDIO DA SECRETARIA DE URBANISMO, OBRAS E PATRIMÔNIO, LOCALIZADO NA R.DR. MANOEL BORBA, CENTRO",
        endereco: "Rua Dr. Manoel Borba",
        bairro: "Centro",
        latitude: -7.5292,
        longitude: -35.0028,
        valorContrato: 1815911.69,
        empresaContratada: "A2 ENGENHARIA LTDA",
        numeroOrdemServico: "OS-497/2025",
        dataOrdemServico: new Date("2025-07-25"),
        previsaoConclusao: new Date("2026-11-17"),
        status: StatusObra.EM_ANDAMENTO,
        secretariaId: seinfra.id,
        engenheiroId: engenheiro.id,
    },
});

await prisma.medicao.create({
    data: {
        obraId: obraRestauroCentro.id,
        engenheiroId: engenheiro.id,
        percentualExecutado: 10.27,
        observacoesTecnicas: "Fase inicial de escoramento e prosprecção do patrimônio histórico",
    },
});

const obratejucupapo = await prisma.obra.create({
    data: {
        titulo: "Pavimentação e Passeio em Ruas de Tejucupapo",
        descricao: "PAVIMENTAÇÃO EM PARALELEPÍPEDO E PASSEIO DE DIVERSAS RUAS LOCALIZADAS NO DISTRITO DE TEJUCUPAPO",
        endereco: "Vias urbanas de Tejjucupapo",
        bairro: "Tejucupapo",
        latitude: -7.5292,
        longitude: -35.0028,
        valorContrato: 1815911.69,
        empresaContratada: "A2 ENGENHARIA LTDA",
        numeroOrdemServico: "OS-497/2025",
        dataOrdemServico: new Date("2025-07-25"),
        previsaoConclusao: new Date("2026-11-17"),
        status: StatusObra.EM_ANDAMENTO,
        secretariaId: seinfra.id,
        engenheiroId: engenheiro.id,
    },
});

await prisma.medicao.create({
    data: {
        obraId: obratejucupapo.id,
        engenheiroId: engenheiro.id,
        percentualExecutado: 93.29,
        observacoesTecnicas: "Reta final de acabamento de meio-fio e passeios acessíveis",
    },
});

const obraAsfaltoCentro = await prisma.obra.create({
    data: {
        titulo: "Pavimentação Asfáltica em CBUQ - Etapa 5",
        descricao: "PRESTAÇÃO DE SERVIÇOS DE PAVIMENTAÇÃO ASFÁLTICA EM CBUQ DA ETAPA 5 DE DIVERSAS RUAS DO CENTRO DE GOIANA/PE",
        endereco: "Ruas do Centro",
        bairro: "Centro",
        latitude: -7.5568,
        longitude: -35.0055,
        valorContrato: 4085652.13,
        empresaContratada: "CONTRUTORA GONCALO LTDA",
        numeroOrdemServico: "OS-397/2025",
        dataOrdemServico: new Date("2025-06-26"),
        previsaoConclusao: new Date("2025-09-04"),
        dataConclusaoReal: new DATE("2025-09-04"),
        status: StatusObra.CONCLUIDA,
        secretariaId: seinfra.id,
        engenheiroId: engenheiro.id,
    },
});

await prisma.medicao.create({
    data: {
        obraId: obraAsfaltoCentro.id,
        engenheiroId: engenheiro.id,
        percentualExecutado: 100.00,
        observacoesTecnicas: "Obra 100% executada, sinalizada e entrege a população",
    },
});