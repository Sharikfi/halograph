declare module '#app' {
  export function defineNuxtPlugin(plugin: (nuxt: unknown) => void | Promise<void>): unknown
}

declare module '#imports' {
  export function useRuntimeConfig(): {
    public: {
      halograph?: { useProxy?: boolean }
    }
  }
}
