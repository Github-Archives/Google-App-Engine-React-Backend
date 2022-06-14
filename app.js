const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql'); // middleware for graphql
const { buildSchema } = require('graphql') // takes a string and returns a schema object


const app = express();

app.use(bodyParser.json()); // parse incoming json bodies

app.use(
    '/graphql', // single endpoint. '/graphql' can be named anything
    graphqlHTTP({ // middleware
        schema: buildSchema(`
            type RootQuery {
                events:[String!]!
            }

            type RootMutation {
                createEvent(name: String): String
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: { // Resolver: rootValue is the root object that will be used to resolve queries
            events: () => {
                return ['Romantic Cooking', 'Sailing', 'Hiking'];
            },
            createEvent: (args) => {
                const eventName = args.name;
                return eventName;
            }
        },
        graphiql: true // enables the GraphiQL interface (optional)
    })
);

app.listen(3000)


