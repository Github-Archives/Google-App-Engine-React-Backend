const bcrypt = require("bcryptjs") // password hashing
const jwt = require("jsonwebtoken") //

const User = require("../../models/user") // import our own user Model

module.exports = {
  createUser: async (args) => {
    try {
      // before creating a new user, make sure the email is not already in use in the db
      const existingUser = await User.findOne({ email: args.userInput.email })
      if (existingUser) {
        throw new Error("User already exists.")
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
  // validate email/password combination + generate token & return to the user
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email }) // without await it skips to the next lines before getting results
    // user doesn't exist
    if (!user) {
      throw new Error("User does not exist!")
    }
    // generate a hash based on incoming password and compare the two hashes roughly
    const isEqual = await bcrypt.compare(password, user.password)
    // if not equal than user exists, but incorrect password
    if (!isEqual) {
      throw new Error("Password is incorrect!")
    }
    // we have a user & the password is correct!
    // this generates a token
    // 1st arg = optional = data to put in the token
    // 2nd arg = required = string used to hash the token, and later used to validate it.. private key
    //  any token that was not hashed with such a key is invalid
    // 3rd arg = optional = additional configuration
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "somesupersecretkey", // string hashes and validates token
      {
        expiresIn: "1h",
      }
    )
    return {
      userId: user.id,
      token: token,
      tokenExpiration: 1,
    }
  },
}
