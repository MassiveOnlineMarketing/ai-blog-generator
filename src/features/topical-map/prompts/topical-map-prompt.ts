/**
 * AI prompts for topical map generation
 */

import type { TopicalMapGenerationInput } from '../types';

export interface TopicalMapPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export function generateTopicalMapPrompt(input: TopicalMapGenerationInput): TopicalMapPrompt {
  const systemPrompt = `You are an expert SEO strategist and content marketing specialist. Your task is to create comprehensive topical maps that will dominate search engine rankings.

Your expertise includes:
- Keyword research and analysis
- Content strategy development
- Topic clustering and pillar page architecture
- Search intent analysis
- Competitive content analysis

You must generate a complete topical map structure with:
1. PILLAR TOPICS (3-7 broad, high-volume topics)
2. CLUSTER TOPICS (15-30 supporting topics that link to pillars)
3. SUPPORT TOPICS (20-50 long-tail, specific topics)

For each topic, provide:
- Primary keyword
- Secondary keywords (3-5)
- Search intent (informational, commercial, transactional, navigational)
- Estimated monthly traffic
- Keyword difficulty (1-100)
- Content type recommendation
- Target audience segment

CRITICAL: Respond ONLY with valid JSON in this exact format:

{
  "pillarTopics": [
    {
      "title": "Topic Title",
      "primaryKeyword": "main keyword",
      "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
      "searchIntent": "informational|commercial|transactional|navigational",
      "estimatedTraffic": 5000,
      "difficulty": 65,
      "contentType": "pillar page|guide|comparison|tool",
      "targetAudience": "beginners|intermediate|experts|decision-makers",
      "description": "Brief description of the topic"
    }
  ],
  "clusterTopics": [
    {
      "title": "Cluster Topic Title",
      "primaryKeyword": "cluster keyword",
      "secondaryKeywords": ["keyword1", "keyword2"],
      "searchIntent": "informational",
      "estimatedTraffic": 1500,
      "difficulty": 45,
      "contentType": "blog post|tutorial|case study",
      "targetAudience": "beginners",
      "description": "Brief description",
      "parentPillar": "Related Pillar Topic Title"
    }
  ],
  "supportTopics": [
    {
      "title": "Support Topic Title",
      "primaryKeyword": "long-tail keyword",
      "secondaryKeywords": ["specific keyword"],
      "searchIntent": "informational",
      "estimatedTraffic": 500,
      "difficulty": 25,
      "contentType": "blog post|FAQ|how-to",
      "targetAudience": "specific segment",
      "description": "Brief description",
      "parentCluster": "Related Cluster Topic Title"
    }
  ],
  "topicRelationships": [
    {
      "from": "Topic A",
      "to": "Topic B",
      "relationshipType": "parent-child|related|prerequisite"
    }
  ]
}`;

  const userPrompt = `Create a comprehensive topical map for the following business:

**Business Name:** ${input.businessName}
**Business Description:** ${input.businessDescription}
**Industry:** ${input.industry}
**Main Topic/Niche:** ${input.mainTopic}
**Target Audience:** ${input.targetAudience}
**Geographic Target:** ${input.geoTarget || 'Global'}

${input.competitorDomains && input.competitorDomains.length > 0 ? `
**Key Competitors:**
${input.competitorDomains.map((domain: string) => `- ${domain}`).join('\n')}
` : ''}

${input.primaryKeywords && input.primaryKeywords.length > 0 ? `
**Primary Keywords to Include:**
${input.primaryKeywords.map((keyword: string) => `- ${keyword}`).join('\n')}
` : ''}

${input.keyObjectives && input.keyObjectives.length > 0 ? `
**Key Objectives:**
${input.keyObjectives.map((objective: string) => `- ${objective}`).join('\n')}
` : ''}

**Content Preferences:**
- Content Depth: ${input.contentDepth}
- Content Format: ${input.contentFormat}
- Expected Volume: ${input.expectedVolume}

**Special Instructions:**
- Focus on ${input.mainTopic} and related subtopics
- Ensure topics align with ${input.targetAudience} search behavior
- Create a logical content hierarchy for maximum SEO impact
- Include both informational and commercial intent keywords
- Consider the customer journey from awareness to conversion
- Target content depth level: ${input.contentDepth}

Generate a complete topical map that will establish this business as the authoritative source in their niche. Focus on creating topics that will:
1. Drive organic traffic
2. Build topical authority
3. Cover the entire customer journey
4. Provide clear internal linking opportunities
5. Target winnable keywords for this business size

Remember: Respond ONLY with the JSON structure. No additional text or explanation.`;

  return {
    systemPrompt,
    userPrompt
  };
}
