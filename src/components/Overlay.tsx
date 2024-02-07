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
      resizeW: 100,
      resizeH: 100,
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
    <div>
      <h2>Select Option</h2>
      <div>
        <label>
          <input
            type="radio"
            name="option"
            checked={!isTextSelected}
            onChange={handleImageOption}
          />
          Image
        </label>
        <label>
          <input
            type="radio"
            name="option"
            checked={isTextSelected}
            onChange={handleTextOption}
          />
          Text
        </label>
      </div>

      {isTextSelected ? (
        <div>
          <label>
            Text Input:
            <input type="text" value={textValue} onChange={handleTextChange} />
          </label>
        </div>
      ) : (
        <div>
          <label>
            Image Upload:
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
      )}

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Overlay;
