import express from 'express';
import multer from 'multer';
import path from 'path';

const app = express();
const upload = multer({ dest: 'server-directory/' });

app.post('/upload', upload.single('file'), (req, res) => {
  const uploadedFile = req.file;

  if (uploadedFile) {
    // Do additional processing if needed
    console.log('File uploaded:', uploadedFile.originalname);
    res.status(200).send('File uploaded successfully.');
  } else {
    res.status(400).send('No file uploaded.');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
