const Event = require("../../models/event") // import our own event Model
const User = require("../../models/user") // import our own user Model

const { transformEvent } = require("./merge")

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

  createEvent: async (args, req) => {
    // makes sure only authenticated users can createEvent
    if (!req.isAuth) {
      throw new Error("Unauthenticated!")
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price, // + converts string to number/float
      date: new Date(args.eventInput.date),
      creator: req.userId, // real id of the user
      // ! this number is hardcoded rn from events/_id: ObjectId('here')
      //   creator: "62ad36872f5a4044773b8026", // new user. mongoose will automatically convert this string to a mongoDB id
    }) // Event constructor created by our Mongoose model
    let createdEvent // ?
    try {
      const result = await event.save() // save to mongoDB because of the Mongoose package
      createdEvent = transformEvent(result) // _doc provided by mongoose that leaves out extra metadata
      const creator = await User.findById(req.userId) // real id of the user
      // ! this SAME number is hardcoded rn from events/_id: ObjectId('here')
      //   const creator = await User.findById("62ad36872f5a4044773b8026")

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
}
