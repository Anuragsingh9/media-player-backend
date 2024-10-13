const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const videoRoutes = require('../src/routes/videoRoute');

app.use(cors());
app.use(express.urlencoded({ extended: true }));

// video routes
app.use('/api',videoRoutes);

app.listen(8000, function () {
    console.log("Listening on port 8000!");
});