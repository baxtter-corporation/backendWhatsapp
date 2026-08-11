import { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

const router = Router();

function parsePrismaModels(schemaPath: string) {
  try {
    const content = fs.readFileSync(schemaPath, 'utf8');
    const models: Array<{ name: string; fields: Array<{ name: string; type: string; required: boolean }> }> = [];
    const all = content.matchAll(/model\s+(\w+)\s*{([\s\S]*?)\n}/gim);
    for (const mm of all) {
      const name = mm[1];
      const body = mm[2];
      const fields: Array<{ name: string; type: string; required: boolean }> = [];
      const lines = body
        .split(/\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('//'));
      for (const line of lines) {
        // match: fieldName  Type?  @attr
        const fld = line.match(/^(\w+)\s+([^\s]+).*/);
        if (!fld) continue;
        const fname = fld[1];
        let ftype = fld[2];
        const required = !ftype.endsWith('?');
        ftype = ftype.replace('?', '').replace('[]', '');
        fields.push({ name: fname, type: ftype, required });
      }
      models.push({ name, fields });
    }
    return models;
  } catch {
    return [];
  }
}

function prismaTypeToSchema(prismaType: string) {
  const base = prismaType.toLowerCase();
  if (base === 'string' || base === 'cuid' || base === 'uuid') return { type: 'string' };
  if (base === 'int' || base === 'bigint') return { type: 'integer' };
  if (base === 'float' || base === 'decimal' || base === 'double') return { type: 'number' };
  if (base === 'boolean') return { type: 'boolean' };
  if (base === 'datetime' || base === 'date') return { type: 'string', format: 'date-time' };
  if (base === 'json') return { type: 'object' };
  // fallback to string for relations or unknowns
  return { type: 'string' };
}

function buildOpenApi(models: any[]) {
  const paths: any = {};

  for (const model of models) {
    const name = model.name;
    const schemaProps: any = {};
    for (const f of model.fields) {
      schemaProps[f.name] = prismaTypeToSchema(f.type);
    }

    // build an example object based on field names and types
    const exampleObj: any = {};
    const sampleFor = (fname: string, ftype: string) => {
      const ft = ftype.toLowerCase();
      if (fname.toLowerCase().includes('instance') && fname.toLowerCase().includes('name')) return 'Advance';
      if (fname.toLowerCase().includes('instance') && fname.toLowerCase().includes('id')) return 'instance_cuid';
      if (fname.toLowerCase().includes('token')) return 'advance';
      if (fname.toLowerCase().includes('qrcode')) return true;
      if (fname.toLowerCase().includes('integration')) return 'WHATSAPP-BAILEYS';
      if (ft === 'string') return `${fname}_example`;
      if (ft === 'int' || ft === 'bigint') return 0;
      if (ft === 'float' || ft === 'decimal' || ft === 'double') return 0.0;
      if (ft === 'boolean') return false;
      if (ft === 'datetime' || ft === 'date') return new Date().toISOString();
      if (ft === 'json') return {};
      return `${fname}_example`;
    };

    for (const f of model.fields) {
      exampleObj[f.name] = sampleFor(f.name, f.type);
    }

    // override Instance request body payload documentation
    if (name === 'Instance') {
      Object.assign(exampleObj, {
        instanceName: 'Advancef',
        integration: 'WHATSAPP-BAILEYS',
        token: 'advancef',
        qrcode: true,
      });

      // Only expose the expected POST payload fields for Instance in Swagger
      Object.assign(schemaProps, {
        instanceName: { type: 'string' },
        integration: { type: 'string' },
        token: { type: 'string' },
        qrcode: { type: 'boolean' },
      });

      for (const key of Object.keys(schemaProps)) {
        if (!['instanceName', 'integration', 'token', 'qrcode'].includes(key)) {
          delete schemaProps[key];
        }
      }
    }

    // do not attach `example` to components.schemas to avoid showing examples on GET responses
    // keep schemaProps for inline POST bodies (do not register as component schema)

    const pathKey = `/db/${name}`;
    paths[pathKey] = {};

    paths[pathKey].get = {
      tags: [name],
      summary: `Get all rows from ${name}`,
      operationId: `get${name}List`,
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': {
          description: 'OK',
        },
      },
    };

    paths[pathKey].post = {
      tags: [name],
      summary: `Create a ${name} row`,
      operationId: `create${name}`,
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object', properties: schemaProps },
            example: exampleObj,
          },
        },
      },
      responses: {
        '201': {
          description: 'Created',
          content: { 'application/json': { schema: { $ref: `#/components/schemas/${name}` } } },
        },
      },
    };
  }

  const spec = {
    openapi: '3.0.0',
    info: { title: 'Evolution API - DB Access', version: '1.0.0' },
    servers: [{ url: '/' }],
    paths,
    tags: models.map((m: any) => ({ name: m.name, description: `${m.name} entity operations` })),
    components: {
      securitySchemes: { ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'apikey' } },
    },
  };

  return spec;
}

