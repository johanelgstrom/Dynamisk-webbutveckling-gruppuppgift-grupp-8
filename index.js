require("dotenv").config();
require("./mongoose.js");
require("./passport.js");

const passport = require("passport");

const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const commentsRouter = require("./routes/comments-route.js");
const utils = require("./utils.js");

const loginRouter = require("./routes/login-route.js");
const postsRouter = require("./routes/posts-route.js");
const fileUpload = require("express-fileupload");

const app = express();

app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(fileUpload());
app.use(passport.initialize());

app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      formateDate: (time) => {
        const date = new Date(time);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      }
    }
  })
);

// app.use((req, res, next) => {
//   const { token } = req.cookies;

//   if (token && jwt.verify(token, process.env.JWTSECRET)) {
//     const tokenData = jwt.decode(token, process.env.JWTSECRET);

//     res.locals.loginInfo = tokenData.displayName + " " + tokenData.id;
//   } else {
//     res.locals.loginInfo = "not logged in";
//   }

//   next();
// });

app.use((req, res, next) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    const tokenData = jwt.decode(token, process.env.JWTSECRET);
    res.locals.loggedIn = true;
    res.locals.fullName = tokenData.fullName;
    res.locals.loginInfo = tokenData.displayName;
  } else {
    res.locals.loggedIn = false;
  }

  next();
});
// const forceAuthorize = (req,res,next) => {
//     const {token} = req.cookies

//     if (token && jwt.verify(token, process.env.JWTSECRET)){
//         next()
//     }
//     else {
//         res.sendStatus(401)
//     }
// }

// app.get("/", async (req, res) => {
//   res.render("home");
// });
app.use("/comments", commentsRouter);
app.use("/", loginRouter);
app.use("/posts", postsRouter);

app.use("/", (req, res) => {
  res.status(404).render("not-found");
});

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
