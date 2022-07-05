const express = require("express")
const bodyParser = require("body-parser")
const { graphqlHTTP } = require("express-graphql") // middleware for graphql
// const { buildSchema } = require("graphql") // takes a string and returns a schema object
const mongoose = require("mongoose") // relates to mongoDB

const graphQlSchema = require("./graphql/schema/index")
const graphQlResolvers = require("./graphql/resolvers/index")

const isAuth = require("./middleware/is-auth")

// Middleware
const app = express()

app.use(bodyParser.json()) // parse incoming json bodies

// since server and client have different urls CORS are triggered without this. we need to set the correct headers
app.use((req, res, next) => {
  // add headers to every response that is sent back by our server
  res.setHeader("Access-Control-Allow-Origin", "*") // * means every host/client/location can send requests to this server!
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS") // restricts methods allowed
  res.setHeader("Access-Control-Allow-Headers", "Content-Type", "Authorization") // restrict headers allowed to send to server
  if (req.method === "OPTIONS") {
    // OPTIONS = necessary browser related request before it looks for POST/GET
    return res.sendStatus(200) // signals to the client that this is good
  }
  next() // continue your request
})

// use the middleware to check if isAuthorized
app.use(isAuth)

app.use(
  "/graphql", // single endpoint. '/graphql' can be named anything
  graphqlHTTP({
    // middleware
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true, // enables the GraphiQL interface (optional)
  })
)
// Connect to the cloud mongoDb database with credentials & db name. somehow 'hooks' into the mongoDB database when running
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.t1ymu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(8000)
  })
  .catch((err) => {
    console.log("Error: ", err)
  })