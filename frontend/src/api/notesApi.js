import axios from "axios";

const API_URL = "http://localhost:5000/api/notes";

export const searchNotes = async (keyword, sort = "date_desc") => {
  const response = await axios.get(`${API_URL}/search`, {
    params: { q: keyword, sort }, // pass sort to backend
  });
  return response.data;
};

export const getNotes = async (sort = "date_desc") => {
  const response = await axios.get(API_URL, {
    params: { sort }, // pass sort to backend
  });
  return response.data;
};

