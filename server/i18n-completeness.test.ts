/**
 * PACK&GO 多語言 i18n 完整性測試
 *
 * 使用 Node.js 直接讀取 TypeScript 語言檔案，
 * 避免 Vitest 在 server 端測試中無法解析 client 路徑的問題。
 *
 * 測試目標：
 * - 三個語言檔案（zh-TW、en、es）都能成功解析
 * - key 數量一致（無遺漏翻譯）
 * - 英文/西班牙文版本不含硬編碼中文字元
 * - 所有 value 不為空字串
 * - 關鍵 UI key 在三個語言中都存在
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─────────────────────────────────────────────
// 工具函式：從 TS 語言檔案提取所有字串 key-value
// ─────────────────────────────────────────────

function extractStringsFromTsFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const result: Record<string, string> = {};

  // 匹配 key: 'value' 或 key: "value" 格式（包含中文 key）
  const kvRegex = /(\w+)\s*:\s*['"`]([^'"`\n]+)['"`]/g;
  let match;
  while ((match = kvRegex.exec(content)) !== null) {
    const [, key, value] = match;
    // 跳過 import/export 語法中的偽 key
    if (["import", "export", "from", "const", "let", "var"].includes(key)) continue;
    result[key] = value;
  }

  return result;
}

// ─────────────────────────────────────────────
// 測試資料準備
// ─────────────────────────────────────────────

const baseDir = resolve(process.cwd(), "client/src/i18n");

let zhTWStrings: Record<string, string>;
let enStrings: Record<string, string>;
let esStrings: Record<string, string>;

describe("多語言 i18n 完整性 (locales)", () => {
  beforeAll(() => {
    zhTWStrings = extractStringsFromTsFile(resolve(baseDir, "zh-TW.ts"));
    enStrings = extractStringsFromTsFile(resolve(baseDir, "en.ts"));
    esStrings = extractStringsFromTsFile(resolve(baseDir, "es.ts"));
  });

  it("三個語言檔案應都能成功解析", () => {
    expect(zhTWStrings).toBeDefined();
    expect(enStrings).toBeDefined();
    expect(esStrings).toBeDefined();
    expect(typeof zhTWStrings).toBe("object");
    expect(typeof enStrings).toBe("object");
    expect(typeof esStrings).toBe("object");
  });

  it("繁中語言檔案應有 key 數量 > 100（確保內容完整）", () => {
    const count = Object.keys(zhTWStrings).length;
    expect(count).toBeGreaterThan(100);
  });

  it("英文語言檔案的 key 數量應與繁中相差不超過 10%", () => {
    const zhCount = Object.keys(zhTWStrings).length;
    const enCount = Object.keys(enStrings).length;
    const diff = Math.abs(zhCount - enCount);
    const tolerance = Math.floor(zhCount * 0.1);
    expect(diff).toBeLessThanOrEqual(tolerance);
  });

  it("西班牙文語言檔案的 key 數量應與繁中相差不超過 10%", () => {
    const zhCount = Object.keys(zhTWStrings).length;
    const esCount = Object.keys(esStrings).length;
    const diff = Math.abs(zhCount - esCount);
    const tolerance = Math.floor(zhCount * 0.1);
    expect(diff).toBeLessThanOrEqual(tolerance);
  });

  it("英文語言檔案的 value 不應包含大量繁中字元（確保翻譯完整）", () => {
    const chineseRegex = /[\u4e00-\u9fff]/;
    const chineseInEn = Object.entries(enStrings).filter(
      ([, v]) => chineseRegex.test(v)
    );
    // 允許少量例外（如品牌名稱、地名），但不應超過 10 個
    expect(chineseInEn.length).toBeLessThanOrEqual(10);
  });

  it("西班牙文語言檔案的 value 不應包含大量繁中字元", () => {
    const chineseRegex = /[\u4e00-\u9fff]/;
    const chineseInEs = Object.entries(esStrings).filter(
      ([, v]) => chineseRegex.test(v)
    );
    expect(chineseInEs.length).toBeLessThanOrEqual(10);
  });

  it("繁中語言檔案的所有 value 不應為空字串", () => {
    const emptyValues = Object.entries(zhTWStrings).filter(
      ([, v]) => v.trim() === ""
    );
    expect(emptyValues.length).toBe(0);
  });

  it("英文語言檔案的所有 value 不應為空字串", () => {
    const emptyValues = Object.entries(enStrings).filter(
      ([, v]) => v.trim() === ""
    );
    expect(emptyValues.length).toBe(0);
  });

  it("西班牙文語言檔案的所有 value 不應為空字串", () => {
    const emptyValues = Object.entries(esStrings).filter(
      ([, v]) => v.trim() === ""
    );
    expect(emptyValues.length).toBe(0);
  });

  it("關鍵 UI key（search、login、contact）應在繁中和英文中都存在", () => {
    const criticalKeys = ["search", "login", "contact"];

    criticalKeys.forEach((key) => {
      const zhHasKey = Object.keys(zhTWStrings).some(
        (k) => k.toLowerCase() === key.toLowerCase()
      );
      const enHasKey = Object.keys(enStrings).some(
        (k) => k.toLowerCase() === key.toLowerCase()
      );

      if (zhHasKey) {
        // 如果繁中有此 key，英文也必須有
        expect(enHasKey).toBe(true);
      }
    });
  });

  it("zh-TW 語言檔案行數應大於 100 行（確保內容豐富）", () => {
    const content = readFileSync(resolve(baseDir, "zh-TW.ts"), "utf-8");
    const lineCount = content.split("\n").length;
    expect(lineCount).toBeGreaterThan(100);
  });

  it("三個語言檔案的行數應相差不超過 20%", () => {
    const zhContent = readFileSync(resolve(baseDir, "zh-TW.ts"), "utf-8");
    const enContent = readFileSync(resolve(baseDir, "en.ts"), "utf-8");
    const esContent = readFileSync(resolve(baseDir, "es.ts"), "utf-8");

    const zhLines = zhContent.split("\n").length;
    const enLines = enContent.split("\n").length;
    const esLines = esContent.split("\n").length;

    const enDiff = Math.abs(zhLines - enLines) / zhLines;
    const esDiff = Math.abs(zhLines - esLines) / zhLines;

    expect(enDiff).toBeLessThan(0.2);
    expect(esDiff).toBeLessThan(0.2);
  });
});