router.get('/swagger.json', async (_req: Request, res: Response) => {
  const schemaPath = path.join(process.cwd(), 'prisma', 'postgresql-schema.prisma');
  const models = parsePrismaModels(schemaPath);
  // Keep only Instance model for DB endpoints as requested
  const dbModels = models.filter((m: any) => m.name === 'Instance');
  const spec = buildOpenApi(dbModels.length ? dbModels : [{ name: 'Instance', fields: [] }]);

  // Add message endpoints (card types + sendText)
  const msgPaths: any = {};

  // common path param for instanceName
  const instanceParam = {
    name: 'instanceName',
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: 'Instance name',
  };

  // sendText
  msgPaths['/message/sendText/{instanceName}'] = {
    post: {
      tags: ['Message'],
      summary: 'Send text message',
      operationId: 'sendText',
      parameters: [instanceParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                number: { type: 'string' },
                text: { type: 'string' },
                delay: { type: 'integer' },
              },
              required: ['number', 'text'],
            },
            example: { number: '5511999999999', text: 'Olá, teste' },
          },
        },
      },
      responses: { '201': { description: 'Created' } },
    },
  };

  // sendTemplate (card)
  msgPaths['/message/sendTemplate/{instanceName}'] = {
    post: {
      tags: ['Message'],
      summary: 'Send template message',
      operationId: 'sendTemplate',
      parameters: [instanceParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { name: { type: 'string' }, language: { type: 'string' }, components: { type: 'object' } },
              required: ['name', 'language'],
            },
            example: { name: 'welcome', language: 'pt_BR', components: {} },
          },
        },
      },
      responses: { '201': { description: 'Created' } },
    },
  };

  // sendButtons (card)
  msgPaths['/message/sendButtons/{instanceName}'] = {
    post: {
      tags: ['Message'],
      summary: 'Send buttons message',
      operationId: 'sendButtons',
      parameters: [instanceParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                number: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                buttons: { type: 'array', items: { type: 'object' } },
              },
              required: ['number', 'title', 'buttons'],
            },
            example: {
              number: '5511999999999',
              title: 'Opções',
              buttons: [{ type: 'reply', displayText: 'Sim', id: 'yes' }],
            },
          },
        },
      },
      responses: { '201': { description: 'Created' } },
    },
  };

  // sendList (card)
  msgPaths['/message/sendList/{instanceName}'] = {
    post: {
      tags: ['Message'],
      summary: 'Send list message',
      operationId: 'sendList',
      parameters: [instanceParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                number: { type: 'string' },
                title: { type: 'string' },
                buttonText: { type: 'string' },
                sections: { type: 'array', items: { type: 'object' } },
              },
              required: ['number', 'title', 'buttonText', 'sections'],
            },
            example: {
              number: '5511999999999',
              title: 'Escolha',
              buttonText: 'Abrir',
              sections: [{ title: 'Sec', rows: [{ title: 'Item', rowId: '1' }] }],
            },
          },
        },
      },
      responses: { '201': { description: 'Created' } },
    },
  };

  // findMessagesByRemoteJid
  msgPaths['/chat/findMessagesByRemoteJid/{instanceName}'] = {
    get: {
      tags: ['Chat'],
      summary: 'Find contact messages by phone number',
      operationId: 'findMessagesByRemoteJid',
      parameters: [
        instanceParam,
        {
          name: 'number',
          in: 'query',
          required: true,
          schema: { type: 'string' },
          description: 'Phone number (e.g., 5511999999999 or 5511999999999@s.whatsapp.net)',
        },
      ],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': {
          description: 'OK - Returns only messages with messageType == contactMessage',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        key: { type: 'object' },
                        pushName: { type: 'string' },
                        messageType: { type: 'string' },
                        message: { type: 'object' },
                        messageTimestamp: { type: 'integer' },
                        MessageUpdate: { type: 'array', items: { type: 'object' } },
                        Media: { type: 'object', nullable: true },
                        Instance: { type: 'object' },
                      },
                    },
                  },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  };

  // merge message paths into spec.paths
  spec.paths = { ...(spec.paths || {}), ...msgPaths };
  res.json(spec);
});

router.use('/docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: '/swagger.json' }));

export default router;
