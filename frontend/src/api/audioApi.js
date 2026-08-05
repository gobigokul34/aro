import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const uploadAudio = async (audio, metadata = {}) => {
  const formData = new FormData();

  // Keep original filename if it's a File,
  // otherwise use a default name for recorded audio.
  if (audio instanceof File) {
    formData.append("audio", audio);
  } else {
    formData.append("audio", audio, "recording.webm");
  }

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  });

  const response = await API.post(
    "/speech/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
