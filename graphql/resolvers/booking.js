const Event = require("../../models/event")
const Booking = require("../../models/booking")

const { transformBooking, transformEvent } = require("./merge")

module.exports = {
  bookings: async (args, req) => {
    // makes sure only authenticated users can use bookings
    if (!req.isAuth) {
      throw new Error("Unauthenticated!")
    }
    if (!authHeader) {
      // not authHeader so there must not be a valid token
      req.isAuth = false
      return next() // leave function and request continues with extra meta data
    }
    try {
      const bookings = await Booking.find()
      return bookings.map((booking) => {
        return transformBooking(booking)
      })
    } catch (err) {
      throw err
    }
  },

  bookEvent: async (args, req) => {
    // makes sure only authenticated users can bookEvent
    if (!req.isAuth) {
      throw new Error("Unauthenticated!")
    }
    const fetchedEvent = await Event.findOne({ _id: args.eventId })
    const booking = new Booking({
      user: req.userId, // use real userId after validated
      event: fetchedEvent,
    })
    const result = await booking.save()
    return transformBooking(result)
  },
  cancelBooking: async (args, req) => {
    // makes sure only authenticated users can cancelBooking
    // TODO: make sure user which cancels booking is the one logged in
    if (!req.isAuth) {
      throw new Error("Unauthenticated!")
    }
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
