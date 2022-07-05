const authResolver = require("./auth")
const eventsResolver = require("./events")
const bookingResolver = require("./booking")

// merge them into one root resolver
const rootResolver = {
  ...authResolver,
  ...eventsResolver,
  ...bookingResolver,
}

module.exports = rootResolver
