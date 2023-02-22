import { NextApiRequest, NextApiResponse } from "next";
import { File } from "formidable";
import { host } from "@/lib/config";
import path from "path";
import fs from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  if (req.method === "GET") {
    try {
      let folderPath = req.query.folderPath ?? "";
      let uploads = [];
      let uploadsFolder = path.join("public", "uploads");
      if (folderPath) {
        uploadsFolder = path.join(uploadsFolder, folderPath as string);
      }
      let urlBase = `${host}/uploads`;
      if (folderPath) {
        urlBase = `${urlBase}/${folderPath}`;
      }
      let content = fs.readdirSync(uploadsFolder);
      if (content.length) {
        content.forEach((item) => {
          let name = item.split(".")[0];
          let path = folderPath;
          let url = `${urlBase}/${encodeURIComponent(item)}`;
          let isFolder =
            item.match(/\.jpg|\.png|\.jpeg|\.gif|\.svg|\.webp/) === null;
          uploads.push({
            name,
            path,
            url,
            isFolder,
          });
        });
        uploads.sort((a, b) => {
          if (a.isFolder && !b.isFolder) {
            return -1;
          } else if (!a.isFolder && b.isFolder) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      return res.status(200).json({ ok: true, data: uploads });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  } else {
    // Handle any other HTTP method
  }
}
