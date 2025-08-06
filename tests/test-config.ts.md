#!/usr/bin/env tsx

/**
 * Test script to verify the blog generation configuration works correctly
 */

import { TopicalMapEntry } from '../prisma/generated/client';
import { getBlogPrompts, getGenerationSettings, getOutputPath } from './src/config/blog-generation-config';

// Mock TopicalMapEntry for testing
const mockEntry: Partial<TopicalMapEntry> = {
  id: 'test-entry',
  titelPagina: 'Test Blog Post',
  type: 'P',
  kernonderwerp: 'SEO voor webshops',
  belangrijksteZoekwoorden: ['SEO', 'webshop', 'optimalisatie'],
  sammenvatting: 'Een uitgebreide gids over SEO voor webshops',
  inhoudsopgave: '1. Introductie\n2. Keyword research\n3. On-page SEO',
  linktNaarPillar: [],
  linktNaarCluster: [],
  linktNaarSupport: [],
  linktNaarTools: [],
  linktNaarBestaande: []
};

console.log('🧪 Testing Blog Generation Configuration\n');

// Test default mode
console.log('📋 Testing DEFAULT mode:');
try {
  const defaultPrompts = getBlogPrompts(mockEntry, 'default');
  const defaultSettings = getGenerationSettings('default');
  const defaultOutputPath = getOutputPath('default');
  
  console.log('✅ Default prompts generated successfully');
  console.log('✅ Default system prompt length:', defaultPrompts.systemPrompt.length);
  console.log('✅ Default user prompt length:', defaultPrompts.userPrompt.length);
  console.log('✅ Default output path:', defaultOutputPath);
  console.log('✅ Default settings retrieved successfully');
} catch (error) {
  console.error('❌ Default mode test failed:', error);
}

console.log('\n📋 Testing TEST mode:');
try {
  const testPrompts = getBlogPrompts(mockEntry, 'test');
  const testSettings = getGenerationSettings('test');
  const testOutputPath = getOutputPath('test');
  
  console.log('✅ Test prompts generated successfully');
  console.log('✅ Test system prompt includes [TEST MODE]:', testPrompts.systemPrompt.includes('[TEST MODE]'));
  console.log('✅ Test user prompt includes TEST MODE:', testPrompts.userPrompt.includes('TEST MODE'));
  console.log('✅ Test output path:', testOutputPath);
  console.log('✅ Test settings retrieved successfully');
} catch (error) {
  console.error('❌ Test mode test failed:', error);
}

console.log('\n🎉 Configuration test completed!');
