# X-Puzzle Stitcher Design Language

This document defines the official design standards for the X-Puzzle Stitcher project. It serves as the source of truth for validating all UI elements.

**Core Philosophy:**
The interface combines the structural clarity of **Bento Grid** layouts with the refined materiality of **Apple Glassmorphism** (macOS/visionOS).

---

## 1. Materials (材质 System)

The UI is built on a hierarchy of translucent materials, simulating glass of varying thickness and opacity.

### Base Materials

- **Glass Panel (Main Container)**
  - Use for: Sidebar, Main Toolbar, Floating Panels.
  - Token: `var(--color-glass-bg)`
  - Effect: `backdrop-filter: blur(40px) saturate(200%)`
  - Border: 1px inside translucent border `var(--color-glass-border)`
  - Shadow: Soft, diffuse shadow `0 20px 40px rgba(0,0,0,0.2)`

- **Surface (Card/Item)**
  - Use for: Grid items, Input fields, List rows.
  - Token: `var(--color-surface)`
  - Effect: `backdrop-filter: blur(20px)`
  - Hover: Slight increase in brightness `brightness(1.15)`

## 2. Layout (Bento Grid)

- **Grid Gap**: Uniform spacing (typically `12px` or `16px`).
- **Corner Radius**:
  - Consistent "Squircle" curvature.
  - **Outer Containers**: `20px` or `24px`.
  - **Inner Items**: `12px` or `16px`.
  - Rule: `Outer Radius = Inner Radius + Padding` (Visual Balance).
- **Hierarchy**:
  - Elements fill their structural containers fully.
  - Visual weight is managed by size, not by varying opacity.

## 3. Typography

- **Font Family**:
  - Primary: System San Francisco (`-apple-system`, `BlinkMacSystemFont`, etc.) or `Inter`.
  - Monospace (Data/Code): `Fira Code` or `SF Mono`.
- **Weights**:
  - Headers: **600 (Semi-Bold)**
  - Body: **400 (Regular)**
  - Micro-labels: **500 (Medium)**
- **Colors**:
  - Primary Text: `#FFFFFF` (Dark Mode), `#1D1D1F` (Light Mode).
  - Secondary Text: `rgba(255,255,255, 0.55)` (Dark), `rgba(0,0,0, 0.5)` (Light).

## 4. Interactive Elements

### Buttons

- **Primary Action (Call to Action)**
  - Background: `var(--color-primary)` (Apple Blue: `#007AFF`).
  - Text: White, Medium weight.
  - Hover: No color shift, lift up `transform: translateY(-1px)`.
- **Secondary / Ghost**
  - Background: `rgba(255,255,255, 0.1)`.
  - Text: Primary Text color.
  - Border: None (rely on background contrast).

### Inputs & Controls

- **Sliders**:
  - Track: Thin, neutral gray.
  - Thumb: White circle with subtle shadow.
- **Toggles**:
  - Apple-style pill shape.
  - Smooth animation (`bezier(0.2, 0, 0, 1)`).

## 5. Validation Checklist

When reviewing any UI element, ask:

1.  [ ] **Materiality**: Does it look like glass? Is the background blurred?
2.  [ ] **Depth**: Is there a subtle 1px border to define the edge?
3.  [ ] **Spacing**: Is it part of the strict grid? Are margins even?
4.  [ ] **Corners**: Are the corners rounded and consistent? (No sharp 90° corners unless intentional).
5.  [ ] **Motion**: Do interactions have instant feedback (hover, click)?
