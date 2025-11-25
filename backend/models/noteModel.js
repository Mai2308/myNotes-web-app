import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String },
		tags: [{ type: String }],
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
