import bodyParser from "body-parser"
import express from "express"
import axios from "axios"
import fs from "fs"
import pg from "pg"


// Important contants
const app = express()
const port = 3000
const API_KEY = "https://v2.jokeapi.dev/joke/Programming,Dark,Spooky?type=twopart"
const db = new pg.Client({
    user: 'postgres',
    password: '1234',
    host: 'localhost',
    port: 5432,
    database: 'overthinker'
})

db.connect()


// Functions to make life easy
function readJSON() {
    try {
        const data = fs.readFileSync('views/static/blogs.json', 'utf8')
        const jsonData = JSON.parse(data)
        console.log(jsonData)
        return jsonData
    } catch (error) {
        console.error('Error reading file: ', error)
    }
}

// Adding a new post
function appendPost(newPost) {
    try {
        const data = fs.readFileSync('views/static/blogs.json', 'utf8')
        const jsonData = JSON.parse(data)

        jsonData.posts.push(newPost)

        fs.writeFileSync('views/static/blogs.json', JSON.stringify(jsonData, null, 2), 'utf8')
    } catch (error) {
        console.error('Error appending post: ', error)
    }
}


// Middlewares
app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true }))


// Routes and other POST and GET stuff
app.get('/', (req, res) => {
    res.render('routes/index.ejs')
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body
    const result = await db.query("SELECT email, password FROM users WHERE email=$1", [email])
    console.log(result)
    if (result.rowCount == 0) {
        await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, password])
        res.redirect("/read")
    } else {
        if (result.rows[0].password == password) {
            console.log("Logged in successfully...")
            res.redirect("/read")
        } else {
            console.log("Wrong password...")
            res.redirect("/")
        }
    }
})

app.get('/write', (req, res) => {
    res.render("routes/write.ejs")
})

app.post('/publish', (req, res) => {
    const { title, content } = req.body
    const currentDate = new Date();
    const date = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const newPost = {
        title: title,
        content: content,
        date: date
    }
    appendPost(newPost)
    res.render('routes/write.ejs')
})

app.get('/read', (req, res) => {
    const blogs = readJSON()
    res.render('routes/display.ejs', { blogs: blogs })
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


// Going Live!
app.listen(port, () => {
    console.log(`Your app is running on ${port}.`)
})