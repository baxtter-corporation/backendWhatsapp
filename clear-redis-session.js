const redis = require('redis');
require('dotenv').config();

async function clearRedisSession() {
  const instanceId = '6b3d51b9-30e3-47a8-90de-9c61cae2edbd';
  const redisUrl = process.env.CACHE_REDIS_URI || 'redis://localhost:6379/6';
  const prefixKey = process.env.CACHE_REDIS_PREFIX_KEY || 'evolution';

  const client = redis.createClient({
    url: redisUrl,
  });

  try {
    await client.connect();
    console.log('Conectado ao Redis');

    // Listar todas as chaves relacionadas à instância
    const pattern = `${prefixKey}:*:${instanceId}*`;
    const keys = await client.keys(pattern);

    console.log(`Encontradas ${keys.length} chaves para a instância:`);
    console.log(keys);

    if (keys.length > 0) {
      const result = await client.del(keys);
      console.log(`Deletadas ${result} chaves do Redis`);
    } else {
      console.log('Nenhuma chave encontrada para deletar');
    }

    // Também limpar chaves de credenciais
    const credsPattern = `${prefixKey}:creds:${instanceId}*`;
    const credsKeys = await client.keys(credsPattern);
    
    if (credsKeys.length > 0) {
      const credsResult = await client.del(credsKeys);
      console.log(`Deletadas ${credsResult} chaves de credenciais`);
    }

    console.log('✅ Limpeza concluída');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.quit();
  }
}

clearRedisSession();
