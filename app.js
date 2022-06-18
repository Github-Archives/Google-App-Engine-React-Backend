const express = require("express")
const bodyParser = require("body-parser")
const { graphqlHTTP } = require("express-graphql") // middleware for graphql
// const { buildSchema } = require("graphql") // takes a string and returns a schema object
const mongoose = require("mongoose") // relates to mongoDB

const graphQlSchema = require("./graphql/schema/index")
const graphQlResolvers = require("./graphql/resolvers/index")

const app = express()

app.use(bodyParser.json()) // parse incoming json bodies

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
    app.listen(3000)
  })
  .catch((err) => {
    console.log("Error: ", err)
  })
