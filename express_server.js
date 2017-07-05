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
  res.clearCookie("username");
  res.redirect("/")
})

app.get("/", (req, res) => {
  let templateVars = {username : req.cookies.username}
  res.render("urls_start", templateVars);
});



app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username : req.cookies.username}
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
  let templateVars = { allURL : urlDatabase, shortURL: req.params.id , username: req.cookies.username};
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