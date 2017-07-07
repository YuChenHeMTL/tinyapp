# TinyApp Project

TinyApp is a full stack web application build with Node and Express that allows users to shorten long URLs (à la bit.ly)

## Final Product

!["The main page"](https://github.com/YuChenHeMTL/tinyapp/blob/master/docs/main_page.jpeg)
!["The login page"](https://github.com/YuChenHeMTL/tinyapp/blob/master/docs/login.jpeg)
!["Creating a new short url"](https://github.com/YuChenHeMTL/tinyapp/blob/master/docs/new_url.jpeg)
!["Index of all user urls"](https://github.com/YuChenHeMTL/tinyapp/blob/master/docs/allurls.jpeg)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Security

All personal information is encrypted using bcrypt, and cookie-session is used to establish a private and secure connection between the server and the client.
If the user is not logged in, all web features are disabled until a valid user is logged in
