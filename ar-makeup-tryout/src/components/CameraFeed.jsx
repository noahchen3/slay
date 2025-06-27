import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as faceapi from "face-api.js";
import SkinToneAnalyzer from "../ml/SkinToneAnalyzer";
import MakeupRenderer from "../ml/MakeupRenderer";

const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  aspect-ratio: 3/4;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  border-radius: 1rem;
  background: #222;
  object-fit: cover;
`;

const OverlayCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Loading = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #d72660;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem 2rem;
  border-radius: 1rem;
  z-index: 2;
`;

const ErrorMsg = styled.div`
  color: #fff;
  background: #d72660;
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  margin-top: 1rem;
`;

const FaceStatus = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 1rem;
  z-index: 3;
  border: 2px solid #d72660;
`;

const CaptureButton = styled.button`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid #d72660;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s, border 0.2s;
  &:active {
    background: #f8bbd0;
    border-color: #d72660;
  }
`;

const MODEL_URL_DETECTOR = "/models/tiny_face_detector";
const MODEL_URL_LANDMARKS = "/models/face_landmark_68_tiny";

const CameraFeed = ({
  onVideoReady,
  enabledTypes = {},
  selectedColors = {},
  intensities = {},
  onSkinToneAndPalettes,
  skinTone,
  skinToneLocked,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);

  // Ensure canvas style matches video size after metadata loads
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const handleResize = () => {
      // Set canvas style to match video display size
      canvas.style.width = `${video.clientWidth}px`;
      canvas.style.height = `${video.clientHeight}px`;
    };
    video.addEventListener("loadedmetadata", handleResize);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      video.removeEventListener("loadedmetadata", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, [videoRef, canvasRef]);

  // Load models
  useEffect(() => {
    setModelLoading(true);
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL_DETECTOR),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL_LANDMARKS),
    ])
      .then(() => setModelLoading(false))
      .catch((err) => {
        setError("Failed to load face detection models: " + err.message);
        setModelLoading(false);
      });
  }, []);

  // Initialize camera
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        if (!active) return;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setLoading(false);
            if (onVideoReady) onVideoReady(videoRef.current, canvasRef.current);
          };
        }
      })
      .catch((err) => {
        setError(
          "Unable to access camera: " +
            (err.name === "NotAllowedError"
              ? "Permission denied."
              : err.message)
        );
        setLoading(false);
      });

    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Face detection loop
  useEffect(() => {
    const analyzer = new SkinToneAnalyzer();
    const renderer = new MakeupRenderer();
    let animationId;
    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4 || modelLoading) {
        animationId = requestAnimationFrame(detect);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("No canvas context!");
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Only run face detection, skin tone analysis, and makeup overlays from here
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true);
      if (detection && detection.landmarks) {
        setFaceDetected(true);
        const resized = faceapi.resizeResults(detection, {
          width: canvas.width,
          height: canvas.height,
        });
        const landmarkPoints = resized.landmarks.positions.map((pt) => ({
          x: pt.x,
          y: pt.y,
        }));
        const analysis = analyzer.analyze(video, landmarkPoints);
        // Pass skin tone and palettes up to parent
        if (onSkinToneAndPalettes && analysis && !skinToneLocked) {
          onSkinToneAndPalettes(analysis.skinToneCategory, analysis.palettes);
        }
        // Draw overlays based on enabledTypes, selectedColors, and intensities
        if (analysis && analysis.palettes) {
          if (enabledTypes.lipstick && selectedColors.lipstick) {
            renderer.drawLips(
              ctx,
              landmarkPoints,
              selectedColors.lipstick,
              (intensities.lipstick || 70) / 100
            );
          }
          if (enabledTypes.eyeshadow && selectedColors.eyeshadow) {
            renderer.drawEyeshadow(
              ctx,
              landmarkPoints,
              selectedColors.eyeshadow,
              (intensities.eyeshadow || 40) / 100
            );
          }
          if (enabledTypes.blush && selectedColors.blush) {
            renderer.drawBlush(
              ctx,
              landmarkPoints,
              selectedColors.blush,
              (intensities.blush || 30) / 100
            );
          }
        }
      } else {
        setFaceDetected(false);
        if (onSkinToneAndPalettes && !skinToneLocked)
          onSkinToneAndPalettes(null, {
            lipstick: [],
            eyeshadow: [],
            blush: [],
          });
      }
      animationId = requestAnimationFrame(detect);
    };
    if (!modelLoading && !loading && !error) {
      detect();
    }
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [
    modelLoading,
    loading,
    error,
    enabledTypes,
    selectedColors,
    intensities,
    onSkinToneAndPalettes,
    skinToneLocked,
  ]);

  const handleCapture = () => {
    const video = videoRef.current;
    const overlay = canvasRef.current;
    if (!video || !overlay) return;
    // Create a temp canvas to combine video and overlay
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext("2d");
    // Draw video frame
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    // Draw overlay (makeup)
    ctx.drawImage(overlay, 0, 0, tempCanvas.width, tempCanvas.height);
    // Download image
    const link = document.createElement("a");
    link.download = "ar-makeup-photo.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <CameraContainer>
      {loading && <Loading>Loading camera...</Loading>}
      {modelLoading && !loading && (
        <Loading>Loading face detection models...</Loading>
      )}
      <Video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: loading ? "none" : "block" }}
      />
      <OverlayCanvas ref={canvasRef} />
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {!loading && !modelLoading && (
        <FaceStatus
          style={{ borderColor: faceDetected ? "#27ae60" : "#d72660" }}
        >
          {faceDetected ? "Face detected!" : "No face detected"}
        </FaceStatus>
      )}
      {/* Show detected skin tone */}
      {!loading && !modelLoading && skinTone && (
        <div
          style={{
            position: "absolute",
            top: "3.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.85)",
            color: "#d72660",
            padding: "0.5rem 1rem",
            borderRadius: "1rem",
            fontWeight: "bold",
            zIndex: 4,
            border: "2px solid #d72660",
          }}
        >
          Skin Tone: {skinTone}
        </div>
      )}
      {/* Capture Photo Button */}
      {!loading && !modelLoading && (
        <CaptureButton onClick={handleCapture} title="Capture Photo">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="#d72660"
              strokeWidth="2"
              fill="#fff"
            />
            <circle cx="16" cy="16" r="7" fill="#d72660" />
          </svg>
        </CaptureButton>
      )}
    </CameraContainer>
  );
};

export default CameraFeed;
