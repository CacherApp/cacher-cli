import 'dotenv/config'

export const appConfig = {
  apiHost: process.env.CACHER_API_HOST || 'https://api.cacher.io',
  appHost: process.env.CACHER_APP_HOST || 'https://app.cacher.io',
  env: process.env.CACHER_ENV || 'production',
  snippetsHost: process.env.CACHER_SNIPPETS_HOST || 'https://snippets.cacher.io'
}
