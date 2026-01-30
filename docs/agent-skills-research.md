# Anthropic Agent Skills 架構研究筆記

**來源**: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
**日期**: 2025 年 10 月 16 日

---

## 核心概念

**Agent Skills** 是一種將專業知識打包成可組合資源的方式，將通用 Agent 轉變為專業化 Agent。

> "Skills extend Claude's capabilities by packaging your expertise into composable resources for Claude, transforming general-purpose agents into specialized agents that fit your needs."

---

## 架構設計原則

### 1. Progressive Disclosure（漸進式揭露）

Skills 採用三層漸進式揭露架構：

| 層級 | 內容 | 載入時機 |
|------|------|---------|
| **第一層** | `name` + `description` (YAML frontmatter) | Agent 啟動時預載入 System Prompt |
| **第二層** | `SKILL.md` 完整內容 | 當 Claude 判斷該 Skill 與當前任務相關時 |
| **第三層** | 額外參考檔案 (reference.md, forms.md 等) | 當需要更詳細的上下文時 |

### 2. Skill 目錄結構

```
skill-name/
├── SKILL.md          # 必須：核心指令和元數據
├── reference.md      # 可選：詳細參考資料
├── forms.md          # 可選：特定場景指令
└── scripts/          # 可選：可執行腳本
    └── extract.py
```

### 3. SKILL.md 格式

```yaml
---
name: pdf-skill
description: Enables Claude to manipulate PDF files, including form filling
---

# PDF Skill

## Overview
...

## When to use this skill
...

## Additional resources
- See `reference.md` for detailed API documentation
- See `forms.md` for form-filling instructions
```

---

## 最佳實踐

### 開發 Skills 的指南

1. **Start with evaluation（從評估開始）**
   - 識別 Agent 能力的具體缺口
   - 在代表性任務上運行並觀察 Agent 的困難點
   - 逐步建立 Skills 來解決這些問題

2. **Structure for scale（為擴展而結構化）**
   - 當 SKILL.md 變得過於龐大時，拆分成多個檔案
   - 互斥或很少一起使用的上下文應保持分離
   - 程式碼可以作為可執行工具和文檔

3. **Think from Claude's perspective（從 Claude 的角度思考）**
   - 監控 Claude 在實際場景中如何使用 Skill
   - 特別注意 `name` 和 `description` 的設計
   - Claude 會根據這些來決定是否觸發 Skill

4. **Iterate with Claude（與 Claude 迭代）**
   - 讓 Claude 將成功的方法捕捉到 Skill 中
   - 如果出錯，讓 Claude 自我反思
   - 這樣可以發現 Claude 實際需要什麼上下文

---

## 與 MCP 的關係

> "We'll also explore how Skills can complement Model Context Protocol (MCP) servers by teaching agents more complex workflows that involve external tools and software."

Skills 和 MCP 是互補的：
- **MCP**: 提供外部工具和軟體的連接
- **Skills**: 教導 Agent 如何使用這些工具的複雜工作流程

---

## 未來展望

> "Looking further ahead, we hope to enable agents to create, edit, and evaluate Skills on their own, letting them codify their own patterns of behavior into reusable capabilities."

Agent 將能夠自己創建、編輯和評估 Skills，將自己的行為模式編碼為可重用的能力。

---

## 對 PACK&GO 系統的啟示

### 現有架構問題

目前的 Agent 架構存在以下問題：

1. **過度細分**：16+ 個獨立 Agent，許多功能重疊
2. **缺乏 Progressive Disclosure**：所有 Agent 的完整邏輯都在程式碼中
3. **不符合 Skills 架構**：沒有 SKILL.md 檔案，沒有漸進式載入

### 建議的升級方向

1. **合併相似 Agent**：將功能相似的 Agent 合併為 Skills
2. **採用 SKILL.md 格式**：為每個核心能力創建 SKILL.md
3. **實現 Progressive Disclosure**：只在需要時載入詳細指令
4. **整合 MCP**：使用 MCP 連接外部工具（Firecrawl、PrintFriendly 等）
