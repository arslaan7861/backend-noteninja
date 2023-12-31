// NPM IMPORTS
require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const session = require("express-session");
// const session = require("cookie-session");
const passport = require("passport");

// * LOCAL IMPORTS
require("./config/passport");
const connectDB = require("./db/connect");
const userRouter = require("./routes/user");
const uploadsRouter = require("./routes/uploads");
const notesRouter = require("./routes/notes");
const MongoDBStore = require("connect-mongodb-session")(session);

//* MIDDLEWARE IMPORTS
const notFound = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");

const app = express();
const server = require("http").createServer(app);
app.use(
  cors({
    origin: ["http://localhost:5173", "https://note-ninja.netlify.app"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// session store
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  databaseName: "NOTENNJA",
  collection: "mySessions",
});

app.set("trust proxy", 1);

app.use(
  session({
    secret: "asdf",
    resave: true,
    saveUninitialized: false,
    // maxAge: 1000 * 60 * 60 * 60 * 24 * 7,
    name: "token",
    cookie: {
      maxAge: 1000 * 60 * 60 * 60 * 24 * 7,
      secure: true,
      sameSite: "none",
    },
    store: store,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));
app.use(express.static("./public"));

// routes
app.use("/auth", userRouter);
app.use("/uploads", uploadsRouter);
app.use("/notes", notesRouter);
app.use(errorHandler);
app.use(notFound);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, console.log(`server is listening at port ${port} ...`));
  } catch (error) {
    console.log(error);
  }
};

start();
