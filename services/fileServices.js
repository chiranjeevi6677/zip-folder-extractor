const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom'); //  Required for XML DOM manipulation

const extractAndOrganize = async (zipPath) => {
  const extractPath = './temp';
  const uploadDir = './uploads';
  const ditamapDir = './ditamap';

  // Step 1: Clear previous data
  fs.emptyDirSync(extractPath);
  fs.emptyDirSync(uploadDir);
  fs.emptyDirSync(ditamapDir);

  // Step 2: Extract zip
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);

  // Step 3: Move files to uploads, copy .ditamap to ditamap/
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
        
        if (ext === '.ditamap') {
          fs.copySync(destPath, path.join(ditamapDir, file));
        }
      }
    });
  };

  moveFiles(extractPath); // Must come before reading ditamapDir

  // Step 4: Modify .ditamap files — add chunk="to-content" if missing
  const ditamapFiles = fs.readdirSync(ditamapDir).filter(file => file.endsWith('.ditamap'));

  ditamapFiles.forEach(file => {
    const filePath = path.join(ditamapDir, file);
    const xmlContent = fs.readFileSync(filePath, 'utf-8');

    const dom = new JSDOM(xmlContent, { contentType: 'text/xml' });
    const document = dom.window.document;

    const topicrefs = document.querySelectorAll('topicref');
    topicrefs.forEach(ref => {
      if (!ref.hasAttribute('chunk')) {
        ref.setAttribute('chunk', 'to-content');
      }
    });

    const updatedXML = new dom.window.XMLSerializer().serializeToString(document);
    fs.writeFileSync(filePath, updatedXML, 'utf-8');
  });

  // Step 5: Cleanup
  fs.removeSync(zipPath);
  fs.removeSync(extractPath);
};

module.exports = { extractAndOrganize };
