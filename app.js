const express = require('express');
const app = express();
const userModel = require('./models/user')
const postModel = require('./models/post')
const path = require('path')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

app.get('/', function (req, res) {
    res.render("index")
})

app.get('/login', function (req, res) {
    res.render("login")
})

app.get('/profile', isLoggedIn, async function (req, res) {

    let user = await userModel.findOne({ email: req.user.email }).populate("posts");
    let posts = await postModel.find().populate("user");
    res.render("profile", { user, posts })

})

// likes
app.get('/like/:id', isLoggedIn, async function (req, res) {

    let post = await postModel.findOne({ _id: req.params.id }).populate("user")
    // if post likes me this id is existing then he cant like more
    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid)
    }

    // rmeove kr dia vo 1 bnda
    else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }

    await post.save();
    res.redirect('/profile');
})

// edit
app.get("/edit/:id", isLoggedIn, async function (req, res) {

    let post = await postModel.findOne({ _id: req.params.id }).populate("user")

    res.render("edit", { post });

})

// edit-update
app.post("/update/:id", isLoggedIn, async function (req, res) {

    let post = await postModel.findOneAndUpdate({ _id: req.params.id }, { content: req.body.content })
    res.redirect('/profile');
})

// delete
app.get('/delete/:id', async function (req, res) {
    await postModel.findByIdAndDelete(req.params.id);
    res.redirect('/profile');
})

app.post('/post', isLoggedIn, async function (req, res) {

    let user = await userModel.findOne({ email: req.user.email }); // who is logged in

    let post = await postModel.create({ // created post
        user: user._id,
        content: req.body.content,
    })

    user.posts.push(post._id); // post array of user
    await user.save();
    res.redirect("profile");

})

app.post('/register', async function (req, res) {

    let { username, age, name, email, password } = req.body;

    let user = await userModel.findOne({ email: email });
    if (user) return res.status(500).send("User already registered");

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password: hash

            });
            // login , send token . middha is secret key
            let token = jwt.sign({ email: email, userid: user._id }, "middha")
            res.cookie("token", token);
            res.send("registered")

        })
    })

});

app.post('/login', async function (req, res) {

    let { email, password } = req.body;

    let user = await userModel.findOne({ email: email });
    if (!user) return res.status(500).send("User not found! ");

    bcrypt.compare(password, user.password, function (err, result) {

        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, "middha")
            res.cookie("token", token);
            res.status(200).redirect("/profile")
        }
        else res.redirect('/login')
    })

});

app.get('/logout', function (req, res) {
    // just remove the cookie
    res.cookie("token", "");
    res.redirect("login");
})



function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") res.redirect("/login")

    else {
        let data = jwt.verify(req.cookies.token, "middha")
        req.user = data;
        next();
    }

}

app.listen(3000)