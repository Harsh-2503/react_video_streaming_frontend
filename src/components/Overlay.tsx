import React, { useState, useEffect } from "react";

interface OverlayItem {
  type: "image" | "text";
  content: string | null; // For image, it will be base64; for text, it will be the text content
  dragX: number;
  dragY: number;
  resizeW: number;
  resizeH: number;
}

// interface OverlayArray {
//   overlays: OverlayItem[];
// }

interface OverlayProps {
  onClose: () => void;
  setOverlay: React.Dispatch<React.SetStateAction<OverlayItem[]>>;
  overlay: OverlayItem[];
}

const Overlay: React.FC<OverlayProps> = ({ onClose, overlay, setOverlay }) => {
  const [isTextSelected, setIsTextSelected] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string>("");
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const handleTextOption = () => {
    setIsTextSelected(true);
    setBase64Image(null); // Reset image file state
  };

  const handleImageOption = () => {
    setIsTextSelected(false);
    setTextValue(""); // Reset text value state
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        // Once the FileReader has finished reading, set the base64 image
        setBase64Image(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
    setBase64Image(null);
  };

  const handleSubmit = () => {
    // Handle submission based on selected option (text or image)
    const item: OverlayItem = {
      type: "text",
      content: textValue,
      dragX: 0,
      dragY: 0,
      resizeW: 150,
      resizeH: 150,
    };
    if (isTextSelected) {
      console.log("Text submitted:", textValue);
      item.content = textValue;
      item.type = "text";
    } else {
      item.type = "image";

      console.log("Image submitted:", base64Image);
      item.content = base64Image;
    }

    setOverlay((prevOverlays) => {
      if (prevOverlays === undefined) {
        return [item];
      }

      return [...prevOverlays, item];
    });

    onClose();
  };

  useEffect(() => {
    const bodyContent = new FormData();
    bodyContent.append("user_name", localStorage.getItem("user_name") || "");
    console.log(bodyContent);

    overlay.map((item) => {
      bodyContent.append("overlays", JSON.stringify(item));
    });

    fetch("http://localhost:4999/overlays", {
      method: "PUT",
      body: bodyContent,
    }).then((res) => console.log(res));
  }, [overlay]);

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Select Option</h2>
      <div className="mb-4">
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            name="option"
            checked={!isTextSelected}
            onChange={handleImageOption}
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Image</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="option"
            checked={isTextSelected}
            onChange={handleTextOption}
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Text</span>
        </label>
      </div>

      {isTextSelected ? (
        <div className="mb-4">
          <label className="block">
            <span className="text-gray-700">Text Input:</span>
            <input
              type="text"
              value={textValue}
              onChange={handleTextChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </label>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block">
            <span className="text-gray-700">Image Upload:</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full"
            />
          </label>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </div>
  );
};

export default Overlay;
