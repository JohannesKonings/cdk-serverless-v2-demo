import fs from 'node:fs';
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import yaml from 'js-yaml';
import * as z from 'zod';
import { schemaAddTodoApi, schemaTodoApi } from './schema-todo';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const apiKeyComponent = registry.registerComponent(
  'securitySchemes',
  'api_key',
  {
    type: 'apiKey',
    name: 'x-api-key',
    in: 'header',
  },
);

registry.register(
  'Todo',
  schemaTodoApi.openapi({}),
);
registry.register(
  'AddTodo',
  schemaAddTodoApi.openapi({}),
);

registry.registerPath({
  method: 'get',
  path: '/todos',
  summary: 'return list of todos',
  tags: ['admin'],
  security: [{ [apiKeyComponent.name]: [] }],
  operationId: 'getTodos',
  responses: {
    200: {
      description: 'successful operation',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Todo',
            },
          },
        },
        'text/calendar': {
          schema: {
            type: 'string',
          },
        },
      },
    },
  },
});
registry.registerPath({
  'method': 'post',
  'path': '/todos',
  'summary': 'add new todo',
  'tags': ['admin'],
  'security': [{ [apiKeyComponent.name]: [] }],
  'operationId': 'addTodo',
  'requestBody': {
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/AddTodo',
        },
      },
    },
  },
  'responses': {
    201: {
      description: 'successful operation',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Todo',
          },
        },
      },
    },
    401: {
      description: 'you are not logged in',
      content: {},
    },
    403: {
      description: 'you are not authorized to add todos',
      content: {},
    },
  },
  'x-codegen-request-body-name': 'body',
});
registry.registerPath({
  method: 'post',
  path: '/todos/{id}',
  summary: 'get a todo by its id',
  tags: ['admin'],
  security: [{ [apiKeyComponent.name]: [] }],
  operationId: 'getTodoById',
  responses: {
    200: {
      description: 'successful operation',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Todo',
          },
        },
      },
    },
    401: {
      description: 'you are not logged in',
      content: {},
    },
    403: {
      description: 'you are not authorized to add todos',
      content: {},
    },
  },
});
registry.registerPath({
  method: 'delete',
  path: '/todos/{id}',
  summary: 'delete a todo',
  tags: ['admin'],
  security: [{ [apiKeyComponent.name]: [] }],
  operationId: 'removeTodo',
  responses: {
    200: {
      description: 'successful operation',
      content: {},
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

const generatorDocument = generator.generateDocument({
  openapi: '3.0.1',
  info: {
    version: '1.0',
    title: 'Serverless Demo with zod',
  },
  tags: [
    {
      name: 'info',
    },
    {
      name: 'admin',
    },
  ],
});

const yamlString = yaml.dump(generatorDocument, { indent: 2 });

fs.writeFileSync('./src/definitions/myapi-zod.yaml', yamlString);
