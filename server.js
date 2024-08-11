// import { MongoClient, ServerApiVersion } from 'mongodb';
import {getDB, getUser, addUser, getAllMatchingUsers, getLatestSession, updateInfo, addSaveContainer, id2User} from './mongo.js' 
import express from 'express'
import session from 'express-session';
import cors from 'cors';
import { load, save, signup, login, authenticate, logout, profile, test } from './loginRequests.js';
import { getHfCompletions, getStreamGPT, headStreamGpt, hfCompletions, hfCompletions70b, hfCompletions8b, streamGpt } from './apiRequests.js';

const isHttps = false;
const port = process.env.PORT || 3000;

const app = express();
// Add session middleware
app.use(session({
    secret: 'random_string_secret_key',  // replace with a strong secret
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: isHttps },     // Set to true if using HTTPS
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour (adjust as necessary)
        httpOnly: true,
        secure: false, // Only use secure flag in production
        sameSite: 'Lax' // or 'Lax', based on your use case
    }
}));
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Replace with your client origin
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true // Allow credentials (cookies)
}));
app.use(express.json())



// test session storage
app.get('/test-session', test);

app.post('/users/load', load);
app.post('/users/save', save);

app.post('/users/signup', signup)
app.post('/users/login', login);
app.get('/users/logout', logout);

app.get('/users/profile', authenticate, profile);



// LLM calls start
// Endpoint to handle API requests
app.get("/", (req, res) => res.type('html').send(html));
// openai endpoint
app.post('/api/gpt/completions/stream', streamGpt);
// Adding a HEAD method for the touch
app.head('/api/gpt/completions/stream', headStreamGpt);
app.get('/api/gpt/completions/stream', getStreamGPT);

app.post('/api/hf/8b/completions', hfCompletions8b);
app.post('/api/hf/70b/completions', hfCompletions70b);
app.post('/api/hf/completions', hfCompletions);
app.get('/api/hf/completions', getHfCompletions);
// LLM calls end

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});