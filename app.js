const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql"); // middleware for graphql
const { buildSchema } = require("graphql"); // takes a string and returns a schema object
const mongoose = require("mongoose"); // relates to mongoDB
const bcrypt = require("bcryptjs"); // password hashing

const Event = require("./models/event"); // import our own event Model
const User = require("./models/user"); // import our own user Model

const app = express();

app.use(bodyParser.json()); // parse incoming json bodies

// name 'Event' anything
// _id is a mongoDB id, ID is type
// '!' means it is required/not nullable
// this just cleans up what you're sending RootMutation.createEvent params
// return an array of events !needs to be non-nullable/Event

app.use(
  "/graphql", // single endpoint. '/graphql' can be named anything
  graphqlHTTP({
    // middleware
    schema: buildSchema(`

            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type User {
                _id: ID!
                email: String!
                password: String
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            input UserInput {
                email: String!
                password: String!
            }

            type RootQuery {
                events:[Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
                createUser(userInput: UserInput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),

    // Resolvers
    rootValue: {
      // Resolver: rootValue is the root object that will be used to resolve queries
      events: () => {
        // resolver function
        return Event.find() // allows us to find documents in this collection
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc, _id: event.id };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        // resolver function
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price, // + converts string to number/float
          date: new Date(args.eventInput.date),
        }); // Event constructor created by our Mongoose model
        return event
          .save() // save to mongoDB because of the Mongoose package
          .then((result) => {
            console.log(result);
            // return result; // returns too much metadata
            return { ...result._doc, _id: event.id }; // _doc provided by mongoose that leaves out extra metadata
          })
          .catch((err) => {
            console.log("Save Error: ", err);
            throw err; // graphql will throw an error too
          });
      },
      createUser: (args) => {
        return bcrypt
          .hash(args.userInput.password, 12) // (hash arg sent, salting rounds)
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword, // this would be stored as a plain text password in the database. if someone gets access to db they will see all passwords. so we need to use a hash instead
            });
            return user.save(); // save to the db
          })
          .then((result) => {
            // this is now the created user
            return { ...result._doc, _id: result.id };
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    graphiql: true, // enables the GraphiQL interface (optional)
  })
);
// Connect to the cloud mongoDb database with credentials & db name. somehow 'hooks' into the mongoDB database when running
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.t1ymu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
