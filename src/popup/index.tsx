import { render } from "preact";
import { App } from "../ui/App";
import "../ui/index.css";
import "./index.css";
import { StitchTask } from "../core/types";

// Create a dummy task for the splitter mode
const dummyTask: StitchTask = {
  taskId: "splitter-popup",
  tweetId: "none",
  artistHandle: "none",
  pageTitle: "X-Puzzle-Kit Splitter",
  userImages: [], // Initially empty
  layout: "GRID_2x2",
  outputFormat: "png",
  backgroundColor: "transparent",
  globalGap: 0,
};

const root = document.getElementById("root");

if (root) {
  root.className = "x-puzzle-kit-mount-point";
  render(
    <App
      task={dummyTask}
      onClose={() => window.close()}
      initialMode="split"
      isPopup={true}
    />,
    root,
  );
}
