import Folder from "../models/folderModel.js";

export const LOCKED_FOLDER_NAME = "Locked Notes";

/**
 * Ensure the locked folder exists for a user. Creates it if missing.
 */
export async function ensureLockedFolder(userId) {
  let folder = await Folder.findOne({ user: userId, isDefault: true, name: LOCKED_FOLDER_NAME });
  if (!folder) {
    folder = new Folder({
      user: userId,
      name: LOCKED_FOLDER_NAME,
      parentId: null,
      isDefault: true,
      isProtected: false,
      passwordHash: null,
    });
    await folder.save();
  }
  return folder;
}

/**
 * Check if a folder document represents the locked folder.
 */
export function isLockedFolder(folder) {
  return !!folder && folder.isDefault === true && folder.name === LOCKED_FOLDER_NAME;
}
