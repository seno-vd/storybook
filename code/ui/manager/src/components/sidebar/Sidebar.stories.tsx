import React from 'react';

import type { IndexHash, State } from 'lib/manager-api/src';
import type { StoryObj, Meta } from '@storybook/react';
import { Sidebar, DEFAULT_REF_ID } from './Sidebar';
import { standardData as standardHeaderData } from './Heading.stories';
import * as ExplorerStories from './Explorer.stories';
import { mockDataset } from './mockdata';
import type { RefType } from './types';

const meta = {
  component: Sidebar,
  title: 'Sidebar/Sidebar',
  excludeStories: /.*Data$/,
  parameters: { layout: 'fullscreen', withSymbols: true },
  decorators: [ExplorerStories.default.decorators[0]],
} as Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

const { menu } = standardHeaderData;
const index = mockDataset.withRoot as IndexHash;
const storyId = 'root-1-child-a2--grandchild-a1-1';

export const simpleData = { menu, index, storyId };
export const loadingData = { menu };

const refs: Record<string, RefType> = {
  optimized: {
    id: 'optimized',
    title: 'This is a ref',
    url: 'https://example.com',
    type: 'lazy',
    index,
    previewInitialized: true,
  },
};

const indexError = new Error('Failed to load index');

const refsError = {
  optimized: {
    ...refs.optimized,
    index: undefined as IndexHash,
    indexError,
  },
};

export const Simple: Story = {
  args: { previewInitialized: true },
  render: (args) => (
    <Sidebar
      {...args}
      menu={menu}
      index={index as any}
      storyId={storyId}
      refId={DEFAULT_REF_ID}
      refs={{}}
      status={{}}
    />
  ),
};

export const Loading: Story = {
  args: { previewInitialized: false },
  render: (args) => (
    <Sidebar {...args} menu={menu} storyId={storyId} refId={DEFAULT_REF_ID} refs={{}} status={{}} />
  ),
};

export const Empty: Story = {
  args: {
    previewInitialized: true,
  },
  render: (args) => (
    <Sidebar
      {...args}
      menu={menu}
      index={{}}
      storyId={storyId}
      refId={DEFAULT_REF_ID}
      refs={{}}
      status={{}}
    />
  ),
};

export const IndexError: Story = {
  args: {
    previewInitialized: true,
  },
  render: (args) => (
    <Sidebar
      {...args}
      indexError={indexError}
      menu={menu}
      storyId={storyId}
      refId={DEFAULT_REF_ID}
      refs={{}}
      status={{}}
    />
  ),
};

export const WithRefs: Story = {
  args: {
    previewInitialized: true,
  },
  render: (args) => (
    <Sidebar
      {...args}
      menu={menu}
      index={index as any}
      storyId={storyId}
      refId={DEFAULT_REF_ID}
      refs={refs}
      status={{}}
    />
  ),
};

export const LoadingWithRefs: Story = {
  args: {
    previewInitialized: false,
  },
  render: (args) => (
    <Sidebar
      {...args}
      menu={menu}
      storyId={storyId}
      refId={DEFAULT_REF_ID}
      refs={refs}
      status={{}}
    />
  ),
};

export const LoadingWithRefError: Story = {
  args: {
    previewInitialized: false,
  },
  render: (args) => (
    <Sidebar
      {...args}
      menu={menu}
      storyId={storyId}
      refId={DEFAULT_REF_ID}
      refs={refsError}
      status={{}}
    />
  ),
};

export const Statuses: Story = {
  args: {
    previewInitialized: true,
    status: Object.entries(index).reduce<State['status']>((acc, [id, item]) => {
      if (item.type !== 'story') {
        return acc;
      }

      return { ...acc, [id]: { something: { status: 'pending', title: '', description: '' } } };
    }, {}),
  },
  render: (args) => (
    <Sidebar
      {...args}
      menu={menu}
      index={index as any}
      storyId={storyId}
      refId={DEFAULT_REF_ID}
      refs={{}}
    />
  ),
};
