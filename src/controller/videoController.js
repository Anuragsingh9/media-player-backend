const fs = require("fs");
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const db = require("../database/db-connection/dbConnection");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDNARY_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET
});

function getVideoList(req, res) {
    db.query("select * from media_uploads", (error, result) => {
        return res.status(200).json({ success: true, data: result });
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
        "Access-Control-Allow-Origin": "*",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
}

// Configure multer to use /tmp for temporary file storage (Vercel-compatible)
const upload = multer({ dest: '/tmp' });

async function uploadFile(req, res) {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(500).json({ error: err.message });
        }
        if (req.body.title === "null") {
            return res.status(400).json({ error: "Please fill the title" });
        }

        try {
            // Upload video to Cloudinary from the /tmp directory
            const result = await cloudinary.uploader.upload(req.file.path, {
                resource_type: 'video',
                folder: 'media_player'  // Specify the folder name here
            });

            // Delete the temporary file after uploading
            fs.unlinkSync(req.file.path);

            // Save the Cloudinary URL and other metadata to the database
            db.query(
                "INSERT INTO media_uploads (filename, filepath, description, title) VALUES (?, ?, ?, ?)",
                [result.public_id, result.secure_url, req.body.description, req.body.title],
                function (error, dbResult) {
                    if (error) throw error;
                    res.status(201).json({ message: "File uploaded successfully", data: result });
                }
            );
        } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            res.status(500).json({ error: "Failed to upload video to Cloudinary", errorMessage: uploadError });
        }
    });
}

function addLikeDislike(req, res) {
    upload.none()(req, res, (error) => {
        if (error) {
            res.status(400).json({ error: error.message });
        }
        let type = req.body.type === 'like' ? 'like_count' : 'dislike_count';
        db.query(
            `UPDATE media_uploads SET ${type} = ? WHERE id = ?`,
            [req.body.count, req.body.video_id],
            function (error, result) {
                if (error) throw error;
                res.status(201).json({ message: "Updated like/dislike count successfully", data: req.body.count });
            }
        );
    });
}

module.exports = { playVideo, getVideoList, uploadFile, addLikeDislike };
