"use client";

import { NavbarOffset } from "@comp/Navbar";
import TextInput from "@ui/TextInput";
import Textarea from "@ui/Textarea";
import Button from "@ui/Button";
import { useEffect, useRef, useState } from "react";
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
        <ContextMenu />
        <nav className="mb-4">
          <Button onClick={() => getFolderContent()}>Get Images</Button>
          <Button onClick={() => getFolderContent("", true)}>Back</Button>
        </nav>
        <div
          className="grid grid-flow-row-dense grid-cols-6 gap-4 border-2 rounded-md p-5"
          data-context-menu="canvas"
        >
          {folderContent.map((item) => {
            if (item.isFolder) {
              return (
                <div
                  onClick={() => getFolderContent(item.name)}
                  data-context-menu="folder"
                  className="border-amber-500 border-2 rounded-md bg-amber-200 p-2 radius break-words cursor-pointer"
                  key={item.name}
                >
                  Folder: {item.name}
                </div>
              );
            } else {
              return (
                <figure
                  data-context-menu="image"
                  className="grid grid-cols-1 m-0 p-2 rounded-md border-2 border-amber-500 bg-amber-50"
                  key={item.name}
                >
                  <img src={item.url} className="rounded-md" />
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
          action={`${host}/api/file-upload`}
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

function ContextMenu(props) {
  let { cords, setCords, visible, setVisible, target } = useContextMenu();

  return (
    visible && (
      <div
        className="absolute inline-grid gap-2 min-w-[7rem] bg-indigo-300 shadow-lg shadow-indigo-400 rounded-md px-5 py-3 my-2"
        style={{ top: cords.y, left: cords.x }}
      >
        {target.dataset.contextMenu === "folder" && (
          <>
            <a
              className="text-xl cursor-pointer"
              onClick={() => target.click()}
            >
              Open
            </a>
            <a className="text-xl cursor-pointer">Delete</a>
            <a className="text-xl cursor-pointer">Exit</a>
          </>
        )}
        {target.dataset.contextMenu === "image" && (
          <>
            <a className="text-xl cursor-pointer">Delete</a>
            <a className="text-xl cursor-pointer">Exit</a>
          </>
        )}
        {target.dataset.contextMenu === "canvas" && (
          <>
            <a className="text-xl cursor-pointer">Create Folder</a>
            <a className="text-xl cursor-pointer">Exit</a>
          </>
        )}
      </div>
    )
  );
}

function useContextMenu() {
  let [cords, setCords] = useState({ x: 0, y: 0 });
  let [visible, setVisible] = useState(false);
  let [target, setTarget] = useState(null);

  function handleContextMenu(e) {
    const iTarget = e.target.closest("[data-context-menu]");
    if (iTarget) {
      e.preventDefault();
      setTarget(iTarget);
      setCords({ x: e.pageX, y: e.pageY });
      setVisible(true);
    }
  }

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", () => setVisible(false));
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", () => setVisible(false));
    };
  }, []);

  return {
    cords,
    setCords,
    visible,
    setVisible,
    target,
  };
}
