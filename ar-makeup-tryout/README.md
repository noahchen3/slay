# AR Makeup Try-On

This is a client-side AR makeup try-on app built with React and face-api.js. It lets you preview virtual lipstick, eyeshadow, and blush in real time using your webcam.

## Wireframe

[View the Figma wireframe](https://www.figma.com/design/GDVwyD22WASa2fVxATkUjv/wireframe?node-id=0-1&t=NkeCt8C4qsqDzIwb-1)

## Prerequisites

- **Node.js** (v18 or newer recommended)
- **npm** (comes with Node.js)
- A **webcam** and a **modern browser** (Chrome, Firefox, Edge, Safari)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd ar-makeup-tryout
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the App Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```
2. **Open your browser and go to:**
   [http://localhost:5173](http://localhost:5173) (or the URL shown in your terminal)

3. **Allow camera access** when prompted.

## Usage

- Wait for face detection and skin tone analysis to complete.
- Use the toggles to enable/disable lipstick, eyeshadow, or blush.
- Select makeup colors and adjust intensity with the sliders.
- Click the circular button below the camera to capture a photo of your look.

## Notes

- All processing is done in your browser. No images or data are sent to a server.
- For best results, use in a well-lit environment.

## Troubleshooting

- If the camera does not work, check browser permissions and ensure no other app is using the webcam.
- If you see "Failed to load face detection models", ensure you have the `/models` directory in `public/`.
- For any issues, try refreshing the page or restarting the dev server.

---

For more details, see the code and comments in the repository.
