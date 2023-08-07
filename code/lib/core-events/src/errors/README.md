# Storybook Errors

Storybook provides a utility to manage errors thrown from it. Storybook errors reside in this package and are categorized into:

1. **[Client errors](./client-errors.ts)**
   - Errors which occur in the preview area of Storybook
   - e.g. Rendering issues, addons, Storybook UI, etc.
   - available in `@storybook/core-events/client-errors`
2. **[Server errors](./server-errors.ts)**
   - Any Errors that happen in node
   - e.g. Storybook init command, dev command, builder errors (Webpack, Vite), etc.
   - available in `@storybook/core-events/server-errors`

## How to create errors

First, find which file your error should be part of, based on the criteria above.
Second use the `StorybookError` class to define custom errors with specific codes and categories for use within the Storybook codebase. Below is a detailed documentation for the error properties:

### Class Structure

```typescript
export class YourCustomError extends StorybookError {
  readonly category: Category; // The category to which the error belongs.
  readonly code: number; // The numeric code for the error.
  readonly telemetry?: boolean; // Optional. If set to `true`, telemetry will be used to send errors. Only for client-based errors.

  template(): string {
    // A function that returns the error message.
  }
}
```

### Properties

| Name           | Type                                          | Description                                                                                                                                                |
| -------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------  |
| category       | `Category`                                    | The category to which the error belongs.                                                                                                                   |
| code           | `number`                                      | The numeric code for the error.                                                                                                                            |
| template       | `(...data: any[]) => string`                  | A properly written error message or a function that takes data arguments and returns an error, for dynamic messages.                                       |
| documentation  | `boolean` or `string`                         | Optional. Should be set to `true` **if the error is documented on the Storybook website**. If defined as string, it should be a custom documentation link. |
| telemetry      | `boolean`                                     | Optional. If set to `true`, telemetry will be used to send errors. **Only for client based errors**.                                                       |

## Usage Example

```typescript
// Define a custom error with a numeric code and a static error message template.
export class StorybookIndexGenerationError extends StorybookError {
  category = Category.Generic;
  code = 1;
  telemetry = true;

  template(): string {
    return `Storybook failed when generating an index for your stories. Check the stories field in your main.js`;
  }
}

// Define a custom error with a numeric code and a dynamic error message template based on properties from the constructor.
export class InvalidFileExtensionError extends StorybookError {
  category = Category.Validation;
  code = 1;
  telemetry = true;
  documentation = 'https://some-custom-documentation.com/validation-errors'
  
  constructor(fileName: string) {
    super();
  }

  template(): string {
    return `Invalid file extension found: ${fileName}.`;
  }
}

// import the errors where you need them, i.e.
import { StorybookIndexGenerationError, InvalidFileExtensionError } from '@storybook/core-events/server-errors'

// "[SB_Generic_0001] Storybook failed when generating an index for your stories. Check the stories field in your main.js.
throw StorybookIndexGenerationError();

// "[SB_Validation_0002] Invalid file extension found: mtsx. More info: https://some-custom-documentation.com/validation-errors"
throw InvalidFileExtensionError('mtsx');
```

## How to write a proper error message

Writing clear and informative error messages is crucial for effective debugging and troubleshooting. A well-crafted error message can save developers and users valuable time. Consider the following guidelines:

- **Be clear and specific:** Provide straightforward error messages that precisely describe the issue.
- **Include relevant context:** Add details about the error's origin and relevant context to aid troubleshooting.
- **Provide guidance for resolution:** Offer actionable steps to resolve the error or suggest potential fixes.
- **Provide documentation links:** Whenever applicable, provide links for users to get guidance or more context to fix their issues.

<img src="./message-reference.png" width="800px" />

✅ Here are a few recommended examples:

Long:
```
Couldn't find story matching 'xyz' after HMR.
  - Did you just rename a story?
  - Did you remove it from your CSF file?
  - Are you sure a story with that id exists?
  - Please check the stories field of your main.js config.
  - Also check the browser console and terminal for potential error messages.
```

Medium:
```
Addon-docs no longer uses configureJsx or mdxBabelOptions in 7.0.

To update your configuration, please see migration instructions here:

https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropped-addon-docs-manual-babel-configuration
```

Short:
```
Failed to initialize Storybook.

Do you have an error in your \`preview.js\`? Check your Storybook's browser console for errors.
```

❌ Here are a few unrecommended examples:

```
outputDir is required
```

```
Cannot render story
```

```
no builder configured!
```

## What's the motivation for this errors framework?

Centralizing and categorizing errors offers several advantages:

Better understanding of what is actually failing: By defining categories, error origins become more evident, easing the debugging process for developers and providing users with actionable insights.

Improved Telemetry: Aggregating and filtering errors allows better assessment of their impact, which helps in prioritization and tackling the issues.

Improved Documentation: Categorized errors lead to the creation of a helpful errors page on the Storybook website, benefiting users with better guidance and improving overall accessibility and user experience.