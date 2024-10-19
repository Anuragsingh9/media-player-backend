const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const videoRoutes = require('../src/routes/videoRoute');

app.use(cors());
const url = process.env.FRONT_URL;
// const corsOptions = {
//     origin: `${url}`,
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
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