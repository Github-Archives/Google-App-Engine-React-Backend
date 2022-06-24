const bcrypt = require("bcryptjs") // password hashing

const Event = require("../../models/event") // import our own event Model
const User = require("../../models/user") // import our own user Model
const Booking = require("../../models/booking")

const transformEvent = (event) => {
  return {
    ...event._doc,
    _id: event.id,
    date: new Date(event._doc.date).toISOString(),
    creator: user.bind(this, event.creator),
  }
}
// name 'Event' anything
// _id is a mongoDB id, ID is type
// '!' means it is required/not nullable
// this just cleans up what you're sending RootMutation.createEvent params
// return an array of events !needs to be non-nullable/Event
const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } })
    return events.map((event) => {
      return transformEvent(event)
    })
  } catch (err) {
    throw err
  }
}

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId)
    return transformEvent(event)
  } catch (err) {
    throw err
  }
}

// fetch a user by its id
const user = async (userId) => {
  try {
    const user = await User.findById(userId)
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents),
    }
  } catch (err) {
    throw err
  }
}

module.exports = {
  // Resolver: rootValue is the root object that will be used to resolve queries
  events: async () => {
    // resolver function
    try {
      const events = await Event.find() // allows us to find documents in this collection
      return events.map((event) => {
        return transformEvent(event)
      })
    } catch (err) {
      throw err
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find()
      return bookings.map((booking) => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        }
      })
    } catch (err) {
      throw err
    }
  },
  createEvent: async (args) => {
    // resolver function
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price, // + converts string to number/float
      date: new Date(args.eventInput.date),
      // ! this number is hardcoded rn from events/_id: ObjectId('here')
      creator: "62ad36872f5a4044773b8026", // new user. mongoose will automatically convert this string to a mongoDB id
    }) // Event constructor created by our Mongoose model
    let createdEvent // ?
    try {
      const result = await event.save() // save to mongoDB because of the Mongoose package
      createdEvent = transformEvent(result) // _doc provided by mongoose that leaves out extra metadata
      // ! this SAME number is hardcoded rn from events/_id: ObjectId('here')
      const creator = await User.findById("62ad36872f5a4044773b8026")

      if (!creator) {
        throw new Error("User not found.")
      }
      creator.createdEvents.push(event) // can pass event or id
      await creator.save()

      return createdEvent
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  createUser: async (args) => {
    try {
      // before creating a new user, make sure the email is not already in use in the db
      const existingUser = await User.findOne({ email: args.userInput.email })
      if (existingUser) {
        throw new Error("User exists already.")
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12) // (hash arg sent, salting rounds)

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword, // this would be stored as a plain text password in the database. if someone gets access to db they will see all passwords. so we need to use a hash instead
      })

      const result = await user.save() // save to the db
      // this is now the created user
      return { ...result._doc, password: null, _id: result.id } // password: null so that mutation doesn't return password
    } catch (err) {
      throw err
    }
  },
  bookEvent: async (args) => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId })
    const booking = new Booking({
      user: "62ad36872f5a4044773b8026",
      event: fetchedEvent,
    })
    const result = await booking.save()
    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    }
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event")
      const event = transformEvent(booking._doc.event)
      await Booking.deleteOne({ _id: args.bookingId })
      return event
    } catch (err) {
      throw err
    }
  },
}
