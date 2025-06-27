import "./App.css";
import React, { useState } from "react";
import CameraFeed from "./components/CameraFeed";
import MakeupSelector from "./components/MakeupSelector";
import styled from "styled-components";

const HelpBox = styled.div`
  background: #fff3f8;
  color: #d72660;
  border: 2px solid #d72660;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  margin: 1.5rem auto 1rem auto;
  max-width: 420px;
  font-size: 1.05rem;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;
const DismissBtn = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.7rem;
  background: none;
  border: none;
  color: #d72660;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
`;

function App() {
  const [enabledTypes, setEnabledTypes] = useState({
    lipstick: true,
    eyeshadow: true,
    blush: true,
  });
  const [selectedColors, setSelectedColors] = useState({
    lipstick: null,
    eyeshadow: null,
    blush: null,
  });
  const [intensities, setIntensities] = useState({
    lipstick: 70,
    eyeshadow: 40,
    blush: 30,
  });
  const [palettes, setPalettes] = useState({
    lipstick: [],
    eyeshadow: [],
    blush: [],
  });
  const [skinTone, setSkinTone] = useState(null);
  const [showHelp, setShowHelp] = useState(true);

  // Handler for toggling makeup types
  const handleToggle = (type) => {
    setEnabledTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Handler for color selection
  const handleColorChange = (type, color) => {
    setSelectedColors((prev) => ({ ...prev, [type]: color }));
  };

  // Handler for intensity slider
  const handleIntensityChange = (type, value) => {
    setIntensities((prev) => ({ ...prev, [type]: value }));
  };

  // Handler to receive palettes and skin tone from CameraFeed
  const handleSkinToneAndPalettes = (skinToneCategory, palettesObj) => {
    setSkinTone(skinToneCategory);
    setPalettes(palettesObj || { lipstick: [], eyeshadow: [], blush: [] });
    // Set default colors if not already set
    setSelectedColors((prev) => {
      const updated = { ...prev };
      ["lipstick", "eyeshadow", "blush"].forEach((type) => {
        if (
          !updated[type] &&
          palettesObj &&
          palettesObj[type] &&
          palettesObj[type][0]
        ) {
          updated[type] = palettesObj[type][0];
        }
      });
      return updated;
    });
  };

  const handleDismissHelp = () => setShowHelp(false);

  return (
    <div className="app-container">
      <h1>AR Makeup Try-On</h1>
      {showHelp && (
        <HelpBox>
          <DismissBtn onClick={handleDismissHelp} title="Dismiss">
            ×
          </DismissBtn>
          <strong>How to use:</strong>
          <br />
          1. Allow camera access when prompted.
          <br />
          2. Wait for face detection and skin tone analysis.
          <br />
          3. Use the toggles to enable/disable lipstick, eyeshadow, or blush.
          <br />
          4. Select makeup colors and adjust intensity with the sliders.
          <br />
          5. Click the circular button below the camera to capture a photo of
          your look.
          <br />
        </HelpBox>
      )}
      <MakeupSelector
        availablePalettes={palettes}
        enabledTypes={enabledTypes}
        selectedColors={selectedColors}
        intensities={intensities}
        onToggle={handleToggle}
        onColorChange={handleColorChange}
        onIntensityChange={handleIntensityChange}
      />
      <CameraFeed
        enabledTypes={enabledTypes}
        selectedColors={selectedColors}
        intensities={intensities}
        onSkinToneAndPalettes={handleSkinToneAndPalettes}
        skinTone={skinTone}
      />
    </div>
  );
}

export default App;
