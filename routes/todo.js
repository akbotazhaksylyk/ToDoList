const router = require("express").Router();
const Todo = require("../models/Todo");

// routes
router.post("/add/todo", (req, res) => {
    const { todo } = req.body;
    if (!req.session.username) { // Ensure the session has username
        return res.status(401).send('Unauthorized');
    }
    const newTodo = new Todo({ 
        todo,
        username: req.session.username // Use username from session
    });

    newTodo
        .save()
        .then(() => res.redirect("/"))
        .catch((err) => console.log(err));
});

router.get("/", async (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('Unauthorized');
    }
    const userTodos = await Todo.find({ username: req.session.username });
    res.render("index", { todo: userTodos });
});

module.exports = router;