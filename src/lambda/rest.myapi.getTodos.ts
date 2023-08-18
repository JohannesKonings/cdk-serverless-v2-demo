import { api } from 'cdk-serverless/lib/lambda';
import { Todo, Index_GSI1_Name } from '../generated/datastore.mymodel-model.generated';
import { components, operations } from '../generated/rest.myapi-model.generated';
import { schemaTodoApi } from '../zod/schema-todo';

export const handler = api.createOpenApiHandler<operations['getTodos']>(async (ctx) => {
  ctx.logger.info(JSON.stringify(ctx.event));
  const list = await Todo.find({ GSI1PK: 'TODOS', GSI1SK: { begins_with: 'OPEN' } }, { index: Index_GSI1_Name });

  const todos: components['schemas']['Todo'][] = list.map(i => ({
    id: i.id!,
    state: i.state! as components['schemas']['Todo']['state'],
    title: i.title!,
    finishedInDays: i.finishedInDays!,
    notificationsEmail: i.notificationsEmail!,
    description: i.description ?? 'N/A',
    lastUpdate: i.lastUpdated!,
  }));

  schemaTodoApi.parse(todos);

  return todos;
});