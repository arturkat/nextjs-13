"use client";

import { NavbarOffset } from "@comp/Navbar";
import TextInput from "@ui/TextInput";
import Textarea from "@ui/Textarea";
import Button from "@ui/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import { host } from "@/lib/config";

export default function Form() {
  let [image, setImage] = useState(null);
  let [createObjectURL, setCreateObjectURL] = useState(null);
  let [folderContent, setFolderContent] = useState([]);
  let folderPathRef = useRef([]);

  let uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      let file = event.target.files[0];
      setImage(file);
      setCreateObjectURL(URL.createObjectURL(file));
    }
  };

  async function uploadToServer(e) {
    e.preventDefault();
    if (!image) return;
    let data = new FormData();
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
    if (folderPath) {
      folderPathRef.current.push(folderPath);
    } else if (isBlack) {
      folderPathRef.current.pop();
    }
    let urlSearchParams = new URLSearchParams({
      folderPath: folderPathRef.current.join("/"),
    });
    let url = new URL(`${host}/api/get-uploads`);
    url.search = urlSearchParams.toString();
    let res = await fetch(url, {
      method: "GET",
    });
    if (res.status === 200) {
      let resData = await res.json();
      if (resData.ok && resData.data) {
        setFolderContent(resData.data);
        console.log("success: ", resData);
      }
    } else {
      console.log("error: ", res);
    }
  }

  async function createFolder() {
    let folderName = prompt("Enter folder name");
    let bodyData = {
      folderName,
      folderPath: folderPathRef.current.join("/"),
    };
    let res = await fetch(`${host}/api/create-folder`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });
    if (res.status === 200) {
      let resData = await res.json();
      if (resData.ok && resData.data) {
        console.log("createFolder - success: ", resData);
        await getFolderContent(); // refresh current folder content
      }
    } else {
      console.log("createFolder - error: ", res);
    }
  }

  let contextMenuHook = useContextMenu();

  // useEffect(() => {
  //   console.log("contextMenuHook: ", contextMenuHook);
  // }, []);

  return (
    <>
      <NavbarOffset />
      <div className="container prose prose-xl">
        <h1>Forms</h1>

        <h2>Image Library</h2>
        <ContextMenu {...contextMenuHook} />
        <pre>folderPathRef: {folderPathRef.current.join("/")}</pre>
        <nav className="mb-4">
          <Button onClick={() => getFolderContent()}>Get Images</Button>
          <Button onClick={() => getFolderContent("", true)}>Back</Button>
          <Button onClick={() => createFolder()}>Create Folder</Button>
        </nav>
        <div
          className="grid grid-flow-row-dense grid-cols-6 gap-4 border-2 rounded-md p-5"
          onContextMenu={(e) => {
            contextMenuHook.setType("canvas");
            contextMenuHook.handleContextMenu(e);
          }}
          // data-context-menu="canvas"
        >
          {folderContent.map((item) => {
            if (item.isFolder) {
              return (
                <div
                  onClick={() => getFolderContent(item.name)}
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    contextMenuHook.setType("folder");
                    contextMenuHook.handleContextMenu(e);
                  }}
                  // data-context-menu="folder"
                  className="border-amber-500 border-2 rounded-md bg-amber-200 p-2 radius break-words cursor-pointer"
                  key={item.name}
                >
                  Folder: {item.name}
                </div>
              );
            } else {
              return (
                <figure
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    contextMenuHook.setType("image");
                    contextMenuHook.handleContextMenu(e);
                  }}
                  // data-context-menu="image"
                  className="grid grid-cols-1 m-0 p-2 rounded-md border-2 border-amber-200 bg-amber-50"
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

// https://blog.logrocket.com/creating-react-context-menu/
function ContextMenu(props) {
  // let { cords, setCords, visible, setVisible, target, handleContextMenu, handleClick } = useContextMenu();
  let {
    cords,
    setCords,
    visible,
    setVisible,
    type,
    setType,
    target,
    handleContextMenu,
    handleClick,
  } = props;
  let linkClasses =
    "py-2 px-4 text-xl rounded-md cursor-pointer transition-colors duration-300 bg-indigo-300 hover:bg-indigo-400";

  return (
    visible && (
      <div
        className="absolute inline-grid gap-0 min-w-[7rem] bg-indigo-300 shadow-lg shadow-indigo-400 rounded-md"
        style={{ top: cords.y, left: cords.x }}
      >
        {type === "folder" && (
          <>
            <a className={linkClasses} onClick={() => target.click()}>
              Open
            </a>
            <a className={linkClasses}>Delete</a>
            <a className={linkClasses}>Exit</a>
          </>
        )}
        {type === "image" && (
          <>
            <a className={linkClasses}>Delete</a>
            <a className={linkClasses}>Exit</a>
          </>
        )}
        {type === "canvas" && (
          <>
            <a className={linkClasses}>Create Folder</a>
            <a className={linkClasses}>Exit</a>
          </>
        )}

        {/*{target.dataset.contextMenu === "folder" && (*/}
        {/*  <>*/}
        {/*    <a className={linkClasses} onClick={() => target.click()}>*/}
        {/*      Open*/}
        {/*    </a>*/}
        {/*    <a className={linkClasses}>Delete</a>*/}
        {/*    <a className={linkClasses}>Exit</a>*/}
        {/*  </>*/}
        {/*)}*/}
        {/*{target.dataset.contextMenu === "image" && (*/}
        {/*  <>*/}
        {/*    <a className={linkClasses}>Delete</a>*/}
        {/*    <a className={linkClasses}>Exit</a>*/}
        {/*  </>*/}
        {/*)}*/}
        {/*{target.dataset.contextMenu === "canvas" && (*/}
        {/*  <>*/}
        {/*    <a className={linkClasses}>Create Folder</a>*/}
        {/*    <a className={linkClasses}>Exit</a>*/}
        {/*  </>*/}
        {/*)}*/}
      </div>
    )
  );
}

function useContextMenu() {
  let [cords, setCords] = useState({ x: 0, y: 0 });
  let [visible, setVisible] = useState(false);
  let [target, setTarget] = useState(null);
  let [type, setType] = useState(null);

  let handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setTarget(e.target);
    setCords({ x: e.pageX, y: e.pageY });
    setVisible(true);
  }, []);

  // function handleContextMenu(e) {
  //   e.preventDefault();
  //   setTarget(e.target);
  //   setCords({ x: e.pageX, y: e.pageY });
  //   setVisible(true);
  // }

  // function handleClick() {
  //   setVisible(false);
  // }

  useEffect(() => {
    // function handleContextMenu(e) {
    //   let iTarget = e.target.closest("[data-context-menu]");
    //   if (iTarget) {
    //     e.preventDefault();
    //     setTarget(iTarget);
    //     setCords({ x: e.pageX, y: e.pageY });
    //     setVisible(true);
    //   }
    // }

    function handleClick() {
      setVisible(false);
    }
    document.addEventListener("click", handleClick);
    // document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("click", handleClick);
      // document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return {
    cords,
    setCords,
    visible,
    setVisible,
    type,
    setType,
    target,
    handleContextMenu,
    // handleClick,
  };
}
