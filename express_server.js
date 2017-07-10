const express = require("express");
const bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");


app.use(express.static("views"));
app.use(cookieSession({
  name:"session",
  keys:["key1"]
}));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended : true}));

const urlDatabase = {};
//This is an extra database to store all the shortened urls and their links
//The point of this database is to be able to access the short urls without having to login

const users = {};

//This is the main database to store all the information about the users
//using this database, users can only see their own urls
//This also avoids unauthorized deletion or modification of urls
const url_stats = {};

//the object where all url stats is stored

function generateRandomString(){
  var finalString = "";
  finalString = Math.random().toString(36).substr(2, 6);
  return finalString;
}

function getDate (){
  let currentDate = new Date();
  let utcDate = currentDate.toUTCString();
  return currentDate;
}
//Generate a random 6 letter or number string
//generates user id and short urls


app.get("/error", (req, res) => {
  let templateVars = {user_id : req.session.user_id, users: users};
  res.render("urls_error", templateVars);
});
//The error page modified depending on the error

app.get("/", (req, res) => {
  let templateVars = {user_id : req.session.user_id, users: users};
  res.render("urls_start", templateVars);
});
//the main page


app.get("/login", (req, res) => {
  let templateVars = {user_id: req.session.user_id, login:req.session.login, users: users};
  res.render("urls_login", templateVars);
});
//The login page
//If the user hasnt logged in, he cant use any service of the page

app.post("/login", (req, res) => {
  for (let someone in users){
    if (req.body.email === users[someone].email && bcrypt.compareSync(req.body.password, users[someone].password)){
      req.session.user_id = users[someone].id;
      req.session.login = true;
      res.redirect("/urls");
      return ;
    }
  }
  req.session.login = true;
  res.redirect("/login");
});
//the POST option of the login page
//The "login = true" is for the display of the "try again" message in urls_login

app.get("/logout", (req,res) => {
  req.session = null;
  res.redirect("/");
});
//log out the current user and clear the session

app.get("/urls", (req, res) => {
  if (!req.session.user_id || !users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/error");
  } else {
  let templateVars = {user_id: req.session.user_id, users:users};
  res.render("urls_index", templateVars);
  }
});
//The index page where all urls of the user is displayed

app.get("/register", (req, res) => {
  let templateVars = {user_id: req.session.user_id, users:users};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email==="" || req.body.password===''){
    res.redirect("/error");
  } else {
    for (var user in users){
      if (req.body.email === users[user].email){
        res.redirect("/error");
        return;
      }
    }
     let user_id = generateRandomString();
     users[user_id] = {id: user_id,  email: req.body.email, password: bcrypt.hashSync(req.body.password, 10), url: {}};
     res.redirect("/login");
   }
});

// the page where the user can register
// if the email or the password is blank, return to error page
// if the email is another user's, return to error page
// if registration succesful, give a random 6 digit string to the user_id

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id || !users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/error");
  } else {
  let templateVars = {user_id : req.session.user_id, users:users};
  res.render("urls_new", templateVars);
  }
});

//access to the page to create a new short url
//if user is not logged in, redirect to error page

app.post("/urls/new", (req, res) => {
  if (!req.session.user_id || !users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/error");
  } else {
    if (req.body.longURL.substr(0, 4) !== "http"){
      res.redirect("/error");
    } else {
      let randomString = generateRandomString();
      url_stats[randomString] = {};
      url_stats[randomString].userCounter = 0;
      url_stats[randomString].uniqueUser = [];
      users[req.session.user_id]["url"][randomString] = req.body.longURL;
      urlDatabase[randomString] = req.body.longURL;
      res.redirect("/urls");
    }
  }
});

//creation of a new url
//if user is not logged in, redirect to error page
//if the link doesnt start with http, redirect to error page


app.get("/urls/:id", (req, res) => {
  req.session.wrongURL = false;
  if (!req.session.user_id || !users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/error");
  } else {
  let templateVars = {shortURL: req.params.id , user_id: req.session.user_id, users:users};
  res.render("urls_show", templateVars);
  }
});
//go to the page to edit the current url
//if user is not logged in, redirect to error page


app.post("/urls/:somekey", (req, res) => {
  if (!req.session.user_id || !users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/error");
  } else {
    if (users[req.session.user_id].url.hasOwnProperty(req.params.somekey) === false){
      res.redirect("/error");
    } else {
      users[req.session.user_id].url[req.params.somekey] = req.body.longURL;
      urlDatabase[req.params.somekey] = req.body.longURL;
      res.redirect("/urls");
    }
  }
});

//edition of the current url
//if user is not logged in, redirect to error page
//if user doesn't own the short url, redirect to error page


app.post("/urls/:someid/delete", (req, res) => {
  if (!req.session.user_id || !users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/error");
  } else {
    if (users[req.session.user_id]["url"].hasOwnProperty(req.params.someid) === false){
      res.redirect("/error");
    } else {
      let shorturl = req.params.someid;
      delete users[req.session.user_id]["url"][shorturl];
      delete urlDatabase[shorturl];
      res.redirect("/urls");
    }
  }
});

//deletion of urls
//if user is not logged in, redirect to error page
//if user doesn't own the short url, redirect to error page

app.get("/u/:shortURL", (req, res) => {
  let miniURL = req.params.shortURL;
  url_stats[miniURL].userCounter += 1 ;
  if (req.session.user_id){
    for (let i = 0; i < url_stats[miniURL].uniqueUser.length; i++){
      if (url_stats[miniURL].uniqueUser[i].id === req.session.user_id ){
        url_stats[miniURL].uniqueUser[i].time = getDate();
        let OriginalURL = urlDatabase[miniURL];
        res.redirect(OriginalURL);
        return;
      }
    }
    url_stats[miniURL].uniqueUser.push({id : req.session.user_id, time : getDate()});
    let longURL = urlDatabase[miniURL];
    res.redirect(longURL);
    return;
  }
  let longLink = urlDatabase[miniURL];
  res.redirect(longLink);
});

app.get("/urls/:short/stats", (req, res) => {
  if (!req.session.user_id || !users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/error");
  } else {
    let miniURL = req.params.short;
    let templateVars = {user_id: req.session.user_id, users: users, url_stats: url_stats, miniURL: miniURL};
    res.render("urls_stats", templateVars)
  }
})

//redirect to the corresponding long url page


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
