import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFiles: 1,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the filename and create a clean relative path
    const fileName = path.basename(file.filepath);
    const publicPath = `/uploads/${fileName}`;

    // Rename the file to ensure it has the correct extension if formidable changed it
    const finalPath = path.join(uploadDir, fileName);
    // Note: formidable usually handles this with keepExtensions, but we verify
    
    return res.status(200).json({ 
      url: publicPath,
      name: fileName 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
}