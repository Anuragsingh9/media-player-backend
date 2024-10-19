const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const videoRoutes = require('../src/routes/videoRoute');

// app.use(cors());
app.use(express.urlencoded({ extended: true }));

// video routes
app.use('/api', videoRoutes);

const corsOptions = {
    origin: '*', // or specify frontend URL here, e.g., 'https://example.com'
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Enable CORS with options
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Allow preflight for all routes

app.get('/', (req, res) => {
    res.send('Welcome to the backend!');
});
const port = process.env.PORT || 8000;

app.listen(port, function () {
    console.log(`Listening on port !${port}`);
});