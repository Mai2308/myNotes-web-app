import { pool } from "../database/db.js";

// Create a folder
export const createFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    await pool.request()
      .input("userId", userId)
      .input("name", name)
      .query("INSERT INTO Folders (name, user_id) VALUES (@name, @userId)");
    res.status(201).json({ message: "Folder created!" });
  } catch (err) {
    res.status(500).json({ message: "Error creating folder" });
  }
};

// List folders for user
export const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.request()
      .input("userId", userId)
      .query("SELECT * FROM Folders WHERE user_id=@userId");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Error fetching folders" });
  }
};