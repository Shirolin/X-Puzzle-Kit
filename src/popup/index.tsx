import { render } from "preact";
import { Suspense, lazy } from "preact/compat";
import "../ui/index.css";
import "./index.css";
import { StitchTask } from "../core/types";

const LazyApp = lazy(() =>
  import("../ui/App").then((m) => ({ default: m.App })),
);

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
  document.body.classList.add("x-puzzle-kit-mount-point");

  render(
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#86868b",
            fontFamily: "sans-serif",
            fontSize: "14px",
          }}
        >
          Loading...
        </div>
      }
    >
      <LazyApp
        task={dummyTask}
        onClose={() => window.close()}
        initialMode="split"
        isPopup={true}
        mountNode={root}
      />
    </Suspense>,
    root,
  );
}
