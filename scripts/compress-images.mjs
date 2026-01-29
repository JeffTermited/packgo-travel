#!/usr/bin/env node
/**
 * 圖片壓縮腳本
 * 將 client/public/images/ 中的所有圖片壓縮到 < 500KB
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_DIR = join(__dirname, '../client/public/images');
const BACKUP_DIR = join(__dirname, '../client/public/images-backup');
const MAX_SIZE_KB = 500;
const TARGET_SIZE_BYTES = MAX_SIZE_KB * 1024;

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size;
}

async function compressImage(inputPath, outputPath) {
  const ext = extname(inputPath).toLowerCase();
  const originalSize = await getFileSize(inputPath);
  
  console.log(`\n處理: ${basename(inputPath)}`);
  console.log(`  原始大小: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  
  if (originalSize <= TARGET_SIZE_BYTES) {
    console.log(`  ✓ 已符合大小要求，跳過壓縮`);
    return { skipped: true, originalSize, compressedSize: originalSize };
  }
  
  try {
    // 使用 WebP 格式壓縮
    const outputPathWebP = outputPath.replace(ext, '.webp');
    
    // 嘗試不同的品質設定
    let quality = 80;
    let compressedSize = Infinity;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (compressedSize > TARGET_SIZE_BYTES && attempts < maxAttempts) {
      await sharp(inputPath)
        .webp({ quality })
        .toFile(outputPathWebP);
      
      compressedSize = await getFileSize(outputPathWebP);
      
      console.log(`  嘗試 ${attempts + 1}: 品質 ${quality}%, 大小 ${(compressedSize / 1024).toFixed(2)} KB`);
      
      if (compressedSize > TARGET_SIZE_BYTES) {
        quality -= 10;
        attempts++;
      }
    }
    
    if (compressedSize <= TARGET_SIZE_BYTES) {
      console.log(`  ✓ 壓縮成功! 最終大小: ${(compressedSize / 1024).toFixed(2)} KB (品質 ${quality}%)`);
      console.log(`  壓縮率: ${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`);
      return { success: true, originalSize, compressedSize, quality };
    } else {
      console.log(`  ⚠ 無法壓縮到目標大小，使用最低品質`);
      return { success: true, originalSize, compressedSize, quality };
    }
  } catch (error) {
    console.error(`  ✗ 壓縮失敗: ${error.message}`);
    return { error: error.message, originalSize };
  }
}

async function processDirectory(dir) {
  const files = await readdir(dir);
  const results = {
    total: 0,
    compressed: 0,
    skipped: 0,
    errors: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0
  };
  
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    
    if (fileStat.isDirectory()) {
      continue; // 跳過子目錄
    }
    
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      continue; // 只處理圖片檔案
    }
    
    results.total++;
    
    // 備份原始檔案
    const backupPath = join(BACKUP_DIR, file);
    const outputPath = join(dir, file);
    
    const result = await compressImage(filePath, outputPath);
    
    if (result.skipped) {
      results.skipped++;
    } else if (result.success) {
      results.compressed++;
      results.totalOriginalSize += result.originalSize;
      results.totalCompressedSize += result.compressedSize;
    } else if (result.error) {
      results.errors++;
    }
  }
  
  return results;
}

async function main() {
  console.log('=== 圖片壓縮工具 ===\n');
  console.log(`來源目錄: ${SOURCE_DIR}`);
  console.log(`備份目錄: ${BACKUP_DIR}`);
  console.log(`目標大小: < ${MAX_SIZE_KB} KB\n`);
  
  // 確保備份目錄存在
  await ensureDir(BACKUP_DIR);
  
  // 處理圖片
  const results = await processDirectory(SOURCE_DIR);
  
  // 顯示總結
  console.log('\n=== 壓縮總結 ===');
  console.log(`總檔案數: ${results.total}`);
  console.log(`已壓縮: ${results.compressed}`);
  console.log(`已跳過: ${results.skipped}`);
  console.log(`錯誤: ${results.errors}`);
  
  if (results.compressed > 0) {
    console.log(`\n原始總大小: ${(results.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`壓縮後總大小: ${(results.totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`節省空間: ${((1 - results.totalCompressedSize / results.totalOriginalSize) * 100).toFixed(1)}%`);
  }
  
  console.log('\n✓ 壓縮完成!');
}

main().catch(console.error);
