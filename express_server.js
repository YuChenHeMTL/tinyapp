const express = require("express");
const bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require("cookie-parser")

app.use(express.static("views"))
app.use(cookieParser())
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended : true}));

const urlDatabase = {}

const users = {
  "userRandomID": {
    id: "userRandomID",
    username: "caonima",
    email: "qwer@w",
    password: "qwer",
    url:{"qwer12":"qwerqwer"}
  },
 "user2RandomID": {
    id: "user2RandomID",
    username: "lmao gg ez",
    email: "user2@example.com",
    password: "dishwasher-funk",
    url :{}
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
  if (req.cookies.login === "failed" ){
    res.clearCookie("login")
  }
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
    res.redirect("/login")
  } else {
  let templateVars = {user_id: req.cookies.user_id, users:users};
  res.render("urls_index", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.cookies.username === "existing"){
    res.clearCookie("username")
  }
  if (req.cookies.email === "existing"){
    res.clearCookie("email")
  }
  let templateVars = {user_id: req.cookies.user_id, users:users}
  res.render("urls_register", templateVars)
})

app.post("/register", (req, res) => {

  if (req.body.email==="" || req.body.password===''){
    console.log(404)
    res.redirect(403, "/register");
  }
  for (var user in users){
    if (req.body.email === users[user].email){
      res.redirect(403, "/register");
    }
  }
   let user_id = generateRandomString();
   users[user_id] = {id: user_id, username : req.body.username, email: req.body.email, password: req.body.password, url: {}}
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

app.post("/urls/new", (req, res) => {
  if (req.cookies.login === "failed" || !req.cookies.login) {
    res.redirect("/login")
  } else {
  let randomString = generateRandomString();
  users[req.cookies.user_id]["url"][randomString] = req.body.longURL
  urlDatabase[randomString] = req.body.longURL
  res.redirect("/urls/" + randomString);
  }
});

app.post("/:someid/delete", (req, res) => {
  if (req.cookies.login === "failed" || !req.cookies.login) {
    res.redirect("/login")
  } else {
    if (users[req.cookies.user_id]["url"].hasOwnProperty(req.params.somekey) === true){
      res.redirect(403, "/urls")
      console.log(users)
    } else {
      let shorturl = req.params.someid;
      delete users[req.cookies.user_id]["url"][shorturl]
      delete urlDatabase[shorturl]
      res.redirect("/urls")
    }
  }
})

app.get("/:shortURL", (req, res) => {
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
  let templateVars = {shortURL: req.params.id , user_id: req.cookies.user_id, users:users};
  res.render("urls_show", templateVars);
  }
});

app.post("/urls/:somekey", (req, res) => {
  if (req.cookies.login === "failed" || !req.cookies.login) {
    res.redirect("/login")
  } else {
    if (users[req.cookies.user_id]["url"].hasOwnProperty(req.params.somekey) === false){
      res.redirect(403, "/")
    } else {
      users[req.cookies.user_id]["url"][req.params.somekey] = req.body["longURL"]
      urlDatabase[req.params.somekey] = req.body["longURL"]
      res.redirect("/urls")
    }
  }
})

app.get("/urls.json", (req, res) => {
  res.json(users);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});