const fileService = require('../services/fileServices');
const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const fsSync = require('fs');
const { JSDOM } = require('jsdom');

// Upload and extract ZIP
async function uploadAndExtract(req, res) {
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
}

// Modify only chunk="to-content" in .ditamap files
function updateDitamapAttributes(folderPath) {
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.ditamap'));

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const content = fsSync.readFileSync(filePath, 'utf8');

    const dom = new JSDOM(content, { contentType: "text/xml" });
    const doc = dom.window.document;
    const topicRefs = doc.querySelectorAll('topicref');

    topicRefs.forEach(ref => {
      if (!ref.hasAttribute('chunk')) {
        ref.setAttribute('chunk', 'to-content');
      }
    });

    const updatedContent = new dom.window.XMLSerializer().serializeToString(doc);
    fsSync.writeFileSync(filePath, updatedContent, 'utf8');
  });
}

// Download all .ditamap files as zip
const downloadAllDitamapFiles = async (req, res) => {
  const ditamapFolder = path.join(__dirname, '../ditamap');

  if (!fs.existsSync(ditamapFolder) || fs.readdirSync(ditamapFolder).length === 0) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: 'No files found in the ditamap folder.',
    });
  }

  try {
    // ✅ Step 1: Add chunk="to-content"
    updateDitamapAttributes(ditamapFolder);

    // ✅ Step 2: Zip the folder
    const zip = new AdmZip();
    zip.addLocalFolder(ditamapFolder);

    const zipFilename = `ditamap_files.zip`;
    const zipPath = path.join(__dirname, '../temp', zipFilename);

    fs.ensureDirSync(path.dirname(zipPath));
    zip.writeZip(zipPath);

    // ✅ Step 3: Send download & cleanup
    res.download(zipPath, zipFilename, async (err) => {
      await fs.remove(zipPath);
      await fs.emptyDir(path.join(__dirname, '../uploads'));
      await fs.emptyDir(ditamapFolder);

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
