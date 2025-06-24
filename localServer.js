import bodyParser from "body-parser"
import express from "express"
import session from "express-session"
import axios from "axios"
import pg from "pg"
import bcrypt from "bcrypt"
import env from "dotenv"


const app = express()
const port = 3000
const API_KEY = "https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Dark,Pun,Spooky,Christmas?blacklistFlags=religious,racist&type=twopart"
const saltRounds = 10
env.config()


// DB Connection
const db = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
})

db.connect()


// Middleware for sessions
app.use(session({
    secret: "OVERTHINKERS-HAVEN",
    resave: false,
    saveUninitialized: false
}))


// Middlewares
app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true }))


// Middleware to protect routes
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        return next()
    }
    res.redirect("/")
}


// GET Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect("/read")
    }
    res.render('routes/login.ejs')
})

app.get('/register', (req, res) => res.render('routes/register.ejs'))

app.get('/terms', (req, res) => res.render('routes/terms.ejs'))

app.get('/admin', (req, res) => res.render('routes/admin.ejs'))

app.get('/write', isLoggedIn, (req, res) => res.render("routes/write.ejs"))

app.get('/read', isLoggedIn, async (req, res) => {
    const result = await db.query("SELECT title, content, date, city FROM posts")
    res.render('routes/display.ejs', { blogs: result.rows })
})

app.get("/joke", isLoggedIn, (req, res) => res.render("routes/joke.ejs", { content: null }))


// POST Routes
app.post('/login', async (req, res) => {
    const { email, password } = req.body
    const result = await db.query("SELECT * FROM users WHERE email=$1 LIMIT 1", [email])

    if (result.rowCount < 1) {
        res.redirect("/register")
    } else {
        const valid = await bcrypt.compare(password, result.rows[0].password)
        if (valid) {
            req.session.user = { id: result.rows[0].id, email: result.rows[0].email }
            console.log("Login Successful!")
            res.redirect("/read")
        } else {
            console.log("Wrong Password!")
            res.redirect("/")
        }
    }
})

app.post('/register', async (req, res) => {
    const { email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id", [email, hashedPassword])
    req.session.user = { id: result.rows[0].id, email }
    console.log("Registered Successfully!")
    res.redirect("/read")
})

app.post('/publish', isLoggedIn, async (req, res) => {
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

app.post("/joke", isLoggedIn, async (req, res) => {
    try {
        const {
            Programming, Miscellaneous, Dark, Pun,
            Spooky, Christmas,
            nsfw, religious, political, racist, sexist, explicit
        } = req.body

        let categories = [Programming, Miscellaneous, Dark, Pun, Spooky, Christmas]
            .filter(Boolean)
        let blacklists = [nsfw, religious, political, racist, sexist, explicit]
            .filter(Boolean)

        let url = "https://v2.jokeapi.dev/joke/"
        url += categories.length ? categories.join(",") : "Any"
        url += "?"

        if (blacklists.length) {
            url += "blacklistFlags=" + blacklists.join(",") + "&"
        }

        url += "type=twopart"

        const result = await axios.get(url)
        res.render("routes/joke.ejs", { content: result.data })
    } catch (error) {
        console.log("Joke Fetch Error:", error)
        res.render("routes/joke.ejs", { content: null })
    }
})


// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/")
    })
})


// Start server
app.listen(port, () => {
    console.log(`Your app is running on http://localhost:${port}`)
})