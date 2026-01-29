// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
  dirs: {
    src: [
      './playground',
    ],
  },
})
  .override('nuxt/stylistic', {
    rules: {
      'no-unused-vars': 'off',
    },
  })
  .append(
    {
      rules: {
        'no-plusplus': 'off',
      },
    },
  )
  .append(
    {
      files: ['src/**/*.ts'],
      rules: {
        '@typescript-eslint/no-extraneous-class': 'off',
      },
    },
  )
