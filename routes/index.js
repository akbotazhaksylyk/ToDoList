const { registerUser, pool, hashPassword, comparePasswords } = require('../db');
const express = require('express');

const db = require('../db');
const router = require("express").Router()
const path = require("path");
const Todo = require("../models/Todo");

const methodOverride = require('method-override');
router.use(methodOverride('_method'));

// routes will be here....
router.get("/", async (req, res) => {
    if (!req.session.username) {
        res.redirect('/login'); // If not logged in, redirect to login page
    } else {
        const userTodos = await Todo.find({ username: req.session.username }); // Fetch todos for the logged-in user
        res.render("index", { todo: userTodos });
    }
});

// for button to delete when pressed
router.get("/delete/todo/:_id", async (req, res) => {
    const { _id } = req.params;
    if (!req.session.username) {
        return res.status(401).send('Unauthorized');
    }
    try {
        await Todo.findOneAndDelete({ _id: _id, username: req.session.username });
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting todo', error);
        res.status(500).send('Internal Server Error');
    }
});

// for postman
router.delete("/todo/:_id", async (req, res) => {
    const { _id } = req.params;

    try {
        const deletedTodo = await Todo.findOneAndDelete({ _id: _id });
        if (!deletedTodo) {
            return res.status(404).send("Todo not found.");
        }
        // Respond with success message
        res.json({ message: "Todo successfully deleted", todo: deletedTodo });
    } catch (error) {
        console.error('Error deleting todo', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, '../views/regist.html'));
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await db.hashPassword(password);
        const result = await pool.query('INSERT INTO public.users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
        // Redirect to the login form after successful registration
        res.redirect('/login');
    } catch (error) {
        console.error('Error executing registration query', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM public.users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            const hashedPassword = result.rows[0].password;
            if (await comparePasswords(password, hashedPassword)) {
                req.session.regenerate(err => { // Regenerate the session to prevent session fixation
                    if (err) {
                        console.log(err);
                        res.send('Error in session regeneration');
                    } else {
                        req.session.username = username; // Assign the new username to the session
                        res.redirect('/');
                    }
                });
            } else {
                res.send('Invalid username or password');
            }
        } else {
            res.send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error executing login query', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/logout', (req, res) => {
    // Destroy the session and redirect the user to the login page
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            res.send('Error logging out');
        } else {
            res.clearCookie('connect.sid'); // This clears the session cookie
            res.redirect('/login');
        }
    });
});

// Update
// router.put("/update/todo/:_id", async (req, res) => {
//     const { _id } = req.params; // Extract the todo ID from the request parameters
//     const { todo } = req.body; // Extract the updated todo text from the request body

//     // Update logic using findOneAndUpdate
//     try {
//         const updatedTodo = await Todo.findOneAndUpdate(
//             { _id: _id }, // Find the todo by its _id
//             { todo: todo },
//             { new: true } // Returns the modified document rather than the original by default
//         );

//         if (!updatedTodo) {
//             return res.status(404).send("Todo not found.");
//         }
//         res.json(updatedTodo);
//     } catch (error) {
//         console.error('Error updating todo', error);
//         res.status(500).send('Internal Server Error');
//     }
// });
// Update
// Update
router.put("/update/todo/:_id", async (req, res) => {
    const { _id } = req.params; // Extract the todo ID from the request parameters
    const { todo } = req.body; // Extract the updated todo text from the request body

    // Ensure that the todo content is not undefined
    if (todo === undefined) {
        return res.status(400).send("Todo content is undefined.");
    }

    console.log("Updating todo with ID:", _id); // Debugging log
    console.log("New todo content:", todo); // Debugging log

    // Update logic using findOneAndUpdate
    try {
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: _id }, // Find the todo by its _id
            { todo: todo },
            { new: true } // Returns the modified document rather than the original by default
        );

        if (!updatedTodo) {
            console.log("No todo found with ID:", _id); // Debugging log
            return res.status(404).send("Todo not found.");
        }
        console.log("Updated todo:", updatedTodo); // Debugging log
        res.json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error); // Changed to show the error object
        res.status(500).send('Internal Server Error');
    }
});



router.get("/todos", async (req, res) => {
    try {
        const allTodos = await Todo.find({});
        res.json(allTodos); // Send all todos as a JSON response
    } catch (error) {
        console.error('Error fetching todos', error);
        res.status(500).send('Internal Server Error');
    }
});

// route to fetch a single todo item by its ID
router.get("/todos/:_id", async (req, res) => {
    const { _id } = req.params;

    try {
        const todoItem = await Todo.findById(_id);
        
        if (!todoItem) {
            return res.status(404).send("Todo item not found.");
        }

        res.json(todoItem);
    } catch (error) {
        console.error('Error fetching todo item', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;