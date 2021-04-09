const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

/**
  Do what needs to be done to support sessions with the `express-session` package!
  To respect users' privacy, do NOT send them a cookie unless they log in.
  This is achieved by setting 'saveUninitialized' to false, and by not
  changing the `req.session` object unless the user authenticates.

  Users that do authenticate should have a session persisted on the server,
  and a cookie set on the client. The name of the cookie should be "chocolatechip".

  The session can be persisted in memory (would not be adequate for production)
  or you can use a session store like `connect-session-knex`.
 */

const sessionConfig = {
  name: "chocolatechip",
  secret: "i am so hungry i could die",
  cookie: {
    maxAge: 60 * 60 * 1000,
    secure: false, // true if in production
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: false,
  store: new KnexSessionStore({
    knex: require("../data/db-config.js"),
    tablename: "sessions",
    sidfieldname: "sid",
    createtable: true,
    clearInterval: 60 * 60 * 1000,
  }),
};

const server = express();
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

const authRouter = require("./auth/auth-router");
const usersRouter = require("./users/users-router");

server.use("/api/users", usersRouter);
server.use("/api/auth", authRouter);

server.get("/", (req, res) => {
  res.json({ api: "functional!!!" });
});

server.use((error, req, res, next) => {
  // eslint-disable-line
  const errorStatus = error.status || 500;
  const errorMessage = error.message || "Error with the server";
  res.status(errorStatus).json({
    message: errorMessage,
    stack: error.stack,
  });
});

module.exports = server;
