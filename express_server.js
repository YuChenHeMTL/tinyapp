const express = require("express");
const bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require("cookie-parser")

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
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
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

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/")
})

app.get("/", (req, res) => {
  let templateVars = {user_id : req.cookies.user_id}
  res.render("urls_start", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id}
  res.render("urls_login", templateVars);
})

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies.user_id};
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id}
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
   var user_id = generateRandomString();
   res.cookie("user_id", user_id);
   users[user_id] = {id: user_id, email: req.body.email, password: req.body.password}
   console.log(users)
  res.redirect("/")
})

app.get("/urls/new", (req, res) => {
  let templateVars = {user_id : req.cookies.user_id}
  res.render("urls_new", templateVars);
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
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { allURL : urlDatabase, shortURL: req.params.id , user_id: req.cookies.user_id};
  res.render("urls_show", templateVars);
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