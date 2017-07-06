const express = require("express");
const bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require("cookie-parser")

app.use(express.static("views"))
app.use(cookieParser())
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended : true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "qwer@w",
    password: "qwer"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString(){
  var finalString = ""
  finalString = Math.random().toString(36).substr(2, 6);
  return finalString
};

app.get("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.clearCookie("login")
  res.redirect("/")
})

app.get("/", (req, res) => {
  let templateVars = {user_id : req.cookies.user_id, users: users}
  res.render("urls_start", templateVars);
});

app.get("/login", (req, res) => {
  // if (req.cookies.login === "failed" ){
    // res.clearCookie("login")
  // }
  let templateVars = {user_id: req.cookies.user_id, login:req.cookies.login, users: users}
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  for (someone in users){
    if (req.body.email === users[someone].email && req.body.password === users[someone].password){
      res.cookie("user_id", users[someone].id);
      res.cookie("login", "success");
      res.redirect("/urls");
      return ;
    }
  }
        res.cookie("login", "failed");
      res.redirect("/login")
});

app.get("/urls", (req, res) => {
  if (req.cookies.login === "failed" || !req.cookies.login) {
    // res.send("hello")
    res.redirect("/login")
  } else {
  let templateVars = { urls: urlDatabase, user_id: req.cookies.user_id, users:users};
  res.render("urls_index", templateVars);
  }
});

app.get("/register", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id, users:users}
  res.render("urls_register", templateVars)
})

app.post("/register", (req, res) => {
  if (req.body.email==="" || req.body.password===''){
    console.log(404)
    res.redirect(404);
  }
  for (var user in users){
    if (req.body.email === users[user].email){
      res.redirect(400);
    }
  }
   let user_id = generateRandomString();
   users[user_id] = {id: user_id, email: req.body.email, password: req.body.password}
  res.redirect("/login")
})

app.get("/urls/new", (req, res) => {
  if (req.cookies.login === "failed" || !req.cookies.login) {
    res.redirect("/login")
  } else {
  let templateVars = {user_id : req.cookies.user_id, users:users};
  res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect("/urls/" + randomString);
});

app.post("/:someid/delete", (req, res) => {
  let shorturl = req.params.someid;
  delete urlDatabase[shorturl]
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  if (req.cookies.login === "failed" || !req.cookies.login) {
    res.redirect("/login")
  } else {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.cookies.login === "failed" || !req.cookies.login) {
    res.redirect("/login")
  } else {
  let templateVars = { allURL : urlDatabase, shortURL: req.params.id , user_id: req.cookies.user_id, users:users};
  res.render("urls_show", templateVars);
  }
});

app.post("/urls/:somekey", (req, res) => {
    urlDatabase[req.params.somekey] = req.body["longURL"]
  res.redirect("/urls")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});