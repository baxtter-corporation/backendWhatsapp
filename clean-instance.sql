-- Script para limpar todos os dados da instância 'Advance-Security'
-- Execute no PostgreSQL

BEGIN;

-- Deletar dados relacionados à instância (em ordem de dependência)
DELETE FROM "MessageUpdate" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Message" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Media" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Chat" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Contact" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Label" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Typebot" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "OpenaiCreds" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "OpenaiBot" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');

-- Deletar configurações relacionadas
DELETE FROM "Webhook" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Chatwoot" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Proxy" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Setting" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Rabbitmq" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Nats" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Sqs" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Kafka" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "Websocket" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "TypebotSetting" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');
DELETE FROM "OpenaiSetting" WHERE "instanceId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');

-- Deletar sessão
DELETE FROM "Session" WHERE "sessionId" = (SELECT id FROM "Instance" WHERE name = 'Advance-Security');

-- Deletar a instância
DELETE FROM "Instance" WHERE name = 'Advance-Security';

COMMIT;
