import React, { useState } from "react";
import { useNavigate } from "react-router";

interface OverlayItem {
  type: "image" | "text";
  content: string | null; // For image, it will be base64; for text, it will be the text content
  dragX: number;
  dragY: number;
  resizeW: number;
  resizeH: number;
}

interface LoginProps {
  onLogin: (username: string) => void;
  setOverlay: React.Dispatch<React.SetStateAction<OverlayItem[]>>;
  overlay: OverlayItem[];
}

interface RegisterProps {
  onRegister: (username: string, rtspUrl: string) => void;
  setOverlay: React.Dispatch<React.SetStateAction<OverlayItem[]>>;
  overlay: OverlayItem[];
}

interface LoginOrRegisterProps {
  onRegister: (username: string, rtspUrl: string) => void;
  setOverlay: React.Dispatch<React.SetStateAction<OverlayItem[]>>;
  overlay: OverlayItem[];
}

const Login: React.FC<LoginProps> = ({ setOverlay }) => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (username.trim() !== "") {
      const bodyContent = new FormData();
      bodyContent.append("user_name", username);
      try {
        const response = await fetch("http://localhost:4999/get-user", {
          method: "POST",
          body: bodyContent,
        });

        const data = await response.json();
        setOverlay(
          data?.overlays.map((jsonString: string) => JSON.parse(jsonString))
        );
        localStorage.setItem("user_name", username);
        localStorage.setItem("rtsp_url", data?.rtsp_url);
        navigate("/view");
      } catch (err) {
        console.log(err);
      }
    } else {
      alert("Please enter a username");
    }
  };

  return (
    <div className="w-full max-w-xs">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border border-gray-400 rounded py-2 px-4 mb-4 w-full"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Login
      </button>
    </div>
  );
};

const Register: React.FC<RegisterProps> = ({
  onRegister,
  overlay,
  setOverlay,
}) => {
  const [username, setUsername] = useState("");
  const [rtspUrl, setRtspUrl] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (username.trim() !== "" && rtspUrl.trim() !== "") {
      const bodyContent = new FormData();
      bodyContent.append("user_name", username);
      bodyContent.append("rtsp_url", rtspUrl);
      overlay?.map((item) => {
        bodyContent.append("overlays", JSON.stringify(item));
      });
      try {
        const response = await fetch("http://localhost:4999/add-user", {
          method: "POST",
          body: bodyContent,
        });

        let temp = [];
        const data = await response.json();
        if (data?.overlay?.lenght > 0) {
          temp = data?.overlays.map((jsonString: string) =>
            JSON.parse(jsonString)
          );
        }

        if (temp.lenght > 0) {
          setOverlay(temp);
        }

        localStorage.setItem("user_name", username);
        localStorage.setItem("rtsp_url", rtspUrl);

        navigate("/view");
      } catch (err) {
        console.log(err);
      }
      onRegister(username, rtspUrl);
    } else {
      alert("Please enter both username and RTSP URL");
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border border-gray-400 rounded py-2 px-4 mb-4 w-full"
      />
      <input
        type="text"
        placeholder="Enter RTSP URL"
        value={rtspUrl}
        onChange={(e) => setRtspUrl(e.target.value)}
        className="border border-gray-400 rounded py-2 px-4 mb-4 w-full"
      />
      <button
        onClick={handleRegister}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Register
      </button>
    </div>
  );
};

const LoginOrRegister: React.FC<LoginOrRegisterProps> = ({
  overlay,
  setOverlay,
}) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (username: string) => {
    // Handle login logic
    console.log(`Logged in as ${username}`);
  };

  const handleRegister = (username: string, rtspUrl: string) => {
    // Handle register logic
    console.log(`Registered username ${username} with RTSP URL ${rtspUrl}`);
  };

  return (
    <div className="flex flex-col items-center">
      {isLogin ? (
        <Login
          setOverlay={setOverlay}
          overlay={overlay}
          onLogin={handleLogin}
        />
      ) : (
        <Register
          setOverlay={setOverlay}
          overlay={overlay}
          onRegister={handleRegister}
        />
      )}
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        {isLogin ? "Register" : "Login"}
      </button>
    </div>
  );
};

export default LoginOrRegister;
