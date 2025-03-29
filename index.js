import bodyParser from "body-parser"
import express from "express"
import fs from "fs"


// Important contants
const app = express()
const port = 3000


// Functions to make life easy
function readJSON() {
    try {
        const data = fs.readFileSync('views/static/blogs.json', 'utf8')
        const jsonData = JSON.parse(data)
        console.log(jsonData)
        return jsonData
    } catch (err) {
        console.error('Error reading file: ', err)
    }
}

// Adding a new post
function appendPost(newPost) {
    try {
        const data = fs.readFileSync('views/static/blogs.json', 'utf8')
        const jsonData = JSON.parse(data)

        jsonData.posts.push(newPost)

        fs.writeFileSync('views/static/blogs.json', JSON.stringify(jsonData, null, 2), 'utf8')
    } catch (err) {
        console.error('Error appending post: ', err)
    }
}


// Middlewares
app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true }))


// Routes and other POST and GET stuff
app.get('/', (req, res) => {
    res.render('routes/index.ejs')
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

app.get('/display', (req, res) => {
    const blogs = readJSON()
    res.render('routes/display.ejs', { blogs: blogs })
})


// Going Live!
app.listen(port, () => {
    console.log(`Your app is running on ${port}.`)
})