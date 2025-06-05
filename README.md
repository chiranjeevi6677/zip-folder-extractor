# 📁 DITAmap File Processor

This Node.js project provides APIs to upload a ZIP file, extract its contents, organize `.ditamap` and other files into separate folders, and download the `.ditamap` files as a single ZIP archive. After download, all folders are cleared automatically.

---

## 📌 Features

- 📤 Upload ZIP files and extract contents
- 📂 Separate `.ditamap` files from others
- 📦 Download all `.ditamap` files as a ZIP
- 🧹 Auto-clean folders after download
- 🔧 Clean and modular structure

---

## 📁 Folder Structure
```
file-extract-api/
├── controllers/ # API logic
│ └── fileController.js
├── services/ # Business logic for file handling
│ └── fileServices.js
├── routes/ # API routes
│ └── fileRoutes.js
├── uploads/ # Stores non-.ditamap  and .ditamap files
├── ditamap/ # Stores only .ditamap files
├── temp/ # Stores temporary ZIP files for download
├── app.js # Express server entry point
└── README.md
```