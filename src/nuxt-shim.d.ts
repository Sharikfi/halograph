declare module '#app' {
  export function defineNuxtPlugin(plugin: (nuxt: unknown) => void | Promise<void>): unknown
}
