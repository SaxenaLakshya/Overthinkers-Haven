import bodyParser from "body-parser"
import express from "express"
import axios from "axios"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"
import env from "dotenv"
import cron from "node-cron"


// Important constants
const app = express()
const PORT = process.env.PORT || 3000
const API_KEY = "https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Dark,Pun,Spooky,Christmas?blacklistFlags=religious,racist&type=twopart"
const saltRounds = 10
env.config()

// Connecting to Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)


// Middlewares
app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true }))


// Midnight function
async function runAtMidnight() {
    console.log("Running task at midnight IST")
    const { data, error } = await supabase.from('posts').delete().neq('id', 2)
    if (error) {
        console.log("Error occured while executing Midnight task...")
    } else {
        console.log("Midnight task executed...")
    }
}

// Scheduling the task
cron.schedule('0 0 * * *', () => {
    runAtMidnight();
}, {
    timezone: 'Asia/Kolkata'
})


// GET Routes
app.get('/', (req, res) => {
    res.render("routes/login.ejs")
})

app.get('/register', (req, res) => {
    res.render("routes/register.ejs")
})

app.get('/terms', (req, res) => {
    res.render('routes/terms.ejs')
})

app.get('/write', (req, res) => {
    res.render("routes/write.ejs")
})

app.get('/read', async (req, res) => {
    const { data, error } = await supabase.from('posts').select('title, content, date, city')
    if (error) {
        res.render('<h1>Something went wrong while fetching data...</h1>')
    } else {
        res.render('routes/display.ejs', { blogs: data })
    }
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
    const { data, error } = await supabase
        .from('users')
        .select('email, password')
        .eq('email', email)
        .single()
    if (!data || error) {
        res.redirect("/register")
    } else {
        const match = await bcrypt.compare(password, data.password)
        if (match) {
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
    const { data, error } = await supabase
        .from('users')
        .insert([{ email, password: hashedPassword }])
    if (error) {
        res.render("<h1>Something went wrong while storing the data...</h1>")
    } else {
        console.log("Registered Successfully")
        res.redirect("/read")
    }
})

app.post('/publish', async (req, res) => {
    const { title, content, city } = req.body
    const date = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    const { error } = await supabase.from('posts').insert([{ title, content, date, city }])
    if (error) {
        res.render("<h1>Something went wrong while storing the data...</h1>")
    } else {
        res.render('routes/write.ejs')
    }
})


// Going Live!
app.listen(PORT, () => {
    console.log(`Your app is running on http://localhost:${PORT}`)
})