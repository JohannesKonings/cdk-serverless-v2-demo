import fs from 'node:fs';
import { z } from 'zod';
import { schemaTodoDdb } from './schema-todo';

const modelTodoDdb = {
  PK: {
    type: 'string',
    value: 'TODO#${id}',
  },
  SK: {
    type: 'string',
    value: 'TODO#${id}',
  },
  id: {
    type: 'string',
    required: true,
    generate: 'uuid',
  },
  GSI1PK: {
    type: 'string',
    value: 'TODOS',
  },
  GSI1SK: {
    type: 'string',
    value: '${state}#${title}',
  },
};

const schemaTodoValues = schemaTodoDdb.keyof().Values;

const modelTodoFields = Object.keys(schemaTodoValues).reduce((acc, key) => {
  const keyOfSchemaTodoKeyValues = key as keyof typeof schemaTodoValues;
  const shapeType = schemaTodoDdb.shape[keyOfSchemaTodoKeyValues];

  const { type, required, generate, enumValues, defaultValue } = deriveAttributes(shapeType);

  return {
    ...acc,
    [key]: {
      type: type,
      required: required,
      generate: generate,
      enum: enumValues,
      default: defaultValue,
    },
  };
}, {});

function deriveAttributes(shapeType: z.ZodType<any, any>) {
  let type = '';
  let required = false;
  let generate = undefined;
  let enumValues = [] as string[];
  let defaultValue = undefined;

  if (shapeType === undefined) {
    throw new Error('type is undefined');
  } else if (shapeType instanceof z.ZodString) {
    type = 'string';
    required = true;
    generate = shapeType.isUUID ? 'uuid' : undefined;
  } else if (shapeType instanceof z.ZodNumber) {
    type = 'number';
    required = true;
  } else if (shapeType instanceof z.ZodEnum) {
    required = true;
    type = 'string';
    enumValues = shapeType._def.values;
  } else if (shapeType instanceof z.ZodDefault) {
    required = true;
    defaultValue = shapeType._def.defaultValue();
    const { type: typeInnerType, enumValues: enumInnerType } = deriveAttributes(shapeType._def.innerType);
    type = typeInnerType;
    enumValues = enumInnerType as string[];
  } else if (shapeType instanceof z.ZodOptional) {
    required = false;
    const { type: typeInnerType } = deriveAttributes(shapeType._def.innerType);
    type = typeInnerType;
  } else {
    console.log('shapeType', shapeType);
    throw new Error('type is not supported');
  }
  return {
    type,
    required: required ? true : undefined,
    generate,
    enumValues: enumValues && enumValues.length > 0 ? enumValues : undefined,
    defaultValue,
  };
}

export const modelTodo = {
  ...modelTodoDdb,
  ...modelTodoFields,
};

const onetable = {
  indexes: {
    primary: {
      hash: 'PK',
      sort: 'SK',
    },
    GSI1: {
      hash: 'GSI1PK',
      sort: 'GSI1SK',
      project: 'all',
    },
    LSI1: {
      type: 'local',
      sort: 'lastUpdated',
      project: [
        'id',
        'lastUpdated',
        'title',
      ],
    },
  },
  models: {
    Todo: modelTodo,
  },
  version: '0.1.0',
  format: 'onetable:1.1.0',
  queries: {},
};

fs.writeFileSync('./src/definitions/mymodel-zod.json', JSON.stringify(onetable, null, 2));