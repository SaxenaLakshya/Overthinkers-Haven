# 🧠 <a href="https://overthinkers-haven.onrender.com/" tagret="_blank">Overthinker's Haven</a>

Welcome to **Overthinker's Haven** — a cozy place for introverts, thinkers, and overthinkers to drop their thoughts and read others’.  
Minimal, expressive, and interactive — just like your favorite diary but online.

---

## 🚀 Features

- 🔐 **Instant One-Page Login/Register**
  - Just enter your email and password
  - If you're new, you're auto-registered and logged in — no separate sign-up page

- 📝 **Thought Sharing**
  - Share what's on your mind by providing:
    - Your city
    - A post title
    - The content

- 🌍 **Global Post Feed**
  - Shows messages like:
    > "Someone from Delhi shared..."

- 😂 **Adult Joke Section**
  - Asks: "Are you 18+?"
  - If yes, fetches random jokes using a public joke API
  - Your answer is stored in your browser so you don't get to lie 😏

---

## 🧰 Tech Stack

| Tech             | Usage                               |
| ---------------- | ----------------------------------- |
| **Node.js**      | Backend runtime                     |
| **Express.js**   | Server framework                    |
| **Supabase**     | Hosted PostgreSQL DB for deployment |
| **PostgreSQL**   | Local database setup for testing    |
| **Tailwind CSS** | Styling with utility classes        |
| **EJS**          | Server-side rendering templates     |
| **Axios**        | API calls (for adult jokes)         |
| **Bcrypt**       | Secure password hashing             |
| **JokeAPI**      | External joke content via Axios     |

---

## 📈 Future Goals

- [x] 🚀 **Deploy the Application**  
  Host the frontend and backend on a platform like Render, Vercel, or Railway.

- [ ] 🔐 **Login with Google**  
  Add OAuth integration for seamless Google sign-in.

- [ ] 🔁 **Forgot Password Feature**  
  Let users reset their passwords via email.

- [ ] 📝 **Edit/Delete Posts**  
  Allow users to manage their submitted thoughts.

- [ ] 🌍 **Paginated Global Feed**  
  Add pagination or infinite scroll for post viewing.

- [ ] 💾 **Better Session Management**  
  Secure tokens or cookies with proper expiration.

- [ ] 🎨 **UI Enhancements**  
  Improve responsiveness, add subtle animations.

- [ ] 🧪 **Testing & CI/CD**  
  Add Jest-based unit tests and automate deployment using GitHub Actions.

- [x] 📱 **Mobile Optimization**  
  Ensure smooth usage and UI on all screen sizes.

- [ ] 📊 **Admin Dashboard**  
  For post moderation and user metrics.
---

## 🧪 Running Locally

Follow these steps to run the project on your local machine:

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/SaxenaLakshya/overthinkers-haven.git
    cd overthinkers-haven
    ```

2. **Install Dependencies:**

    ```bash
    npm install
    ```

3. **Set Up Environment Variables:**

    Create a `.env` file in the root directory and add your PostgreSQL credentials:

    ```env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=overthinkers_haven
    ```

4. **Start the Application:**

    ```bash
    nodemon localServer.js
    ```

5. **Visit in Browser:**

    Open [http://localhost:3000](http://localhost:3000) to use the app.

> Make sure your PostgreSQL server is running before starting the app.
---

## 🌐 Public API Used

This project uses the following public API:

- **[JokeAPI – Official Joke API](https://jokeapi.dev/)**
  - Used to fetch random **adult jokes**
  - The app asks for age confirmation before displaying content
  - If the user is not an adult, joke access is blocked via local storage
