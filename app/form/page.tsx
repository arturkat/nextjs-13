"use client";

import { NavbarOffset } from "@comp/Navbar";
import TextInput from "@ui/TextInput";
import Textarea from "@ui/Textarea";
import Button from "@ui/Button";
import { useRef, useState } from "react";
import { host } from "@/lib/config";

export default function Form() {
  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);
  const [folderContent, setFolderContent] = useState([]);
  const folderPathRef = useRef([]);

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setCreateObjectURL(URL.createObjectURL(file));
    }
  };

  async function uploadToServer(e) {
    e.preventDefault();
    if (!image) return;
    const data = new FormData();
    data.append("file", image, image.name);
    let res = await fetch(`${host}/api/file-upload`, {
      method: "POST",
      body: data,
    });
    if (res.status === 200) {
      setImage(null);
      setCreateObjectURL(null);
    }
  }

  async function getFolderContent(folderPath = "", isBlack = false) {
    // debugger;
    if (folderPath) {
      folderPathRef.current.push(folderPath);
    } else if (isBlack) {
      folderPathRef.current.pop();
    }
    // console.log(`folderPath: ${folderPathRef.current}`);
    let urlSearchParams = new URLSearchParams({
      folderPath: folderPathRef.current.join("/"),
    });
    let url = new URL(`${host}/api/get-uploads`);
    url.search = urlSearchParams.toString();
    let res = await fetch(url, {
      method: "GET",
    });
    if (res.status === 200) {
      const resData = await res.json();
      if (resData.ok && resData.data) {
        setFolderContent(resData.data);
        console.log("success: ", resData);
      }
    } else {
      console.log("error: ", res);
    }
  }

  return (
    <>
      <NavbarOffset />
      <div className="container prose prose-xl">
        <h1>Forms</h1>

        <h2>Image Library</h2>
        <Button onClick={() => getFolderContent()} className="mb-5">
          Get Images
        </Button>
        <nav>
          <Button onClick={() => getFolderContent("", true)} className="mb-1">
            Back
          </Button>
        </nav>
        <div className="grid grid-flow-row-dense grid-cols-6 gap-4 border-2 p-5">
          {folderContent.map((item) => {
            if (item.isFolder) {
              return (
                <div
                  onClick={() => getFolderContent(item.name)}
                  className="border-amber-400 border-2 rounded-md p-2 radius break-words cursor-pointer"
                  key={item.name}
                >
                  Folder: {item.name}
                </div>
              );
            } else {
              return (
                <figure className="grid grid-cols-1 m-0" key={item.name}>
                  <img src={item.url} className="" />
                  <figcaption className="self-end break-words">
                    {item.name}
                  </figcaption>
                </figure>
              );
            }
          })}
        </div>

        <h2>Upload Image</h2>
        <form
          onSubmit={uploadToServer}
          action="http://localhost:3000/api/file-upload"
          className={`mb-10`}
        >
          <input type="file" name="file" onChange={uploadToClient} />
          <br /> <br />
          <Button type={"submit"}>Upload</Button>
          <br />
          <img src={createObjectURL} />
        </form>

        <hr />

        <h2>Styleguide</h2>
        <form>
          <TextInput />
          <Textarea />
          <Button>Update</Button>
        </form>
        <br />
      </div>
    </>
  );
}
