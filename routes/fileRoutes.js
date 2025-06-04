const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/fileController');

const upload = multer({ dest: './' }); // Saves as a temp file

router.post('/upload', upload.single('zipFile'), fileController.uploadAndExtract);
router.get('/download-all', fileController.downloadAllDitamapFiles);

module.exports = router;
