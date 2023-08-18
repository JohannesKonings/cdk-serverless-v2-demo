import { api, errors } from 'cdk-serverless/lib/lambda';
import { Todo } from '../generated/datastore.mymodel-model.generated';
import { operations } from '../generated/rest.myapi-model.generated';
import { schemaAddTodoApi } from '../zod/schema-todo';

export const handler = api.createOpenApiHandlerWithRequestBody<operations['addTodo']>(async (ctx, data) => {
  ctx.logger.info(JSON.stringify(ctx.event));
  ctx.logger.info(JSON.stringify(data));

  const parsedData = JSON.parse(JSON.parse(JSON.stringify(data)));

  schemaAddTodoApi.parse(parsedData);

  const { title, description, finishedInDays, notificationsEmail } = parsedData;

  await Todo.create({
    title: title,
    description: description,
    finishedInDays: finishedInDays,
    notificationsEmail: notificationsEmail,
    lastUpdated: new Date().toISOString(),
  });

});