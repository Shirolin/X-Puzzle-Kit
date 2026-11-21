import { calculateCellRegions, MAX_SPLIT_COUNT } from "./core/splitLayout";

type Mode = "original" | "horizontal" | "vertical";

const photo = document.querySelector<HTMLImageElement>("#sample")!;
const canvas = document.querySelector("canvas")!;
const controls = document.querySelector<HTMLFieldSetElement>(".modes")!;
const buttons = controls.querySelectorAll("button");
const count = document.querySelector<HTMLInputElement>("#slice-count")!;
const countLabel = document.querySelector("output")!;
const ruler = document.querySelector<HTMLElement>(".ruler")!;
const context = canvas.getContext("2d");

let mode: Mode = "horizontal";
count.max = String(MAX_SPLIT_COUNT);
count.value = count.max;

function drawPreview() {
  if (!context) return;

  const isOriginal = mode === "original";
  const isVertical = mode === "vertical";
  const pieces = isOriginal ? 1 : count.valueAsNumber;
  const imageWidth = photo.naturalWidth;
  const imageHeight = photo.naturalHeight;
  const gap = isOriginal ? 0 : 10;
  const offset = isOriginal ? 0 : 72;
  const totalGap = (pieces - 1) * gap;
  const paddingX = isVertical ? offset : totalGap;
  const paddingY = isVertical ? totalGap : offset;
  const scale = Math.min(
    (canvas.width - paddingX) / imageWidth,
    (canvas.height - paddingY) / imageHeight,
  );
  const left = (canvas.width - imageWidth * scale - paddingX) / 2;
  const top = (canvas.height - imageHeight * scale - paddingY) / 2;
  const regions = calculateCellRegions(
    {
      layout: isVertical ? "VERTICAL_1xN" : "HORIZONTAL_Nx1",
      rows: pieces,
      cols: pieces,
      gap: 0,
    },
    imageWidth,
    imageHeight,
  );

  context.clearRect(0, 0, canvas.width, canvas.height);
  regions.forEach(({ x, y, width, height }, index) => {
    const stagger = (index * offset) / Math.max(pieces - 1, 1);
    context.drawImage(
      photo,
      x,
      y,
      width,
      height,
      left + x * scale + (isVertical ? stagger : index * gap),
      top + y * scale + (isVertical ? index * gap : offset - stagger),
      width * scale,
      height * scale,
    );
  });

  count.disabled = isOriginal;
  const description = isOriginal
    ? "海岸示例原图"
    : `海岸示例图${isVertical ? "纵向" : "横向"}切分为 ${pieces} 张`;
  canvas.setAttribute("aria-label", description);
  countLabel.value = isOriginal ? "原图" : `${pieces} 张`;
  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
  });

  ruler.style.gridTemplateColumns = `repeat(${pieces}, 1fr)`;
  ruler.replaceChildren(
    ...(isOriginal ? [] : regions).map((_, index) => {
      const tick = document.createElement("span");
      tick.textContent = String(index + 1).padStart(2, "0");
      return tick;
    }),
  );
}

photo.decode().then(
  () => {
    if (!context) return;
    drawPreview();
    photo.hidden = true;
    canvas.hidden = false;
    controls.disabled = false;
    count.addEventListener("input", drawPreview);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.mode as Mode;
        drawPreview();
      });
    });
  },
  () => {},
);
