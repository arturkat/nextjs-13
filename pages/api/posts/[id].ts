import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// type Data = {
//   name: string;
// };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse /*<Data>*/
) {
  if (req.method === "POST") {
    try {
      const id = Number(req.query.id);
      const { title, slug, content } = req.body;

      const post = await prisma.post.findUnique({
        where: { id },
      });
      if (!post) throw new Error(`Can't find the post`);
      // console.log("post:", post);

      const newPost = await prisma.post.update({
        where: { id },
        data: { title, content },
      });
      if (!newPost) throw new Error(`Can't update the post`);
      // console.log("newPost:", newPost);

      res.status(200).json({ ok: true, data: newPost });
    } catch (err) {
      res.status(500).json({ ok: false, error: "Failed to update the post" });
    }
  } else {
    // Handle any other HTTP method
  }
}
