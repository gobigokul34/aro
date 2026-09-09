import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL,
});

export const uploadAudio = async (audio, metadata = {}) => {
  const formData = new FormData();
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
