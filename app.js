const express = require('express');
const app =express();
const path = require('path');
const mongoose = require('mongoose');
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const User = require("./models/User.js");
const port = 3000;
const veiwsPath=path.join(__dirname,'./views');
const partialsPath = path.join(__dirname,'./views/partials');
const hbs = require('hbs');
const authenticateUser = require("./middlewares/authenticateUser");

// views engine set
app.use(express.urlencoded({ extened: true }));
app.set('views',veiwsPath)
app.set('view engine','hbs');

//session
app.use(
  cookieSession({
    keys: ["randomStringASyoulikehjudfsajk"],
  })
);

// hbs path set 
hbs.registerPartials(partialsPath); 

// mongoose connect
const url = "mongodb+srv://bhxshxn:bhxshxn@9@cluster0.ixoza.mongodb.net/MediBoxretryWrites=true&w=majority"
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,

})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
   console.log('Database is connected successfully on port 27017!!!');
});


// root render
app.get('/',(req,res)=>{
    res.render("main/form.hbs")
})

// login render
app.get('/login',(req,res)=>{
    res.render("main/login.hbs")
})

// Signup render
app.get('/signup',(req,res)=>{
    res.render("main/signup.hbs")
})

//home
app.get("/home", authenticateUser, (req, res) => {
  res.render("main/home", { user: req.session.user });
});

// route post
// route for handling post requirests
app
  .post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExits = await User.findOne({ email });

    if (!doesUserExits) {
      res.send("invalid username or password");
      return;
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) {
      res.send("invalid useranme or password");
      return;
    }

    // else he\s logged in
    req.session.user = {
      email,
    };

    res.redirect("/home");
  })
  .post("/signup", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExitsAlreay = await User.findOne({ email });

    if (doesUserExitsAlreay) {
      res.send("A user with that email already exits please try another one!");
      return;
    }

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword });

    latestUser
      .save()
      .then(() => {
        res.send("registered account!");
        return;
      })
      .catch((err) => console.log(err));
  });

  //logout
  app.get("/logout", authenticateUser, (req, res) => {
    req.session.user = null;
    res.redirect("/");
  });
  

app.listen(port, () => {
    console.log(`Server is listening at port :${port}`)
  })