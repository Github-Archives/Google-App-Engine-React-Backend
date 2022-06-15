const express = require("express")
const bodyParser = require("body-parser")
const { graphqlHTTP } = require("express-graphql") // middleware for graphql
const { buildSchema } = require("graphql") // takes a string and returns a schema object
const mongoose = require("mongoose") // relates to mongoDB
const bcrypt = require("bcryptjs") // password hashing

const Event = require("./models/event") // import our own event Model
const User = require("./models/user") // import our own user Model

const app = express()

app.use(bodyParser.json()) // parse incoming json bodies

const events = (eventIds) => {
  return Event.find({ _id: { $in: eventIds } })
    .then((events) => {
      return events.map((event) => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event.creator),
        }
      })
    })
    .catch((err) => {
      throw err
    })
}

// fetch a user by its id
const user = (userId) => {
  return User.findById(userId)
    .then((user) => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents),
      }
    })
    .catch((err) => {
      throw err
    })
} //

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
                creator: User!
            }

            type User {
                _id: ID!
                email: String!
                password: String
                createdEvents: [Event!]
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
              return {
                ...event._doc,
                _id: event.id,
                creator: user.bind(this, event._doc.creator), // ?
              }
            })
          })
          .catch((err) => {
            throw err
          })
      },
      createEvent: (args) => {
        // resolver function
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price, // + converts string to number/float
          date: new Date(args.eventInput.date),
          creator: "62a9348fa3bb6396bf534734", // new user. mongoose will automatically convert this string to a mongoDB id
        }) // Event constructor created by our Mongoose model
        let createdEvent // ?
        return event
          .save() // save to mongoDB because of the Mongoose package
          .then((result) => {
            // alternative -> return result; // returns too much metadata
            createdEvent = { ...result._doc, _id: result._doc._id.toString() } // _doc provided by mongoose that leaves out extra metadata
            return User.findById("62a9348fa3bb6396bf534734") //
          })
          .then((user) => {
            if (!user) {
              throw new Error("User not found")
            }
            user.createdEvents.push(event) // can pass event or id
            return user.save()
          })
          .then((result) => {
            return createdEvent
          })
          .catch((err) => {
            console.log("Save Error: ", err)
            throw err // graphql will throw an error too
          })
      },
      createUser: (args) => {
        // before creating a new user, make sure the email is not already in use in the db
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User already exists") // ! might need to delete this .then() statement
            }
            return bcrypt.hash(args.userInput.password, 12) // (hash arg sent, salting rounds)
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword, // this would be stored as a plain text password in the database. if someone gets access to db they will see all passwords. so we need to use a hash instead
            })
            return user.save() // save to the db
          })
          .then((result) => {
            // this is now the created user
            return { ...result._doc, password: null, _id: result.id } // password: null so that mutation doesn't return password
          })
          .catch((err) => {
            throw err
          })
      },
    },
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
