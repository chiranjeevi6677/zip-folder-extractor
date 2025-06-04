const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');

const extractAndOrganize = async (zipPath) => {
  const extractPath = './temp';
  const uploadDir = './uploads';
  const ditamapDir = './ditamap';

  // Clear old data
  fs.emptyDirSync(extractPath);
  fs.emptyDirSync(uploadDir);
  fs.emptyDirSync(ditamapDir);

  // Extract zip
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);

  const moveFiles = (dir) => {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        moveFiles(fullPath);
      } else {
        const ext = path.extname(file);
        const destPath = path.join(uploadDir, file);
        fs.moveSync(fullPath, destPath, { overwrite: true });

        // If it's a .ditamap file, also copy to ditamap folder
        if (ext === '.ditamap') {
          fs.copySync(destPath, path.join(ditamapDir, file));
        }
      }
    });
  };

  moveFiles(extractPath);
  fs.removeSync(zipPath);
  fs.removeSync(extractPath);
};

module.exports = { extractAndOrganize };
