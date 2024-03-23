const express = require("express");
const mongoose = require("mongoose");

const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// conenction to mongodb
async function connectToDatabase() {
    try {
        await mongoose.connect("mongodb+srv://akbotazhaksy:0000@cluster0.kiys9hl.mongodb.net/lab2Backend?retryWrites=true&w=majority");
        console.log("successfully connected!");
    } catch (err) {
        console.error(err);
    }
}

connectToDatabase();

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://akbotazhaksy:0000@cluster0.kiys9hl.mongodb.net/lab2Backend?retryWrites=true&w=majority' })
}));

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// routes
app.use(require("./routes/index"))
app.use(require("./routes/todo"))

// server configurations....
app.listen(3000, () => console.log("Server started listening on port: 3000"));