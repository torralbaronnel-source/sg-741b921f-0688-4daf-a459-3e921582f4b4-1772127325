import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Image URL required" });
  }

  if (!url.startsWith("/uploads/")) {
    return res.status(400).json({ error: "Invalid path" });
  }

  const filePath = path.join(process.cwd(), "public", url);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ error: "File not found" });
  } catch (err) {
    return res.status(500).json({ error: "Deletion failed" });
  }
}