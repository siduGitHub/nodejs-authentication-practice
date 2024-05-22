const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'userData.db')

app.use(express.json())
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Erro${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const bcrypt = require('bcrypt')

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `
    SELECT * FROM user WHERE username=${username};
  `
  const dbUser = await db.run(selectUserQuery)
  console.log(dbUser);

  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO user(username,name,password,gender,location)
      VALUES(
        "${username}",
        "${name}",
        "${hashedPassword}",
        "${gender}",
        "${location}"
      );
    `
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      await db.run(createUserQuery)
      response.status(200)
      response.send('user created successfully')
    }
  } else {
    response.status(400)
    response.send('User already Exit')
  }
})
