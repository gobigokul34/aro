import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
} from "docx";

// TXT Download
export function downloadTXT(transcript) {
  if (!transcript) return;

  const blob = new Blob([transcript], {
    type: "text/plain;charset=utf-8",
  });

  saveAs(blob, "transcript.txt");
}

// DOCX Download
export async function downloadDOCX({
  transcript,
  duration,
  words,
  wpm,
  fillers,
  score,
}) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "SpeakAI Speech Report",
            heading: HeadingLevel.TITLE,
          }),

          new Paragraph(""),

          new Paragraph(`Duration : ${duration}`),
          new Paragraph(`Words : ${words}`),
          new Paragraph(`WPM : ${wpm}`),
          new Paragraph(`Fillers : ${fillers}`),
          new Paragraph(`Score : ${score}/100`),

          new Paragraph(""),

          new Paragraph({
            text: "Transcript",
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph(transcript),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  saveAs(blob, "Speech_Report.docx");
}