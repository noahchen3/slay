import React from "react";
import styled from "styled-components";

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1.5rem 0;
  width: 100%;
  max-width: 400px;
`;

const ToggleRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ToggleButton = styled.button`
  background: ${({ active }) => (active ? "#d72660" : "#eee")};
  color: ${({ active }) => (active ? "#fff" : "#333")};
  border: none;
  border-radius: 1rem;
  padding: 0.5rem 1.2rem;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
`;

const SwatchRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  justify-content: center;
`;

const Swatch = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid ${({ selected }) => (selected ? "#d72660" : "#ccc")};
  background: ${({ color }) => color};
  cursor: pointer;
  outline: none;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
`;

const Label = styled.label`
  font-size: 0.95rem;
  color: #333;
  min-width: 70px;
`;

const Slider = styled.input`
  width: 120px;
`;

const types = ["lipstick", "eyeshadow", "blush"];

const MakeupSelector = ({
  availablePalettes = {},
  enabledTypes = {},
  selectedColors = {},
  intensities = {},
  onToggle,
  onColorChange,
  onIntensityChange,
}) => {
  return (
    <SelectorContainer>
      <ToggleRow>
        {types.map((type) => (
          <ToggleButton
            key={type}
            active={!!enabledTypes[type]}
            onClick={() => onToggle(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </ToggleButton>
        ))}
      </ToggleRow>
      {types.map((type) =>
        enabledTypes[type] && availablePalettes[type] ? (
          <div key={type}>
            <SwatchRow>
              {availablePalettes[type].map((color) => (
                <Swatch
                  key={color}
                  color={color}
                  selected={selectedColors[type] === color}
                  onClick={() => onColorChange(type, color)}
                  aria-label={color}
                />
              ))}
            </SwatchRow>
            <SliderRow>
              <Label htmlFor={`slider-${type}`}>Intensity</Label>
              <Slider
                id={`slider-${type}`}
                type="range"
                min={0}
                max={100}
                value={intensities[type] || 70}
                onChange={(e) =>
                  onIntensityChange(type, Number(e.target.value))
                }
              />
              <span>{intensities[type] || 70}%</span>
            </SliderRow>
          </div>
        ) : null
      )}
    </SelectorContainer>
  );
};

export default MakeupSelector;
