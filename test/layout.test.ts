import { describe, it, expect } from "vitest";
import { recommendLayout, type ImageSize } from "../src/core/layout";
import {
  calculateCellRegions,
  calculateEffectiveArea,
} from "../src/core/splitLayout";
import type { SplitConfig } from "../src/core/types";

const size = (width: number, height: number): ImageSize => ({ width, height });

// ---------------------------------------------------------------------------

describe("recommendLayout", () => {
  it("4 张图固定为 2x2 网格", () => {
    expect(recommendLayout([size(1, 1), size(1, 1), size(1, 1), size(1, 1)])).toBe(
      "GRID_2x2",
    );
    // 与图片比例无关
    expect(recommendLayout([size(9, 1), size(1, 9), size(1, 1), size(2, 3)])).toBe(
      "GRID_2x2",
    );
  });

  describe("3 张图", () => {
    it("首图明显偏窄高（r<0.9）→ T 型布局", () => {
      expect(recommendLayout([size(100, 200), size(1, 1), size(1, 1)])).toBe(
        "T_SHAPE_3",
      );
    });

    it("首图比例 ≥0.9 → 横向排列", () => {
      expect(recommendLayout([size(100, 100), size(1, 1), size(1, 1)])).toBe(
        "HORIZONTAL_Nx1",
      );
      expect(recommendLayout([size(200, 100), size(1, 1), size(1, 1)])).toBe(
        "HORIZONTAL_Nx1",
      );
    });

    it("边界：r1 恰为 0.9 时不算偏窄（严格小于）", () => {
      expect(recommendLayout([size(900, 1000), size(1, 1), size(1, 1)])).toBe(
        "HORIZONTAL_Nx1",
      );
    });
  });

  describe("2 张图", () => {
    it("平均比例 <0.8 → 横向（拼成宽图）", () => {
      expect(recommendLayout([size(100, 200), size(100, 200)])).toBe(
        "HORIZONTAL_2x1",
      );
    });

    it("平均比例 >1.2 → 纵向（拼成高图）", () => {
      expect(recommendLayout([size(300, 100), size(300, 100)])).toBe(
        "VERTICAL_1x2",
      );
    });

    it("平均比例居中 → 默认横向", () => {
      expect(recommendLayout([size(100, 100), size(100, 100)])).toBe(
        "HORIZONTAL_2x1",
      );
    });

    it("边界：平均比例恰为 0.8 / 1.2 时均落到横向", () => {
      expect(recommendLayout([size(80, 100), size(80, 100)])).toBe(
        "HORIZONTAL_2x1",
      );
      expect(recommendLayout([size(120, 100), size(120, 100)])).toBe(
        "HORIZONTAL_2x1",
      );
    });

    it("混合比例按平均值判定", () => {
      // (2 + 0.5) / 2 = 1.25 > 1.2 → 纵向
      expect(recommendLayout([size(200, 100), size(50, 100)])).toBe(
        "VERTICAL_1x2",
      );
    });
  });

  it("0 / 1 / 5 张图回落到横向排列", () => {
    expect(recommendLayout([])).toBe("HORIZONTAL_Nx1");
    expect(recommendLayout([size(100, 100)])).toBe("HORIZONTAL_Nx1");
    expect(
      recommendLayout([size(1, 1), size(1, 1), size(1, 1), size(1, 1), size(1, 1)]),
    ).toBe("HORIZONTAL_Nx1");
  });
});

// ---------------------------------------------------------------------------

