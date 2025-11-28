// src/services/api.js

const AUTH_URL = "http://localhost:5000/api/auth";
const NOTES_URL = "http://localhost:5000/notes";   


export async function loginUser(email, password) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function signupUser(email, password) {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}


export async function getNotes(search = "") {
  const res = await fetch(`${NOTES_URL}?search=${search}`);
  return res.json();
}
