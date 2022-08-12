/* eslint-disable no-await-in-loop, no-restricted-syntax */
import { getJunitXml } from 'junit-xml';
import { outputFile } from 'fs-extra';
import { join, resolve } from 'path';

import { createOptions, getOptionsOrPrompt } from './utils/options';
import { bootstrap } from './tasks/bootstrap';
import { publish } from './tasks/publish';
import { create } from './tasks/create';
import { smokeTest } from './tasks/smoke-test';

import TEMPLATES from '../code/lib/cli/src/repro-templates';

const sandboxDir = resolve(__dirname, '../sandbox');
const junitDir = resolve(__dirname, '../code/test-results');

export type TemplateKey = keyof typeof TEMPLATES;
export type Template = typeof TEMPLATES[TemplateKey];
export type Path = string;
export type TemplateDetails = { template: Template; sandboxDir: Path };

type MaybePromise<T> = T | Promise<T>;

export type Task = {
  before?: TaskKey[];
  /**
   * Is this task already "ready", and potentially not required?
   */
  ready: (templateKey: TemplateKey, details: TemplateDetails) => MaybePromise<boolean>;
  /**
   * Run the task
   */
  run: (templateKey: TemplateKey, details: TemplateDetails) => MaybePromise<void>;
};

export const tasks = {
  bootstrap,
  publish,
  create,
  'smoke-test': smokeTest,
};

type TaskKey = keyof typeof tasks;

export const options = createOptions({
  task: {
    type: 'string',
    description: 'What task are you performing (corresponds to CI job)?',
    values: Object.keys(tasks) as TaskKey[],
    required: true,
  },
  template: {
    type: 'string',
    description: 'What template are you running against?',
    values: Object.keys(TEMPLATES) as TemplateKey[],
    required: true,
  },
  force: {
    type: 'boolean',
    description: 'The task must run, it is an error if it is already ready?',
  },
  before: {
    type: 'boolean',
    description: 'Run any required dependencies of the task?',
    inverse: true,
  },
  junit: {
    type: 'boolean',
    description: 'Store results in junit format?',
  },
});

const logger = console;

async function writeJunitXml(taskKey: TaskKey, templateKey: TemplateKey, start: Date, err?: Error) {
  const name = `${taskKey} - ${templateKey}`;
  const time = (Date.now() - +start) / 1000;
  const testCase = { name, assertions: 1, time, ...(err && { errors: [err] }) };
  const suite = { name, timestamp: start, time, testCases: [testCase] };
  const junitXml = getJunitXml({ time, name, suites: [suite] });
  const path = join(junitDir, `${taskKey}.xml`);
  await outputFile(path, junitXml);
  logger.log(`Test results written to ${resolve(path)}`);
}

async function runTask(
  taskKey: TaskKey,
  templateKey: TemplateKey,
  {
    mustNotBeReady,
    mustBeReady,
    before,
    junit,
  }: { mustNotBeReady: boolean; mustBeReady: boolean; before: boolean; junit: boolean }
) {
  const task = tasks[taskKey];
  const template = TEMPLATES[templateKey];
  const templateSandboxDir = join(sandboxDir, templateKey.replace('/', '-'));
  const details = { template, sandboxDir: templateSandboxDir };

  if (await task.ready(templateKey, details)) {
    if (mustNotBeReady) throw new Error(`❌ ${taskKey} task has already run, this is unexpected!`);

    logger.debug(`✅ ${taskKey} task not required!`);
    return;
  }

  if (mustBeReady) {
    throw new Error(`❌ ${taskKey} task has not already run, this is unexpected!`);
  }

  if (task.before?.length > 0) {
    for (const beforeKey of task.before) {
      await runTask(beforeKey, templateKey, {
        mustNotBeReady: false,
        mustBeReady: !before,
        before,
        junit: false, // never store junit results for dependent tasks
      });
    }
  }

  const start = new Date();
  try {
    await task.run(templateKey, { template, sandboxDir: templateSandboxDir });

    if (junit) await writeJunitXml(taskKey, templateKey, start);
  } catch (err) {
    if (junit) await writeJunitXml(taskKey, templateKey, start, err);

    throw err;
  }
}

async function run() {
  const {
    task: taskKey,
    template: templateKey,
    force,
    before,
    junit,
  } = await getOptionsOrPrompt('yarn task', options);

  return runTask(taskKey, templateKey, {
    mustBeReady: force,
    mustNotBeReady: false,
    before,
    junit,
  });
}

if (require.main === module) {
  run().catch((err) => {
    logger.error();
    logger.error(err.message);
    process.exit(1);
  });
}