describe("calculateCellRegions", () => {
  const base: SplitConfig = { layout: "HORIZONTAL_Nx1", rows: 2, cols: 3, gap: 0 };

  /** 断言所有格子都落在有效区域内 */
  function expectWithinBounds(
    regions: ReturnType<typeof calculateCellRegions>,
    w: number,
    h: number,
  ) {
    for (const r of regions) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(w);
      expect(r.y + r.height).toBeLessThanOrEqual(h);
    }
  }

  it("HORIZONTAL_Nx1：按 cols 等分，间距为 gap", () => {
    const W = 1000;
    const H = 500;
    const regions = calculateCellRegions(
      { ...base, layout: "HORIZONTAL_Nx1", cols: 3, gap: 10 },
      W,
      H,
    );
    expect(regions).toHaveLength(3);

    const segW = Math.floor((W - 2 * 10) / 3); // 326
    regions.forEach((r, i) => {
      expect(r.width).toBe(segW);
      expect(r.height).toBe(H);
      expect(r.x).toBe(i * (segW + 10));
      expect(r.y).toBe(0);
    });
    expectWithinBounds(regions, W, H);
  });

  it("HORIZONTAL_2x1：无论 cols 取值都固定切 2 格", () => {
    const regions = calculateCellRegions(
      { ...base, layout: "HORIZONTAL_2x1", cols: 5, gap: 0 },
      800,
      400,
    );
    expect(regions).toHaveLength(2);
    expect(regions[0].width).toBe(400);
    expect(regions[1].x).toBe(400);
  });

  it("VERTICAL_1xN：按 rows 等分", () => {
    const W = 400;
    const H = 1000;
    const regions = calculateCellRegions(
      { ...base, layout: "VERTICAL_1xN", rows: 4, gap: 20 },
      W,
      H,
    );
    expect(regions).toHaveLength(4);
    const segH = Math.floor((H - 3 * 20) / 4); // 235
    regions.forEach((r, i) => {
      expect(r.height).toBe(segH);
      expect(r.width).toBe(W);
      expect(r.y).toBe(i * (segH + 20));
      expect(r.x).toBe(0);
    });
    expectWithinBounds(regions, W, H);
  });

  it("VERTICAL_1x2：固定切 2 格", () => {
    const regions = calculateCellRegions(
      { ...base, layout: "VERTICAL_1x2", rows: 9, gap: 0 },
      300,
      600,
    );
    expect(regions).toHaveLength(2);
    expect(regions[0].height).toBe(300);
    expect(regions[1].y).toBe(300);
  });

  it("GRID_2x2：四格按 左上/右上/左下/右下 顺序返回", () => {
    const W = 1000;
    const H = 800;
    const gap = 10;
    const regions = calculateCellRegions(
      { ...base, layout: "GRID_2x2", gap },
      W,
      H,
    );
    expect(regions).toHaveLength(4);

    const segW = Math.floor((W - gap) / 2); // 495
    const segH = Math.floor((H - gap) / 2); // 395
    expect(regions[0]).toEqual({ x: 0, y: 0, width: segW, height: segH });
    expect(regions[1]).toEqual({
      x: segW + gap,
      y: 0,
      width: segW,
      height: segH,
    });
    expect(regions[2]).toEqual({
      x: 0,
      y: segH + gap,
      width: segW,
      height: segH,
    });
    expect(regions[3]).toEqual({
      x: segW + gap,
      y: segH + gap,
      width: segW,
      height: segH,
    });
    expectWithinBounds(regions, W, H);
  });

  it("T_SHAPE_3：左侧全高，右侧上下两格", () => {
    const W = 1000;
    const H = 600;
    const gap = 20;
    const regions = calculateCellRegions(
      { ...base, layout: "T_SHAPE_3", gap },
      W,
      H,
    );
    expect(regions).toHaveLength(3);

    const halfW = Math.floor((W - gap) / 2); // 490
    const halfH = Math.floor((H - gap) / 2); // 290

    // 左侧：全高
    expect(regions[0]).toEqual({ x: 0, y: 0, width: halfW, height: H });
    // 右上
    expect(regions[1]).toEqual({
      x: halfW + gap,
      y: 0,
      width: halfW,
      height: halfH,
    });
    // 右下
    expect(regions[2]).toEqual({
      x: halfW + gap,
      y: halfH + gap,
      width: halfW,
      height: halfH,
    });
    expectWithinBounds(regions, W, H);
  });

  it("未知 layout 回退为整张图单格", () => {
    const regions = calculateCellRegions(
      { ...base, layout: "SOMETHING_ELSE" as SplitConfig["layout"] },
      640,
      480,
    );
    expect(regions).toEqual([
      { x: 0, y: 0, width: 640, height: 480 },
    ]);
  });

  it("gap=0 时各格无缝铺满", () => {
    const W = 900;
    const H = 300;
    const regions = calculateCellRegions(
      { ...base, layout: "HORIZONTAL_Nx1", cols: 3, gap: 0 },
      W,
      H,
    );
    expect(regions.map((r) => r.width)).toEqual([300, 300, 300]);
    expect(regions[2].x + regions[2].width).toBe(W);
  });

  it("取整导致的余量不超过 gap 级别（不溢出）", () => {
    // 尺寸刻意选为「不能整除」，这样若把 floor 改成 ceil 就会越界而被本用例捕获。
    // 反例：1001/999 + gap 7 在横向恰好整除，floor 与 ceil 结果相同，无法发现该错误。
    const W = 1000;
    const H = 997;
    const gap = 7;
    for (const layout of [
      "HORIZONTAL_Nx1",
      "VERTICAL_1xN",
      "GRID_2x2",
      "T_SHAPE_3",
    ] as const) {
      const regions = calculateCellRegions(
        { layout, rows: 3, cols: 3, gap },
        W,
        H,
      );
      expectWithinBounds(regions, W, H);
    }
  });
});

