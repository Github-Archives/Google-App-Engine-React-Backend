const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// how a user object should look like in our app/database
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdEvents: [
    {
      type: Schema.Types.ObjectId, // mongoDB exclusive id
      // objectId's from my event.js model. it was exported as this name 'Event'
      ref: "Event", // let mongoose know that two models are related
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
