import express from 'express';
import Document from '../Models/Dcoument.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdf from "pdf-parse/lib/pdf-parse.js";
const router=express.Router();

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        const uploadPath=path.join(path.dirname(''), 'uploads');
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }   
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
}

})

const upload=multer({storage:storage});

router.post('/upload',upload.single('file'),async(req,res)=>{
    try {
        console.log("🔥 Hit /api/documents/upload");
    console.log("File received:", req.file?.originalname);
        if(!req.file){
            return res.status(400).json({message:'No file uploaded'});
        }
   const dataBuffer = fs.readFileSync(req.file.path);
const pdfData = await pdf(dataBuffer);
const fullText = (pdfData.text || "").trim();


    if (!fullText) {
  return res
    .status(400)
    .json({ message: "Could not extract any text from this PDF." });
}

    const doc = await Document.create({
      title: req.body.title || req.file.originalname,
      originalName: req.file.originalname,
      path: req.file.path,
      content: fullText,
    });

    res.status(201).json({
      message: "PDF uploaded and indexed successfully",
      document: doc,
    })
    console.log(doc)
    } catch (error) {
         console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to upload PDF" });
    }
})

router.get("/", async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    console.error("List docs error:", error);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});

router .delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;  
    const deletedDoc = await Document.findByIdAndDelete(id);
    if (!deletedDoc) {
      return res.status(404).json({ message: "Document not found" });
    }
    fs.unlinkSync(deletedDoc.filePath);
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete doc error:", error);
    res.status(500).json({ message: "Failed to delete document" });
  }
});

export default router;