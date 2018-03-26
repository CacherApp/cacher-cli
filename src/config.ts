require('dotenv').config()

export default {
  appHost: process.env.CACHER_APP_HOST || 'https://app.cacher.io',
  apiHost: process.env.CACHER_API_HOST || 'https://api.cacher.io',
  snippetsHost: process.env.CACHER_SNIPPETS_HOST || 'https://snippets.cacher.io'
}
