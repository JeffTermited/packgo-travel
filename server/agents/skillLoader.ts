/**
 * SKILL Loader
 * Unified loader for Agent SKILL.md documents with caching
 * Based on Anthropic's Progressive Disclosure architecture
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global cache for SKILL documents
const skillCache = new Map<string, string>();
const sectionCache = new Map<string, string>();
const referenceCache = new Map<string, string>();
const referenceSectionCache = new Map<string, string>();

/**
 * Load full SKILL.md document for an agent
 */
export function loadSkill(agentName: string): string {
  const cacheKey = agentName;
  
  if (!skillCache.has(cacheKey)) {
    const skillPath = path.join(__dirname, 'skills', `${agentName}.SKILL.md`);
    
    if (!fs.existsSync(skillPath)) {
      console.warn(`[SkillLoader] SKILL file not found: ${skillPath}`);
      return '';
    }
    
    const skillContent = fs.readFileSync(skillPath, 'utf-8');
    skillCache.set(cacheKey, skillContent);
    console.log(`[SkillLoader] Loaded SKILL for ${agentName} (${skillContent.length} chars)`);
  }
  
  return skillCache.get(cacheKey)!;
}

/**
 * Extract specific sections from SKILL.md
 * This is the recommended approach to reduce token usage
 */
export function loadSkillSections(agentName: string, sections: string[]): string {
  const cacheKey = `${agentName}:${sections.join(',')}`;
  
  if (!sectionCache.has(cacheKey)) {
    const fullSkill = loadSkill(agentName);
    if (!fullSkill) return '';
    
    let result = '';
    
    for (const section of sections) {
      const sectionHeader = `## ${section}`;
      const startIndex = fullSkill.indexOf(sectionHeader);
      
      if (startIndex !== -1) {
        // Find next section or end of document
        const nextSectionIndex = fullSkill.indexOf('\n## ', startIndex + sectionHeader.length);
        const sectionContent = nextSectionIndex !== -1
          ? fullSkill.substring(startIndex, nextSectionIndex)
          : fullSkill.substring(startIndex);
        
        result += sectionContent + '\n\n';
      }
    }
    
    sectionCache.set(cacheKey, result);
    console.log(`[SkillLoader] Extracted sections for ${agentName}: ${sections.join(', ')} (${result.length} chars)`);
  }
  
  return sectionCache.get(cacheKey)!;
}

/**
 * Extract JSON Schema from SKILL.md
 * Used for output validation
 */
export function extractJsonSchema(agentName: string): any {
  const fullSkill = loadSkill(agentName);
  if (!fullSkill) return null;
  
  // Find JSON Schema section
  const schemaStart = fullSkill.indexOf('## JSON Schema');
  if (schemaStart === -1) return null;
  
  // Find the first ```json code block after the section header
  const codeBlockStart = fullSkill.indexOf('```json', schemaStart);
  if (codeBlockStart === -1) return null;
  
  const codeBlockEnd = fullSkill.indexOf('```', codeBlockStart + 7);
  if (codeBlockEnd === -1) return null;
  
  const jsonString = fullSkill.substring(codeBlockStart + 7, codeBlockEnd).trim();
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`[SkillLoader] Failed to parse JSON Schema for ${agentName}:`, error);
    return null;
  }
}

/**
 * Get key instructions for an agent (recommended sections)
 * This extracts only the essential parts for token optimization
 */
export function getKeyInstructions(agentName: string): string {
  const keySections = [
    '角色定義',
    '核心職責',
    '輸出格式',
    'JSON Schema'
  ];
  
  return loadSkillSections(agentName, keySections);
}

/**
 * Load reference document (from references/ directory)
 * With caching support
 */
