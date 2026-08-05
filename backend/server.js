import express from "express";
import cors from "cors";
import multer from "multer";
import { spawn } from "child_process";


console.log("SERVER VERSION: 2026-07-21");
const app = express();

app.use(cors());
app.use(express.json());


const upload = multer({
  dest: "uploads/",
});


// Node -> Python Whisper connection
function runWhisper(filePath) {

  return new Promise((resolve, reject) => {

    const python = spawn(
      "python",
      [
        "./whisper-service/transcribe.py",
        filePath
      ]
    );


    let output = "";


    python.stdout.on("data", (data) => {
      output += data.toString();
    });


    python.stderr.on("data", (data) => {
      console.error(
        "Whisper error:",
        data.toString()
      );
    });


    python.on("close", (code) => {

      if (code === 0) {
        console.log("Python Output:");
    console.log(output);

    try {
      resolve(JSON.parse(output));
    } catch (err) {
      reject("Invalid JSON from Whisper");
    }
    } else {
        reject("Whisper process failed");
      }

    });

  });

}



app.post(
  "/api/speech/upload",
  upload.single("audio"),
  async (req, res) => {

    try {

      console.log("Audio received:");
      console.log(req.file);

      console.log("Calling Whisper...");
      console.log("Audio path:", req.file.path);

      console.log("Before Whisper");
      const result = await runWhisper(
        req.file.path
      );
    
      console.log("after Whisper");
      console.log("Transcript:", result.transcript);
      console.log("Language:", result.language);

      res.json({
        success: true,
        transcript: result.transcript,
        language: result.language,
        duration: result.duration,
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        error: error.toString(),
      });

    }

  }
);



app.listen(5000, () => {
  console.log("Server running on port 5000");
});