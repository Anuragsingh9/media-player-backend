const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const videoRoutes = require('../src/routes/videoRoute');

// app.use(cors());
const corsOptions = {
    origin: 'https://media-player-frontend-beta.vercel.app', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // credentials: true, // If you're dealing with cookies/sessions
    allowedHeaders: ['Content-Type', 'Authorization'] // Customize as needed
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

// video routes
app.use('/api', videoRoutes);
app.get('/', (req, res) => {
    res.send('Welcome to the backend!');
});

const port = process.env.PORT || 8000;

app.listen(port, function () {
    console.log(`Listening on port !${port}`);
});