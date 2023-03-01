import { NextApiRequest, NextApiResponse } from "next";
import { host } from "@/lib/config";
import path from "path";
import fs from "fs";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  if (req.method === "POST") {
    try {
      let folderName = req.body.folderName ?? "";
      let folderPath = req.body.folderPath ?? "";
      let uploadsFolder = path.join("public", "uploads");
      if (folderPath) {
        uploadsFolder = path.join(uploadsFolder, folderPath as string);
      }
      let urlBase = `${host}/uploads`;
      if (folderPath) {
        urlBase = `${urlBase}/${folderPath}`;
      }

      fs.mkdirSync(path.join(uploadsFolder, folderName));

      let newFolder = {
        name: folderName,
        path: folderPath,
        url: `${urlBase}/${encodeURIComponent(folderName)}`,
        isFolder: true,
      };

      return res.status(200).json({ ok: true, data: newFolder });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  } else {
    // Handle any other HTTP method
  }
}
