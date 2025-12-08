import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 Generating AI message for prospect:', params.id);

    // Get prospect
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (prospectError || !prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Get campaign if exists
    let campaign = null;
    if (prospect.campaign_id) {
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', prospect.campaign_id)
        .single();
      campaign = campaignData;
    }

    // Get AI settings from campaign
    const aiTone = campaign?.ai_tone || 'professional';
    const aiMaxLength = campaign?.ai_max_length || 800;

    // Tone descriptions
    const toneDescriptions: Record<string, string> = {
      professional: 'Professional and business-focused, formal yet friendly',
      casual: 'Casual and approachable, conversational and relaxed',
      enthusiastic: 'Enthusiastic and energetic, showing excitement and passion',
      educational: 'Educational and helpful, informative and value-focused',
    };

    const toneDesc = toneDescriptions[aiTone] || toneDescriptions.professional;

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, company_id')
      .eq('id', user.id)
      .single();

    // Get company name
    let companyName = 'our company';
    if (profile?.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', profile.company_id)
        .single();
      
      if (company) {
        companyName = company.name;
      }
    }

    const senderName = profile?.full_name || 'Sales Team';

    // Generate message body
    const messagePrompt = `You are an expert B2B sales copywriter. Write a personalized cold outreach email to:

Prospect: ${prospect.first_name} ${prospect.last_name}
Title: ${prospect.title || 'Professional'}
Company: ${prospect.company || 'their company'}
Industry: ${prospect.industry || 'their industry'}

Your company: ${companyName}
Your name: ${senderName}

${campaign?.message_template ? `Use this template as inspiration (but personalize it heavily):
${campaign.message_template}` : ''}

Requirements:
- Keep the email body STRICTLY under ${aiMaxLength} characters
- Tone: ${toneDesc}
- Reference their specific role and company
- Sound natural and conversational, not robotic
- Include a clear, soft call-to-action
- Don't use overly salesy language

IMPORTANT: The message must be under ${aiMaxLength} characters. Count carefully.

Write ONLY the email body, no subject line. Start with "Hi ${prospect.first_name}," and end with a signature.`;

    const messageResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: messagePrompt }],
    });

    const messageContent = messageResponse.content[0];
    const messageBody = messageContent.type === 'text' ? messageContent.text.trim() : '';

    console.log('✅ Generated message body');

    // Generate subject line
    const subjectPrompt = `Generate a compelling email subject line for a cold outreach to ${prospect.first_name} ${prospect.last_name}, ${prospect.title} at ${prospect.company}.

Requirements:
- Under 50 characters
- Curiosity-inducing but not clickbait
- Personalized (mention their company or role)
- Natural, not salesy

Generate ONLY the subject line, no quotes or explanation.`;

    let emailSubject = '';
    try {
      const subjectResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [{ role: 'user', content: subjectPrompt }],
      });

      const subjectContent = subjectResponse.content[0];
      if (subjectContent.type === 'text') {
        emailSubject = subjectContent.text.trim().replace(/^["']|["']$/g, '');
      }
    } catch (error) {
      emailSubject = `Question about ${prospect.company}`;
    }

    console.log('✅ Generated subject:', emailSubject);

    // Save message to database
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        prospect_id: prospect.id,
        campaign_id: prospect.campaign_id,
        company_id: prospect.company_id,
        content: messageBody,
        message_type: 'connection_request',
        sent_by: user.id,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving message:', saveError);
      throw saveError;
    }

    console.log('💾 Saved message ID:', savedMessage.id);

    return NextResponse.json({
      success: true,
      data: {
        message: messageBody,
        subject: emailSubject,
        message_id: savedMessage.id,
        prospect_name: prospect.full_name,
      },
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate message', details: error.message },
      { status: 500 }
    );
  }
}