// ---------------------------------------------------------------------------

describe("calculateEffectiveArea", () => {
  it("未指定 autoCropRatio 时返回原尺寸（恒等）", () => {
    expect(calculateEffectiveArea(800, 600)).toEqual({
      drawX: 0,
      drawY: 0,
      drawW: 800,
      drawH: 600,
    });
  });

  it("autoCropRatio 为 0 / undefined 时视为不裁切", () => {
    expect(calculateEffectiveArea(800, 600, 0)).toEqual({
      drawX: 0,
      drawY: 0,
      drawW: 800,
      drawH: 600,
    });
  });

  it("原图比目标更宽 → 裁宽度并水平居中", () => {
    // 800x400 (2.0) → 目标 1.0：drawW = 400*1 = 400, drawX = 200
    const r = calculateEffectiveArea(800, 400, 1);
    expect(r.drawW).toBe(400);
    expect(r.drawX).toBe(200);
    expect(r.drawH).toBe(400);
    expect(r.drawY).toBe(0);
    // 居中：左右留白相等
    expect(r.drawX).toBe(800 - (r.drawX + r.drawW));
  });

  it("原图比目标更高 → 裁高度并垂直居中", () => {
    // 400x800 (0.5) → 目标 1.0：drawH = 400/1 = 400, drawY = 200
    const r = calculateEffectiveArea(400, 800, 1);
    expect(r.drawH).toBe(400);
    expect(r.drawY).toBe(200);
    expect(r.drawW).toBe(400);
    expect(r.drawX).toBe(0);
    expect(r.drawY).toBe(800 - (r.drawY + r.drawH));
  });

  it("比例恰好相等时不做任何裁切", () => {
    const r = calculateEffectiveArea(1600, 900, 16 / 9);
    expect(r.drawX).toBe(0);
    expect(r.drawY).toBe(0);
    expect(r.drawW).toBe(1600);
    expect(r.drawH).toBe(900);
  });

  it("裁切结果的比例等于 autoCropRatio", () => {
    for (const ratio of [0.5, 0.8, 1, 1.5, 16 / 9, 3]) {
      for (const [w, h] of [
        [800, 600],
        [600, 800],
        [1920, 1080],
        [500, 500],
      ]) {
        const r = calculateEffectiveArea(w, h, ratio);
        expect(r.drawW / r.drawH).toBeCloseTo(ratio, 10);
      }
    }
  });

  it("裁切区域始终落在原图范围内", () => {
    for (const ratio of [0.3, 1, 4]) {
      for (const [w, h] of [
        [800, 600],
        [600, 800],
      ]) {
        const r = calculateEffectiveArea(w, h, ratio);
        expect(r.drawX).toBeGreaterThanOrEqual(0);
        expect(r.drawY).toBeGreaterThanOrEqual(0);
        expect(r.drawX + r.drawW).toBeLessThanOrEqual(w);
        expect(r.drawY + r.drawH).toBeLessThanOrEqual(h);
      }
    }
  });
});
