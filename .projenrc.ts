import { Datastore, RestApi, ServerlessProject, Workflow } from 'cdk-serverless/lib/projen';
import { javascript } from 'projen';

const project = new ServerlessProject({
  cdkVersion: '2.92.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-serverless-v2-demo-with-zod',
  gitpod: true,
  packageManager: javascript.NodePackageManager.NPM,
  deps: [
    'projen',
    'cdk-serverless',
    'date-fns',
    'zod',
    '@asteasolutions/zod-to-openapi',
    'js-yaml',
  ],
});

new RestApi(project, {
  apiName: 'MyApi',
  // definitionFile: './src/definitions/myapi.yaml',
  definitionFile: './src/definitions/myapi-zod.yaml',
});

new Datastore(project, {
  modelName: 'MyModel',
  // definitionFile: './src/definitions/mymodel.json',
  definitionFile: './src/definitions/mymodel-zod.json',
});

new Workflow(project, {
  workflowName: 'TodoLifecycle',
  definitionFile: './src/definitions/todo-lifecycle.json',
});

const taskDefinitionsCreation = project.addTask('definitionsCreation', {
  steps: [
    { exec: 'ts-node ./src/zod/openapi.ts' },
    { exec: 'ts-node ./src/zod/onetable.ts' },
  ],
});
project.defaultTask!.prependSpawn(taskDefinitionsCreation);

project.synth();