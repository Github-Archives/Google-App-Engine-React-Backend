const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;; // middleware
const {buildSchema} = require('graphql');


// GraphQL schema
var schema = buildSchema(`
  type Query {
    message: String
  }
`);

// Root Resolver
// we can attach a function which is called each time
// a query from our schema needs to be executed
root = {
  message: () => 'Hello World'
}

// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', expressGraphQL({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

// Start the server
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));
