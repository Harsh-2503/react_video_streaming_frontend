import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ResizableBox } from "react-resizable";
import Draggable from "react-draggable";
import Overlay from "./Overlay";

interface OverlayItem {
  type: "image" | "text";
  content: string | null;
  dragX: number;
  dragY: number;
  resizeW: number;
  resizeH: number;
}

interface PlayerProps {
  setOverlay: React.Dispatch<React.SetStateAction<OverlayItem[]>>;
  overlay: OverlayItem[];
}

const LivestreamPlayer: React.FC<PlayerProps> = ({ overlay, setOverlay }) => {
  const [addOverlay, setAddOverlay] = useState(false);
  const [frame, setFrame] = useState("");
  const [sid, setSid] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [dragUpdated, setDragUpdated] = useState(false);

  const onClose = () => {
    setAddOverlay((prev: boolean) => !prev);
  };

  useEffect(() => {
    socketRef.current = io("http://127.0.0.1:4999/test");
    socketRef.current.emit("rtsp_url", localStorage.getItem("rtsp_url"));

    socketRef.current.on("frame", (data) => {
      if (localStorage.getItem("sid") !== data.sid) {
        setSid(data.sid);
      } else {
        localStorage.setItem("sid", data.sid);
      }
      setFrame(`data:image/jpg;base64,${data.frame}`);
      const dataURL = `data:image/jpg;base64,${data.frame}`;
      if (videoRef.current) {
        videoRef.current.src = dataURL;
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchOverlay = async () => {
    const bodyContent = new FormData();
    bodyContent.append("user_name", localStorage.getItem("user_name") || "");
    try {
      const response = await fetch("http://localhost:4999/get-user", {
        method: "POST",
        body: bodyContent,
      });

      const data = await response.json();
      setOverlay(
        data?.overlays.map((jsonString: string) => JSON.parse(jsonString))
      );
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    console.log(dragUpdated);
    const bodyContent = new FormData();
    bodyContent.append("user_name", localStorage.getItem("user_name") || "");
    console.log(bodyContent);

    overlay?.map((item) => {
      bodyContent.append("overlays", JSON.stringify(item));
    });

    fetch("http://localhost:4999/overlays", {
      method: "PUT",
      body: bodyContent,
    }).then((res) => console.log(res));
  }, [dragUpdated, overlay]);

  useEffect(() => {
    fetchOverlay();
  }, []);

  return (
    <div className="flex justify-center">
      <div className="relative ">
        <img
          src={frame}
          className="object-cover w-full h-full"
          alt="Livestream"
        />

        {overlay?.map((data: OverlayItem, index: number) => (
          <Draggable
            key={index}
            onStop={(e, data) => {
              const dragArr = overlay;
              dragArr[index].dragX = data.lastX;
              dragArr[index].dragY = data.lastY;
              setOverlay(dragArr);
              setDragUpdated((prev) => !prev);
            }}
            defaultPosition={{ x: data.dragX, y: data.dragY }}
            handle="strong"
            bounds="parent"
          >
            <ResizableBox
              onResizeStop={(e, data) => {
                const dragArr = overlay;
                dragArr[index].resizeH = data.size.height;
                dragArr[index].resizeW = data.size.width;
                setOverlay(dragArr);
                setDragUpdated((prev) => !prev);
              }}
              width={data.resizeW}
              height={data.resizeH}
              minConstraints={[150, 150]}
              maxConstraints={[300, 300]}
              style={{
                backgroundColor: "white",
                position: "absolute",
                color: "black",
              }}
            >
              <strong
                className="cursor"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <div>Drag here</div>
                <div
                  onClick={() => {
                    const dragArr = overlay;
                    dragArr.splice(index, 1);
                    setOverlay(dragArr);
                    setDragUpdated((prev) => !prev);
                  }}
                >
                  Delete
                </div>
              </strong>
              {data.type === "text" ? (
                <div>{data.content}</div>
              ) : data?.content ? (
                <img
                  src={data?.content}
                  style={{ objectFit: "cover", width: "100%", height: "70%" }}
                  alt=""
                />
              ) : (
                <></>
              )}
            </ResizableBox>
          </Draggable>
        ))}
      </div>
      <div className="flex flex-col justify-center mx-4">
        <button
          onClick={() => {
            fetch("http://127.0.0.1:4999/pause", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sid: sid,
              }),
            });
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Pause
        </button>
        <button
          onClick={() => {
            fetch("http://127.0.0.1:4999/play", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sid: sid,
              }),
            });
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        >
          Play
        </button>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Overlay Settings</h2>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Create New Overlay</h2>
          <button
            onClick={!addOverlay ? onClose : () => {}}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
          >
            Create Overlay
          </button>
          {addOverlay ? (
            <Overlay
              onClose={onClose}
              overlay={overlay}
              setOverlay={setOverlay}
            ></Overlay>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivestreamPlayer;