export function loadReference(referenceName: string): string {
  const cacheKey = referenceName;
  
  if (!referenceCache.has(cacheKey)) {
    const referencePath = path.join(__dirname, 'skills', 'references', `${referenceName}.md`);
    
    if (!fs.existsSync(referencePath)) {
      console.warn(`[SkillLoader] Reference file not found: ${referencePath}`);
      return '';
    }
    
    const referenceContent = fs.readFileSync(referencePath, 'utf-8');
    referenceCache.set(cacheKey, referenceContent);
    console.log(`[SkillLoader] Loaded Reference: ${referenceName} (${referenceContent.length} chars)`);
  }
  
  return referenceCache.get(cacheKey)!;
}

/**
 * Extract specific sections from Reference document
 * This is the recommended approach to reduce token usage
 */
export function loadReferenceSections(referenceName: string, sections: string[]): string {
  const cacheKey = `${referenceName}:${sections.join(',')}`;
  
  if (!referenceSectionCache.has(cacheKey)) {
    const fullReference = loadReference(referenceName);
    if (!fullReference) return '';
    
    let result = '';
    
    for (const section of sections) {
      const sectionHeader = `## ${section}`;
      const startIndex = fullReference.indexOf(sectionHeader);
      
      if (startIndex !== -1) {
        // Find next section or end of document
        const nextSectionIndex = fullReference.indexOf('\n## ', startIndex + sectionHeader.length);
        const sectionContent = nextSectionIndex !== -1
          ? fullReference.substring(startIndex, nextSectionIndex)
          : fullReference.substring(startIndex);
        
        result += sectionContent + '\n\n';
      }
    }
    
    referenceSectionCache.set(cacheKey, result);
    console.log(`[SkillLoader] Extracted sections from ${referenceName}: ${sections.join(', ')} (${result.length} chars)`);
  }
  
  return referenceSectionCache.get(cacheKey)!;
}

/**
 * Quick access to Sipincollection Design Guidelines
 */
export function getSipincollectionGuidelines(sections?: string[]): string {
  if (sections && sections.length > 0) {
    return loadReferenceSections('Sipincollection-Design-Guidelines', sections);
  }
  return loadReference('Sipincollection-Design-Guidelines');
}

/**
 * Quick access to Destination Color Palette
 */
export function getDestinationColorPalette(destination?: string): string {
  if (destination) {
    // Try to extract specific destination section
    const sections = [`🌏 亞洲地區`, `🌍 歐洲地區`, `🌎 美洲地區`, `🌊 大洋洲地區`, `🏝️ 海島地區`, `❄️ 極地地區`, `🏜️ 中東地區`];
    return loadReferenceSections('Destination-Color-Palette', sections);
  }
  return loadReference('Destination-Color-Palette');
}

/**
 * Quick access to LionTravel Design Guidelines
 */
export function getLionTravelGuidelines(sections?: string[]): string {
  if (sections && sections.length > 0) {
    return loadReferenceSections('LionTravel-Design-Guidelines', sections);
  }
  return loadReference('LionTravel-Design-Guidelines');
}

/**
 * Quick access to Poetic Title Examples
 */
export function getPoeticTitleExamples(region?: string): string {
  if (region) {
    const sectionMap: Record<string, string> = {
      '亞洲': '🌏 亞洲地區範例',
      '歐洲': '🌍 歐洲地區範例',
      '美洲': '🌎 美洲地區範例',
      '大洋洲': '🌊 大洋洲地區範例',
      '海島': '🏝️ 海島地區範例',
      '極地': '❄️ 極地地區範例',
      '中東': '🏜️ 中東地區範例'
    };
    const section = sectionMap[region];
    if (section) {
      return loadReferenceSections('Poetic-Title-Examples', [section, '🎨 標題撰寫原則']);
    }
  }
  return loadReference('Poetic-Title-Examples');
}

/**
 * Clear cache (useful for development/testing)
 */
export function clearCache(): void {
  skillCache.clear();
  sectionCache.clear();
  referenceCache.clear();
  referenceSectionCache.clear();
  console.log('[SkillLoader] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { skillCount: number; sectionCount: number; referenceCount: number; referenceSectionCount: number } {
  return {
    skillCount: skillCache.size,
    sectionCount: sectionCache.size,
    referenceCount: referenceCache.size,
    referenceSectionCount: referenceSectionCache.size
  };
}
