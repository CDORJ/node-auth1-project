// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!

const bcrypt = require("bcryptjs");
const mw = require("./auth-middleware");
const router = require("express").Router();
const User = require("../users/users-model");

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

router.post(
  "/register",
  mw.checkUsernameFree,
  mw.checkPasswordLength,
  async (req, res, next) => {
    let user = req.body;
    let hash = bcrypt.hashSync(user.password, 15);
    user.password = hash;
    try {
      const newUser = await User.add(user);
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }
);

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

router.post("/login", mw.checkUsernameExists, async (req, res, next) => {
  let { username, password } = req.body;
  try {
    const user = await User.findBy({ username }).first();
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.status(200).json({ message: `Welcome ${user.username}` });
    } else {
      const err = new Error();
      err.statusCode = 401;
      err.message = "Invalid Password";
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(200).json({ message: "not logged in", error: err });
      } else {
        res.status(200).json({ message: "You are now logged out" });
      }
    });
  } else {
    res.end();
  }
});

// Don't forget to add the router to the `exports` object so it can be required in other modules

module.exports = router;
