const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");
// const cookieSession = require('cookie-session');
// const cookieParser = require('cookie-parser');
const passportSetup = require("./config/passport-setup");

const port = 4000;


app.use(session());

// app.use(cookieSession({
//     name: 'session',
//     keys: ['key1', 'key2'],
//     maxAge: 24 * 60 *60 * 1000 //24 hours
// }));

// app.use(cookieParser('secret'));

app.use(passport.initialize());

app.get("/auth/discord", passport.authenticate("discord", { permissions: 8 }));
app.get("/auth/discord/callback", passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect("http://localhost:3000/")
});

app.listen(port, () => console.log(`Server is running on port ${port}`))
