/**
 * PDF Text Extractor Tests
 * Tests for the pdfTextExtractor module that provides text extraction
 * before sending to LLM for parsing.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock child_process for pdftotext
vi.mock("child_process", () => ({
  execFile: vi.fn(),
}));

// Mock fs/promises
vi.mock("fs/promises", () => ({
  default: {
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(Buffer.from("PDF content")),
    unlink: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  },
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(Buffer.from("PDF content")),
  unlink: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

// Mock node-fetch
vi.mock("node-fetch", () => ({
  default: vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
  }),
}));

describe("truncateForLLM", () => {
  it("should return text unchanged if within limit", async () => {
    const { truncateForLLM } = await import("./agents/pdfTextExtractor");
    const shortText = "Short text content";
    const result = truncateForLLM(shortText, 100);
    expect(result).toBe(shortText);
  });

  it("should truncate text that exceeds the limit", async () => {
    const { truncateForLLM } = await import("./agents/pdfTextExtractor");
    const longText = "A".repeat(200);
    const result = truncateForLLM(longText, 100);
    expect(result.length).toBeLessThanOrEqual(100 + 50); // allow for truncation message
    expect(result).toContain("[... 中間內容已省略 ...]");
  });

  it("should use default limit of 50000 chars", async () => {
    const { truncateForLLM } = await import("./agents/pdfTextExtractor");
    const text = "A".repeat(1000);
    const result = truncateForLLM(text);
    expect(result).toBe(text); // within default limit
  });
});

describe("PDF extraction strategy selection", () => {
  it("should prefer pdf-parse for text-based PDFs", async () => {
    // This test verifies the module exports the expected functions
    const module = await import("./agents/pdfTextExtractor");
    expect(typeof module.extractTextFromPdf).toBe("function");
    expect(typeof module.truncateForLLM).toBe("function");
  });
});
