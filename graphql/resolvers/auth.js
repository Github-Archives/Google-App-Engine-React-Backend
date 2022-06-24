const bcrypt = require("bcryptjs") // password hashing

const User = require("../../models/user") // import our own user Model

module.exports = {
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
}
