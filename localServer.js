import bodyParser from "body-parser"
import express from "express"
import axios from "axios"
import pg from "pg"
import bcrypt from "bcrypt"
import env from "dotenv"


// Important contants
const app = express()
const port = 3000
const API_KEY = "https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Dark,Pun,Spooky,Christmas?blacklistFlags=religious,racist&type=twopart"
const saltRounds = 10
env.config()

// Connecting to the Local PostgreSQL Database
const db = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
})

db.connect()


// Middlewares
app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true }))


// GET Routes
app.get('/', (req, res) => {
    res.render('routes/login.ejs')
})

app.get('/register', (req, res) => {
    res.render('routes/register.ejs')
})

app.get('/terms', (req, res) => {
    res.render('routes/terms.ejs')
})

app.get('/admin', (req, res) => {
    res.render('routes/admin.ejs')
})

app.get('/write', (req, res) => {
    res.render("routes/write.ejs")
})

app.get('/read', async (req, res) => {
    const result = await db.query("SELECT title, content, date, city FROM posts")
    res.render('routes/display.ejs', { blogs: result.rows })
})

app.get("/joke", async (req, res) => {
    try {
        const result = await axios.get(API_KEY)
        res.render("routes/joke.ejs", { content: result.data })
    } catch (error) {
        console.log(error)
    }
})


// POST Routes
app.post('/login', async (req, res) => {
    const { email, password } = req.body
    const result = await db.query("SELECT email, password FROM users WHERE email=$1 LIMIT 1", [email])
    if (result.rowCount < 1) {
        res.redirect("/register")
    } else {
        bcrypt.compare(password, result.rows[0].password, (err, same) => {
            if (same) {
                console.log("Login Successful!")
                res.redirect("/read")
            } else {
                console.log("Wrong Password!")
                res.redirect("/")
            }
        })
    }
})

app.post('/register', async (req, res) => {
    const { email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword])
    console.log("Registered Successfully!")
    res.redirect("/read")
})

app.post('/publish', async (req, res) => {
    const { title, content, city } = req.body
    const date = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    await db.query("INSERT INTO posts (title, content, date, city) VALUES ($1, $2, $3, $4)", [title, content, date, city])
    console.log("Post added successfully!")

    res.render('routes/write.ejs')
})


// Going Live!
app.listen(port, () => {
    console.log(`Your app is running on http://localhost:${port}`)
})