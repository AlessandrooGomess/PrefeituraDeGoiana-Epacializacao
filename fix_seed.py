import os
import io

original_path = r'C:\Users\gomes\.gemini\antigravity\brain\d91c802c-2e7a-4320-84c2-bd0e8919af0f\scratch\wt\prisma\seed.ts'
guide_path = r'C:\Users\gomes\.gemini\antigravity\brain\d91c802c-2e7a-4320-84c2-bd0e8919af0f\Guia_Implementacao_Sub_Etapas.md'
target_path = r'c:\Users\gomes\espacializacao-obras\prisma\seed.ts'

with io.open(original_path, 'r', encoding='utf-8') as f:
    orig = f.read()
with io.open(guide_path, 'r', encoding='utf-8') as f:
    guide = f.read()

part1 = orig.split('const tipoConstrucao = await prisma.tipoObra.create({')[0]

guide_types = guide.split('const tipoPavimentacao = await prisma.tipoObra.create({')[1].split('console.log("🔗 Associando')[0]
guide_types = 'const tipoPavimentacao = await prisma.tipoObra.create({' + guide_types

part_obras = orig.split('const obraPontaDePedras = await prisma.obra.create({')[1].split('console.log("🔗 Associando')[0]
part_obras = 'const obraPontaDePedras = await prisma.obra.create({' + part_obras

guide_assoc = guide.split('console.log("🔗 Associando')[1].split('`')[0]
guide_assoc = 'console.log("🔗 Associando' + guide_assoc

final = part1 + guide_types + '\n' + part_obras + '\n' + guide_assoc + '\n}\n\nmain()\n  .catch((e) => {\n    console.error(e);\n    process.exit(1);\n  })\n  .finally(async () => {\n    await prisma.();\n  });\n'

with io.open(target_path, 'w', encoding='utf-8') as f:
    f.write(final)

