import { useState, useEffect } from "preact/hooks";
import { LayoutType, SplitConfig } from "../../core/types";

interface SplitterControlProps {
  onConfigChange: (config: SplitConfig) => void;
  onSplit: () => void;
  isProcessing: boolean;
}

export function SplitterControl({
  onConfigChange,
  onSplit,
  isProcessing,
}: SplitterControlProps) {
  const [layout, setLayout] = useState<LayoutType>("GRID_2x2");
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [gap, setGap] = useState(0);

  useEffect(() => {
    onConfigChange({ layout, rows, cols, gap });
  }, [layout, rows, cols, gap]);

  return (
    <div class="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700">Split Layout</label>
        <select
          value={layout}
          onChange={(e) => setLayout(e.currentTarget.value as LayoutType)}
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
        >
          <option value="GRID_2x2">Grid 2x2 (Fixed)</option>
          <option value="T_SHAPE_3">T-Shape (3 Images)</option>
          <option value="VERTICAL_1xN">Vertical Split (1xN)</option>
          <option value="HORIZONTAL_Nx1">Horizontal Split (Nx1)</option>
        </select>
      </div>

      {(layout === "VERTICAL_1xN" || layout === "HORIZONTAL_Nx1") && (
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">
            {layout === "VERTICAL_1xN"
              ? "Number of Rows (N)"
              : "Number of Columns (N)"}
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={layout === "VERTICAL_1xN" ? rows : cols}
            onInput={(e) => {
              const val = parseInt(e.currentTarget.value) || 2;
              if (layout === "VERTICAL_1xN") setRows(val);
              else setCols(val);
            }}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
          />
        </div>
      )}

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700">
          Gap Removal (px)
        </label>
        <input
          type="number"
          min="0"
          value={gap}
          onInput={(e) => setGap(parseInt(e.currentTarget.value) || 0)}
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
        />
        <span class="text-xs text-gray-500">
          Pixels to remove between images
        </span>
      </div>

      <button
        onClick={onSplit}
        disabled={isProcessing}
        class="mt-2 w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isProcessing ? "Splitting..." : "Split Image"}
      </button>
    </div>
  );
}
