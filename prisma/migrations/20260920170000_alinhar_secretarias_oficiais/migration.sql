-- Preserva os registros que possuem obras e usuários vinculados.
UPDATE "secretarias"
SET
  "nome" = 'Desenvolvimento Urbano e Obras',
  "sigla" = 'SEDUO'
WHERE "id" = 'a741b3c8-28fb-4c30-a2bb-a953c4ec7d6d';

UPDATE "secretarias"
SET
  "nome" = 'Educação e Inovação Pedagógica',
  "sigla" = 'SECEDIP'
WHERE "id" = 'b22db1a5-2227-4996-a8df-c35c304aab33';

-- Remove duplicidades criadas anteriormente sem vínculos.
UPDATE "usuarios"
SET "secretaria_id" = 'a741b3c8-28fb-4c30-a2bb-a953c4ec7d6d'
WHERE "secretaria_id" = 'f630267b-4bcb-4d17-824a-a740d2a6a5da';

UPDATE "obras"
SET "secretaria_id" = 'a741b3c8-28fb-4c30-a2bb-a953c4ec7d6d'
WHERE "secretaria_id" = 'f630267b-4bcb-4d17-824a-a740d2a6a5da';

UPDATE "usuarios"
SET "secretaria_id" = 'b22db1a5-2227-4996-a8df-c35c304aab33'
WHERE "secretaria_id" = '9016ab67-05ee-412b-92c8-695678d9884a';

UPDATE "obras"
SET "secretaria_id" = 'b22db1a5-2227-4996-a8df-c35c304aab33'
WHERE "secretaria_id" = '9016ab67-05ee-412b-92c8-695678d9884a';

DELETE FROM "secretarias"
WHERE "id" IN (
  'f630267b-4bcb-4d17-824a-a740d2a6a5da',
  '9016ab67-05ee-412b-92c8-695678d9884a'
);

UPDATE "secretarias"
SET "nome" = 'Manutenção e Serviços Públicos', "sigla" = 'SEMANGES'
WHERE "id" = 'febb8e7b-47cd-411f-a666-763c0a426d94';

UPDATE "secretarias"
SET "sigla" = 'SEES'
WHERE "nome" = 'Esportes';

UPDATE "secretarias"
SET "sigla" = 'SECJ'
WHERE "nome" = 'Criança e Juventude';

UPDATE "secretarias"
SET "sigla" = 'SESAU'
WHERE "nome" = 'Saúde';

UPDATE "secretarias"
SET "nome" = 'Autarquia de Ensino Superior de Ensino', "sigla" = 'AMESG'
WHERE "id" = 'aafa3fc2-9c43-4841-ba53-8fe6a300f38d';

UPDATE "secretarias"
SET "sigla" = 'SEMUL'
WHERE "nome" = 'Mulher';

UPDATE "secretarias"
SET "sigla" = 'SEHAB'
WHERE "nome" = 'Habitação e Regularização Fundiária';

UPDATE "secretarias"
SET "sigla" = 'AD'
WHERE "nome" = 'Agência de Desenvolvimento de Goiana';

UPDATE "secretarias"
SET "sigla" = 'SECTI'
WHERE "nome" = 'Desenvolvimento Econômico e Tecnologia';

UPDATE "secretarias"
SET "sigla" = 'SEAPPA'
WHERE "nome" = 'Agricultura, Pecuária, Pesca e Proteção Animal';

UPDATE "secretarias"
SET "nome" = 'Administração e Gestão da Qualidade', "sigla" = 'SECAD'
WHERE "nome" = 'Administração e Gestão da Qualidade';

UPDATE "secretarias"
SET "sigla" = 'SEFAZ'
WHERE "nome" = 'Fazenda Municipal';

UPDATE "secretarias"
SET "sigla" = 'OGM'
WHERE "nome" = 'Ouvidoria';

UPDATE "secretarias"
SET "sigla" = 'GOIANAPREVI'
WHERE "nome" = 'Goiana Previ';

UPDATE "secretarias"
SET "sigla" = 'CCI'
WHERE "nome" = 'Controladoria';

UPDATE "secretarias"
SET "sigla" = 'SECOM'
WHERE "nome" = 'Comunicação';

-- Unifica Segurança e Trânsito.
UPDATE "usuarios"
SET "secretaria_id" = '02aec152-192d-4760-a3eb-8c6b97223048'
WHERE "secretaria_id" = 'ed1138ad-d94b-43e9-9c18-77086c4dd94e';

UPDATE "obras"
SET "secretaria_id" = '02aec152-192d-4760-a3eb-8c6b97223048'
WHERE "secretaria_id" = 'ed1138ad-d94b-43e9-9c18-77086c4dd94e';

UPDATE "secretarias"
SET
  "nome" = 'Segurança Cidadã, Trânsito e Transportes Urbanos',
  "sigla" = 'SESTRAN'
WHERE "id" = '02aec152-192d-4760-a3eb-8c6b97223048';

DELETE FROM "secretarias"
WHERE "id" = 'ed1138ad-d94b-43e9-9c18-77086c4dd94e';

-- Unifica Turismo e Cultura.
UPDATE "usuarios"
SET "secretaria_id" = '03738813-6b94-4c01-ac73-b9b6c2273685'
WHERE "secretaria_id" = '12d11df2-0226-43a8-991f-95d33f9d7361';

UPDATE "obras"
SET "secretaria_id" = '03738813-6b94-4c01-ac73-b9b6c2273685'
WHERE "secretaria_id" = '12d11df2-0226-43a8-991f-95d33f9d7361';

UPDATE "secretarias"
SET "nome" = 'Turismo, Cultura e Proteção ao Patrimônio Histórico Cultural'
WHERE "id" = '03738813-6b94-4c01-ac73-b9b6c2273685';

DELETE FROM "secretarias"
WHERE "id" = '12d11df2-0226-43a8-991f-95d33f9d7361';

-- Unifica Planejamento e Orçamento.
UPDATE "usuarios"
SET "secretaria_id" = '2f0e510e-9423-4d61-8256-576ba230941a'
WHERE "secretaria_id" = '9c11b3e8-a4a8-45d9-b580-4a3732a2d8c2';

UPDATE "obras"
SET "secretaria_id" = '2f0e510e-9423-4d61-8256-576ba230941a'
WHERE "secretaria_id" = '9c11b3e8-a4a8-45d9-b580-4a3732a2d8c2';

UPDATE "secretarias"
SET
  "nome" = 'Planejamento Estratégico, Orçamento e Gestão',
  "sigla" = 'SEPLAN'
WHERE "id" = '2f0e510e-9423-4d61-8256-576ba230941a';

DELETE FROM "secretarias"
WHERE "id" = '9c11b3e8-a4a8-45d9-b580-4a3732a2d8c2';

-- Unifica Articulação Política e Governo.
UPDATE "usuarios"
SET "secretaria_id" = '3f2523c7-a26f-4e87-b16e-aab783d55760'
WHERE "secretaria_id" = '9ccd305e-d39b-4c55-ba35-e1a28ae33bf8';

UPDATE "obras"
SET "secretaria_id" = '3f2523c7-a26f-4e87-b16e-aab783d55760'
WHERE "secretaria_id" = '9ccd305e-d39b-4c55-ba35-e1a28ae33bf8';

UPDATE "secretarias"
SET
  "nome" = 'Articulação Política, Governo e Participação Social',
  "sigla" = 'SEAPOG'
WHERE "id" = '3f2523c7-a26f-4e87-b16e-aab783d55760';

DELETE FROM "secretarias"
WHERE "id" = '9ccd305e-d39b-4c55-ba35-e1a28ae33bf8';

