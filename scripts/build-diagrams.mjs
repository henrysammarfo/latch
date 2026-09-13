#!/usr/bin/env node
/**
 * Build committed .excalidraw scenes for Latch diagrams.
 * Browser conversion from Mermaid also lives on /diagrams (uses
 * @excalidraw/mermaid-to-excalidraw client-side).
 */
import { cpSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "docs/diagrams");
const publicDir = join(process.cwd(), "public/diagrams");
mkdirSync(outDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

function id(prefix, n) {
  return `${prefix}${n}`;
}

function rect(n, x, y, w, h, label, accent = false) {
  return {
    type: "rectangle",
    version: 1,
    versionNonce: n * 17,
    isDeleted: false,
    id: id("r", n),
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    angle: 0,
    x,
    y,
    strokeColor: accent ? "#7CFFB2" : "#9AA7B8",
    backgroundColor: accent ? "#1B3A28" : "#14301F",
    width: w,
    height: h,
    seed: n * 91,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    boundElements: [{ id: id("t", n), type: "text" }],
    updated: 1,
    link: null,
    locked: false,
  };
}

function label(n, x, y, w, h, text) {
  return {
    type: "text",
    version: 1,
    versionNonce: n * 19,
    isDeleted: false,
    id: id("t", n),
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    x: x + 10,
    y: y + h / 2 - 16,
    strokeColor: "#F4F7FA",
    backgroundColor: "transparent",
    width: w - 20,
    height: 40,
    seed: n * 93,
    groupIds: [],
    frameId: null,
    roundness: null,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
    fontSize: 18,
    fontFamily: 1,
    text,
    textAlign: "center",
    verticalAlign: "middle",
    containerId: id("r", n),
    originalText: text,
    lineHeight: 1.25,
    baseline: 18,
  };
}

function arrow(n, x1, y1, x2, y2, fromId, toId) {
  return {
    type: "arrow",
    version: 1,
    versionNonce: n * 23,
    isDeleted: false,
    id: id("a", n),
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    angle: 0,
    x: x1,
    y: y1,
    strokeColor: "#7CFFB2",
    backgroundColor: "transparent",
    width: x2 - x1,
    height: y2 - y1,
    seed: n * 97,
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    startBinding: fromId ? { elementId: fromId, focus: 0, gap: 4 } : null,
    endBinding: toId ? { elementId: toId, focus: 0, gap: 4 } : null,
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: "arrow",
    points: [
      [0, 0],
      [x2 - x1, y2 - y1],
    ],
  };
}

function scene(elements, name) {
  return {
    type: "excalidraw",
    version: 2,
    source: "https://latch.tryopal.asia/diagrams",
    elements,
    appState: {
      viewBackgroundColor: "#07140F",
      gridSize: null,
      name,
    },
    files: {},
  };
}

// Save-play pipeline
{
  const boxes = [
    [1, 40, 120, 160, 80, "Trigger", false],
    [2, 260, 120, 160, 80, "RiskCompile", false],
    [3, 480, 120, 160, 80, "Policy", false],
    [4, 700, 120, 160, 80, "SavePlay", true],
    [5, 920, 120, 160, 80, "Assert / Board", false],
  ];
  const elements = [];
  for (const [n, x, y, w, h, text, accent] of boxes) {
    elements.push(rect(n, x, y, w, h, text, accent), label(n, x, y, w, h, text));
  }
  elements.push(
    arrow(10, 200, 160, 260, 160, "r1", "r2"),
    arrow(11, 420, 160, 480, 160, "r2", "r3"),
    arrow(12, 640, 160, 700, 160, "r3", "r4"),
    arrow(13, 860, 160, 920, 160, "r4", "r5"),
  );
  // title
  elements.push({
    type: "text",
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    id: "title-save",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    x: 40,
    y: 40,
    strokeColor: "#7CFFB2",
    backgroundColor: "transparent",
    width: 600,
    height: 40,
    seed: 1,
    groupIds: [],
    frameId: null,
    roundness: null,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
    fontSize: 28,
    fontFamily: 1,
    text: "LATCH · Save play pipeline",
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    originalText: "LATCH · Save play pipeline",
    lineHeight: 1.25,
    baseline: 28,
  });
  writeFileSync(join(outDir, "save-play.excalidraw"), JSON.stringify(scene(elements, "save-play"), null, 2));
}

// Multi-tenant
{
  const boxes = [
    [1, 80, 100, 200, 90, "User auth\n(email+password)", false],
    [2, 360, 100, 200, 90, "Workspace", true],
    [3, 640, 60, 180, 70, "Agents", false],
    [4, 640, 150, 180, 70, "Connections", false],
    [5, 900, 100, 200, 90, "SavePlay +\nEvals", false],
  ];
  const elements = [];
  for (const [n, x, y, w, h, text, accent] of boxes) {
    elements.push(rect(n, x, y, w, h, text, accent), label(n, x, y, w, h, text));
  }
  elements.push(
    arrow(20, 280, 145, 360, 145, "r1", "r2"),
    arrow(21, 560, 120, 640, 95, "r2", "r3"),
    arrow(22, 560, 160, 640, 185, "r2", "r4"),
    arrow(23, 820, 145, 900, 145, "r3", "r5"),
  );
  elements.push({
    type: "text",
    version: 1,
    versionNonce: 2,
    isDeleted: false,
    id: "title-tenant",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    x: 80,
    y: 30,
    strokeColor: "#7CFFB2",
    backgroundColor: "transparent",
    width: 700,
    height: 40,
    seed: 2,
    groupIds: [],
    frameId: null,
    roundness: null,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
    fontSize: 28,
    fontFamily: 1,
    text: "LATCH · Multi-tenant workspace",
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    originalText: "LATCH · Multi-tenant workspace",
    lineHeight: 1.25,
    baseline: 28,
  });
  writeFileSync(join(outDir, "multi-tenant.excalidraw"), JSON.stringify(scene(elements, "multi-tenant"), null, 2));
}

// Embed mermaid sources into a catalog JSON for the /diagrams page
const catalog = [
  {
    id: "save-play",
    title: "Save play pipeline",
    description: "Trigger → compile → policy → saga → assert. Missing IDs go UNLATCHED.",
    mermaid: readFileSync(join(outDir, "save-play.mmd"), "utf8"),
    excalidraw: "save-play.excalidraw",
  },
  {
    id: "multi-tenant",
    title: "Multi-tenant workspace",
    description: "Email signup creates a workspace. Agents and connections belong to it.",
    mermaid: readFileSync(join(outDir, "multi-tenant.mmd"), "utf8"),
    excalidraw: "multi-tenant.excalidraw",
  },
  {
    id: "saga-sequence",
    title: "Saga sequence",
    description: "Slack → Sheets → Calendar → Gmail draft, then asserts.",
    mermaid: readFileSync(join(outDir, "saga-sequence.mmd"), "utf8"),
    excalidraw: "saga-sequence.excalidraw",
  },
];

// Saga sequence as vertical boxes
{
  const steps = [
    "Trigger",
    "Policy",
    "Slack message_ts",
    "Sheets range",
    "Calendar eventId",
    "Gmail draftId",
    "Assert → LATCHED",
  ];
  const elements = [];
  steps.forEach((text, i) => {
    const n = i + 1;
    const y = 80 + i * 90;
    elements.push(rect(n, 220, y, 320, 70, text, i === steps.length - 1), label(n, 220, y, 320, 70, text));
    if (i > 0) elements.push(arrow(100 + i, 380, y - 20, 380, y, id("r", n - 1), id("r", n)));
  });
  elements.push({
    type: "text",
    version: 1,
    versionNonce: 3,
    isDeleted: false,
    id: "title-saga",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    x: 220,
    y: 24,
    strokeColor: "#7CFFB2",
    backgroundColor: "transparent",
    width: 500,
    height: 40,
    seed: 3,
    groupIds: [],
    frameId: null,
    roundness: null,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
    fontSize: 28,
    fontFamily: 1,
    text: "LATCH · Saga sequence",
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    originalText: "LATCH · Saga sequence",
    lineHeight: 1.25,
    baseline: 28,
  });
  writeFileSync(join(outDir, "saga-sequence.excalidraw"), JSON.stringify(scene(elements, "saga-sequence"), null, 2));
}

writeFileSync(join(outDir, "catalog.json"), JSON.stringify(catalog, null, 2));

// Mirror docs → public so /diagrams can fetch without a server transform.
for (const name of [
  "catalog.json",
  "save-play.excalidraw",
  "multi-tenant.excalidraw",
  "saga-sequence.excalidraw",
  "save-play.mmd",
  "multi-tenant.mmd",
  "saga-sequence.mmd",
]) {
  cpSync(join(outDir, name), join(publicDir, name));
}

console.log("Wrote Excalidraw scenes + catalog →", outDir, "+ mirrored to", publicDir);
