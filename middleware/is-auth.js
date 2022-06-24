// checks if we have valid token, but doesn't throw an error it just sets some extra data on the request = isAuth & if isAuth=true, then also the userId.. which help us fetch user from the db
const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  // look at incoming req/headers
  const authHeader = req.get("Authorization")
  if (!authHeader) {
    // not authHeader so there must not be a valid token
    req.isAuth = false
    return next() // leave function and request continues with extra meta data
  }
  const token = authHeader.split(" ")[1] // "Bearer tokenstring" = extract token from header. unsure what [1] is
  if (!token || token === "") {
    req.isAuth = false
    return next()
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, "somesupersecretkey")
  } catch (err) {
    req.isAuth = false
    return next()
  }
  if (!decodedToken) {
    req.isAuth = false
    return next()
  }
  // token is valid
  req.isAuth = true
  req.userId = decodedToken.userId
  next()
}
