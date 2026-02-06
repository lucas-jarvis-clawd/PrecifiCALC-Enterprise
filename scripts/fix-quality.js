#!/usr/bin/env node

/**
 * Script automatizado para correções de qualidade - ESLint fixes
 * Quality Master - PrecifiCALC Masterpiece
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🎯 Quality Master - Auto Fix Script');
console.log('====================================');

// Lista de arquivos e correções específicas
const fixes = [
  // Remove unused imports
  {
    file: 'src/components/InputField.jsx',
    find: /import.*useEffect.*from 'react';/,
    replace: "import { useState } from 'react';",
    description: 'Remove unused useEffect import'
  },
  {
    file: 'src/components/Sidebar.jsx', 
    find: /import.*useState.*from 'react';/,
    replace: "import React from 'react';",
    description: 'Remove unused useState import'
  },
  {
    file: 'src/components/SmartAlerts.jsx',
    find: /import.*useEffect.*from 'react';/,
    replace: "import React from 'react';",
    description: 'Remove unused useEffect import'
  },
  
  // Fix empty catch blocks
  {
    file: 'src/pages/Dashboard.jsx',
    find: /} catch {}/g,
    replace: '} catch (error) {\n      console.warn(\'Failed to load data:\', error);\n    }',
    description: 'Add error handling to empty catch'
  },
  
  // Remove unnecessary escape characters
  {
    file: 'src/pages/Propostas.jsx',
    find: /\\\//g,
    replace: '/',
    description: 'Remove unnecessary escape characters'
  },
  {
    file: 'src/pages/Relatorios.jsx',
    find: /\\\//g,
    replace: '/',
    description: 'Remove unnecessary escape characters'
  },
];

let totalFixed = 0;

// Aplicar correções
fixes.forEach(fix => {
  const filePath = path.join(rootDir, fix.file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(fix.find, fix.replace);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed: ${fix.file} - ${fix.description}`);
      totalFixed++;
    } else {
      console.log(`⏭️  No changes: ${fix.file} - ${fix.description}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${fix.file}:`, error.message);
  }
});

console.log('\n📊 Summary:');
console.log(`Total fixes applied: ${totalFixed}`);
console.log(`Files processed: ${fixes.length}`);

if (totalFixed > 0) {
  console.log('\n🎉 Quality improvements applied!');
  console.log('Run `npm run lint` to check remaining issues.');
} else {
  console.log('\n✨ No automatic fixes needed.');
}