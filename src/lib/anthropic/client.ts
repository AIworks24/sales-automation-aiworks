import Anthropic from '@anthropic-ai/sdk';
import type { AIMessageGenerationRequest, Prospect, Campaign } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GenerateMessageOptions {
  prospect: Prospect;
  template: string;
  campaign?: Campaign;
  companyInfo?: {
    name: string;
    value_proposition: string;
    industry: string;
  };
  tone?: 'professional' | 'casual' | 'enthusiastic';
  maxTokens?: number;
}

export async function generatePersonalizedMessage(
  options: GenerateMessageOptions
): Promise<string> {
  const { prospect, template, companyInfo, tone = 'professional', maxTokens = 1024 } = options;

  const systemPrompt = `You are an expert B2B sales copywriter specializing in LinkedIn outreach. Your goal is to create personalized, engaging messages that:
- Feel authentic and conversational, not salesy
- Reference specific details about the prospect's role and company
- Clearly communicate value without being pushy
- Are concise (under 300 characters for LinkedIn connection requests, under 500 for follow-ups)
- Include a specific, easy-to-answer question or soft call-to-action
- Maintain a ${tone} tone throughout

Never use generic phrases like "I came across your profile" or "I hope this message finds you well."`;

  const userPrompt = `Generate a personalized LinkedIn message using the following information:

PROSPECT INFORMATION:
- Name: ${prospect.first_name} ${prospect.last_name}
- Title: ${prospect.title || 'Not specified'}
- Company: ${prospect.company || 'Not specified'}
- Industry: ${prospect.industry || 'Not specified'}
- Location: ${prospect.location || 'Not specified'}

${companyInfo ? `OUR COMPANY:
- Name: ${companyInfo.name}
- Industry: ${companyInfo.industry}
- Value Proposition: ${companyInfo.value_proposition}` : ''}

MESSAGE TEMPLATE (use as inspiration, not word-for-word):
${template}

REQUIREMENTS:
- Keep it under 300 characters for connection requests or 500 for messages
- Reference something specific about their role or company
- Make it feel like a human wrote it, not AI
- Focus on starting a conversation, not making a sale
- End with a question or soft CTA

Generate only the message text, nothing else.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Error generating message with Claude:', error);
    throw new Error('Failed to generate personalized message');
  }
}

export async function improveMessage(originalMessage: string): Promise<string> {
  const systemPrompt = `You are an expert sales copywriter. Improve the given LinkedIn message to make it more engaging, concise, and effective while maintaining its core intent.`;

  const userPrompt = `Improve this LinkedIn message:

"${originalMessage}"

Make it:
- More concise and punchy
- More engaging and personalized
- Professional but approachable
- Clear in its value proposition
- End with a compelling question or CTA

Return only the improved message, nothing else.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Error improving message with Claude:', error);
    throw new Error('Failed to improve message');
  }
}

export async function generateMessageVariations(
  baseMessage: string,
  count: number = 3
): Promise<string[]> {
  const systemPrompt = `You are an expert sales copywriter. Generate ${count} different variations of the given message, each with a slightly different approach or angle while maintaining the core value proposition.`;

  const userPrompt = `Generate ${count} variations of this message:

"${baseMessage}"

Each variation should:
- Have a different opening hook
- Maintain the same core value proposition
- Be equally concise and engaging
- Feel distinct from the others

Return only the ${count} variations, separated by "---" on new lines.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const variations = content.text
        .split('---')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      return variations.slice(0, count);
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Error generating variations with Claude:', error);
    throw new Error('Failed to generate message variations');
  }
}

export async function analyzeProspectProfile(
  profileData: string
): Promise<{ insights: string[]; suggested_approach: string }> {
  const systemPrompt = `You are an expert sales strategist. Analyze LinkedIn profile information and provide actionable insights for sales outreach.`;

  const userPrompt = `Analyze this LinkedIn profile information and provide:
1. Key insights about the prospect (interests, pain points, priorities)
2. Suggested outreach approach

Profile Data:
${profileData}

Return your analysis in JSON format:
{
  "insights": ["insight 1", "insight 2", ...],
  "suggested_approach": "your recommended approach"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const analysis = JSON.parse(content.text);
      return analysis;
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Error analyzing profile with Claude:', error);
    throw new Error('Failed to analyze prospect profile');
  }
}