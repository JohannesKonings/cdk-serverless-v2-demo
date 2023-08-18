import { Todo, Index_GSI1_Name } from '../generated/datastore.mymodel-model.generated';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const list = await Todo.find({ GSI1PK: 'TODOS', GSI1SK: { begins: 'OPEN' } }, { index: Index_GSI1_Name });
  console.log(list);
})();
