const express = require("express");
const bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieSession = require("cookie-session")
const bcrypt = require("bcrypt")


app.use(express.static("views"))
app.use(cookieSession({
  name:"session",
  keys:["key1"]
}))
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended : true}));

const urlDatabase = {}

const users = {
  "userRandomID": {
    id: "userRandomID",
    username: "caonima",
    email: "qwer@w",
    password: bcrypt.hashSync("qwer", 10),
    url:{"qwer12":"qwerqwer"}
  },
 "user2RandomID": {
    id: "user2RandomID",
    username: "lmao gg ez",
    email: bcrypt.hashSync("user2@example.com", 10),
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
  req.session = null;
  res.redirect("/")
})

app.get("/", (req, res) => {
  let templateVars = {user_id : req.session.user_id, users: users}
  res.render("urls_start", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {user_id: req.session.user_id, login:req.session.login, users: users}
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  for (someone in users){
    if (req.body.email === users[someone].email && bcrypt.compareSync(req.body.password, users[someone].password)){
      req.session.user_id = users[someone].id;
      console.log(req.session.user_id);
      req.session.login = true;
      res.redirect("/urls");
      return ;
    }
  }
  req.session.login = true;
  res.redirect("/login")
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(403, "/login")
  } else {
  let templateVars = {user_id: req.session.user_id, users:users};
  res.render("urls_index", templateVars);
  }
});

app.get("/register", (req, res) => {
  let templateVars = {user_id: req.session.user_id, users:users}
  res.render("urls_register", templateVars)
})

app.post("/register", (req, res) => {
  if (req.body.email==="" || req.body.password===''){
    res.redirect(403, "/register");
  }
  for (var user in users){
    if (req.body.email === users[user].email){
      res.redirect(403, "/register");
    }
  }
   let user_id = generateRandomString();
   users[user_id] = {id: user_id, username : req.body.username, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10), url: {}}
   res.redirect("/login")
})

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(403, "/login")
  } else {
  let templateVars = {user_id : req.session.user_id, users:users};
  res.render("urls_new", templateVars);
  }
});

app.post("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(403, "/login")
  } else {
    if (req.body.longURL.substr(0, 4) !== "http"){
      res.redirect(403, "/urls/new")
    } else {
      let randomString = generateRandomString();
      users[req.session.user_id]["url"][randomString] = req.body.longURL
      urlDatabase[randomString] = req.body.longURL
      res.redirect("/urls");
    }
  }
});

app.get("/urls/:id", (req, res) => {
  req.session.wrongURL = false;
  if (!req.session.user_id) {
    res.redirect(403, "/login")
  } else {
  let templateVars = {shortURL: req.params.id , user_id: req.session.user_id, users:users};
  res.render("urls_show", templateVars);
  }
});

app.get("/:someid/delete", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(403, "/login")
  } else {
    if (users[req.session.user_id]["url"].hasOwnProperty(req.params.somekey) === true){
      res.redirect(403, "/urls")
      console.log(users)
    } else {
      let shorturl = req.params.someid;
      delete users[req.session.user_id]["url"][shorturl]
      delete urlDatabase[shorturl]
      res.redirect("/urls")
    }
  }
})

app.get("/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



app.post("/urls/:somekey", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(403, "/login")
  } else {
    if (users[req.session.user_id]["url"].hasOwnProperty(req.params.somekey) === false){
      res.redirect(403, "/")
    } else {
      users[req.session.user_id]["url"][req.params.somekey] = req.body["longURL"]
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