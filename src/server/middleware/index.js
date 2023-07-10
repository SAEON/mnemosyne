export { default as checkContinue } from './check-continue/index.js'
export { default as cors } from './cors/index.js'
export { default as parseResource } from './parse-resource/index.js'
export { default as userinfo } from './userinfo/index.js'
export { default as createContext } from './ctx/index.js'

export default async function applyMiddleware(ctx, ...middleware) {
  for (const fn of middleware) {
    await fn.call(ctx)
  }
}
