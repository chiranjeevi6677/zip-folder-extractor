const fileService = require('../services/fileServices');
const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');

// Upload and extract ZIP
const uploadAndExtract = async (req, res) => {
  try {
    const zipPath = req.file.path;
    await fileService.extractAndOrganize(zipPath);
    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Files uploaded and organized successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: err.message
    });
  }
};

const downloadAllDitamapFiles = async (req, res) => {
  const ditamapFolder = path.join(__dirname, '../ditamap');

  if (!fs.existsSync(ditamapFolder) || (fs.readdirSync(ditamapFolder).length === 0)) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: 'No files found in the ditamap folder.',
    });
  }

  try {
    const zip = new AdmZip();
    zip.addLocalFolder(ditamapFolder);

    const zipFilename = `ditamap_files.zip`;
    const zipPath = path.join(__dirname, '../temp', zipFilename);

    fs.ensureDirSync(path.dirname(zipPath));
    zip.writeZip(zipPath);

    res.download(zipPath, zipFilename, async (err) => {
      await fs.remove(zipPath); // Clean up zip file after download
      await fs.emptyDir(path.join(__dirname, '../uploads'));  // Clear uploads
      await fs.emptyDir(ditamapFolder); // Clear ditamap

      if (err) {
        console.error('Download error:', err);
        return res.status(500).json({
          success: false,
          code: 500,
          message: 'Download failed.',
        });
      }
    });

  } catch (error) {
    console.error('Zipping error:', error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Something went wrong during download.',
    });
  }
};


module.exports = {
  uploadAndExtract,
  downloadAllDitamapFiles
};
