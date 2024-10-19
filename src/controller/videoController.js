const fs = require("fs");
const path = require('path');
const multer = require('multer');
const db = require("../database/db-connection/dbConnection");
const e = require("express");

function getVideoList(req, res) {
    const videoLists = db.query("select * from media_uploads", (error, result) => {
        return res.status(200).json({ success: true, data: result })
    });
}

function playVideo(req, res) {
    const filename = req.params.filename;
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = `./src/assets/uploads/${filename}`;
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
}

function prepareUploadPath(pathToCreate) {
    const uploadsPath = path.resolve(__dirname, pathToCreate);
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath);
    }
    return uploadsPath;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, prepareUploadPath('../assets/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, baseName + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage });

/**
 * This funcion is responsible for uploading the files
 * @param {*} req 
 * @param {*} res 
 */
function uploadFile(req, res) {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(500).json({ error: err.message });
        }
        if (req.body.title == "null") {
            return res.status(400).json({ error: "Please fill the title" });
        }
        // console.log(req.body.description);
        db.query("insert into media_uploads (filename,filepath,description,title) values (?,?,?,?)", [req.file.filename, "uploads", req.body.description, req.body.title], function (error, result) {
            if (error) {
                throw error;
            }
            res.status(201).json({ message: "File uploaded successfully", data: req.file });
        });
    });
}

function addLikeDislike(req, res) {
    upload.none()(req, res, (error) => {
        if (error) {
            res.status(400).json({ error: error.message })
        }
        var type = null;
        if (req.body.type == 'like') {
            type = 'like_count';
        } else {
            type = 'dislike_count';
        }
        // const likeDislike = req.body.type;
        // console.log('likeDislikeee',req.body);
        db.query(`update media_uploads set ${type} = ? where id = ?`, [req.body.count, req.body.video_id], function (error, result) {
            if (error) {
                throw error;
            }
            res.status(201).json({ message: "Added one like to video successfully", data: req.body.count });
        });
    })
}

module.exports = { playVideo, getVideoList, uploadFile, addLikeDislike };