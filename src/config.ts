require('dotenv').config()

export default {
  apiHost: process.env.CACHER_API_HOST || 'https://api.cacher.io'
}
