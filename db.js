const { Pool } = require("pg");
const bcrypt = require("bcrypt"); //for password hashing

const pool = new Pool({
    host: `localhost`,
    user: `postgres`,
    port: 5432,
    database: `lab2`,
    password: `0000`
});

pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Error connecting to the database', err));

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

//password hashing
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function comparePasswords(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

async function loginUser(username, password) {
    try {
        const result = await pool.query('SELECT * FROM public.users WHERE username = $1', [username]);

        if (result.rows.length === 1) {
            const hashedPassword = result.rows[0].password;

            if (await comparePasswords(password, hashedPassword)) {
                console.log('Login successful!');
            } else {
                console.log('Invalid password');
            }
        } else {
            console.log('Invalid username');
        }
    } catch (error) {
        console.error(error);
    }
}

async function registerUser(username, password) {
    try {
        const hashedPassword = await hashPassword(password);

        const result = await pool.query('INSERT INTO public.users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);

        if (result.rows.length === 1) {
            console.log('Registration successful!');
        } else {
            console.log('Registration failed');
        }
    } catch (error) {
        console.error(error);
    }
}

// At the end of db.js file
module.exports = {
    pool,
    hashPassword,
    comparePasswords,
    loginUser,
    registerUser,
    comparePasswords,
};