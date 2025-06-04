import bodyParser from "body-parser"
import express from "express"
import axios from "axios"
import pg from "pg"
import bcrypt from "bcrypt"
import env from "dotenv"


// Important contants
const app = express()
const port = 3000
const API_KEY = "https://v2.jokeapi.dev/joke/Programming,Dark,Spooky?type=twopart"
const saltRounds = 10
env.config()
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
    res.render('routes/index.ejs')
})

app.get('/write', (req, res) => {
    res.render("routes/write.ejs")
})

app.get('/read', async (req, res) => {
    const result = await db.query("SELECT title, content, date FROM posts")
    res.render('routes/display.ejs', { blogs: result.rows })
})

app.get("/joke", async (req, res) => {
    try {
        const result = await axios.get(API_KEY)
        console.log(result.data)
        res.render("routes/joke.ejs", { content: result.data })
    } catch (error) {
        console.log(error)
    }
})


// POST Routes
app.post('/login', async (req, res) => {
    const { email, password } = req.body
    const result = await db.query("SELECT email, password FROM users WHERE email=$1", [email])
    console.log(result)
    if (result.rowCount == 0) {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword])
        console.log("registered the user successfully...")
        res.redirect("/read")
    } else {
        const match = await bcrypt.compare(password, result.rows[0].password)
        if (match) {
            console.log("Logged in successfully...")
            res.redirect("/read")
        } else {
            console.log("Wrong password...")
            res.redirect("/")
        }
    }
})

app.post('/publish', async (req, res) => {
    const { title, content } = req.body
    const currentDate = new Date();
    const date = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    await db.query("INSERT INTO posts (title, content, date) VALUES ($1,$2,$3)", [title, content, date])
    console.log("Post added successfully!")

    res.render('routes/write.ejs')
})


// Going Live!
app.listen(port, () => {
    console.log(`Your app is running on http://localhost:${port}.`)
})