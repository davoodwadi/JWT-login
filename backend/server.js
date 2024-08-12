// var escapeHtml = require('escape-html')
import express from 'express'
import session from 'express-session'
import { fileURLToPath } from 'url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;
const app = express()

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// middleware to test if authenticated
// function isAuthenticated (req, res, next) {
    
//     next()
// }

app.get('/', (req, res) => {
    console.log('*'.repeat(50))
    console.log('login')
    console.log('req.session')
    console.log(req.session)
    console.log('*'.repeat(50))
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });

// app.post('/login', express.urlencoded({ extended: false }), function (req, res) {
app.post('/login', express.json(), function (req, res) {
  // login logic to validate req.body.user and req.body.pass
  // would be implemented here. for this example any combo works
  console.log('*'.repeat(50))
  console.log('login')
  console.log('req.body')
  console.log(req.body)
  console.log(req.body.user)
  console.log(req.body.pass)
  console.log('*'.repeat(50))
  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(function (err) {
    if (err) next(err)

    // store user information in session, typically a user id
    req.session.user = req.body.user
    console.log('*'.repeat(50))
    console.log('before save')
    console.log('req.session')
    console.log(req.session)
    console.log('*'.repeat(50))

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err)
      res.redirect('/')
    })
    console.log('*'.repeat(50))
    console.log('after save')
    console.log('req.session')
    console.log(req.session)
    console.log('*'.repeat(50))

  })
})

app.get('/logout', function (req, res, next) {
  // logout logic
  console.log('*'.repeat(50))
  console.log('before logout')
  console.log('req.session')
  console.log(req.session)
  console.log('*'.repeat(50))
  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  req.session.user = null
  console.log('*'.repeat(50))
  console.log('logout before save')
  console.log('req.session')
  console.log(req.session)
  console.log('*'.repeat(50))
  req.session.save(function (err) {
    if (err) next(err)

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/')
    })
  })
  console.log('*'.repeat(50))
  console.log('logout after save')
  console.log('req.session')
  console.log(req.session)
  console.log('*'.repeat(50))
})

app.get('/check', function (req, res, next) {
    // logout logic
    console.log('*'.repeat(50))
    console.log('checking')
    console.log('req.session')
    console.log(req.session)
    console.log('*'.repeat(50))
    res.send(req.session.user)
  })
  

app.listen(port)
