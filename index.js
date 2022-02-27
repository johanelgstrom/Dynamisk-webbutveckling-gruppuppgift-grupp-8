require("dotenv").config();
require("./mongoose.js");

const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const utils = require("./utils.js");

const loginRouter = require("./routes/login-route.js");

const app = express();

app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
  })
);

// app.use((req,res,next) => {
//     const {token} = req.cookies

//     if(token && jwt.verify(token, process.env.JWTSECRET)){
//         const tokenData = jwt.decode(token, process.env.JWTSECRET)
//         res.locals.loggedIn = true
//         res.locals.username = tokenData.username
//     }
//     else {
//         res.locals.loggedIn = false
//     }

//     next()
// })
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

app.use("/", loginRouter);

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
