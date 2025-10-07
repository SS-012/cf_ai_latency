

import { NextRequest, NextResponse } from 'next/server';


interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  context: {
    currentColo?: string;
    lastAnalysis?: any;
    userPreferences?: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message, context } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId or message' },
        { status: 400 }
      );
    }

    // Get AI from environment
    const env = (globalThis as any).env || 
                (globalThis as any).__env__ || 
                (process as any).env;
    const ai = env?.AI;

    if (!ai) {
      return NextResponse.json(
        { error: 'AI service not available' },
        { status: 500 }
      );
    }

    // Create system prompt for network engineer assistant
    const systemPrompt = `
You are CloudflareNet AI, an expert network engineer assistant for Cloudflare's edge network monitoring system. 

Your expertise includes:
- Real User Monitoring (RUM) data analysis
- Network performance optimization
- Latency and jitter interpretation
- PoP (Point of Presence) recommendations
- Traffic routing optimization
- Network congestion prediction

Current context:
${context ? `- Current PoP: ${context.currentColo || 'Not specified'}
- Last analysis: ${context.lastAnalysis ? JSON.stringify(context.lastAnalysis, null, 2) : 'None'}
- User preferences: ${context.userPreferences ? JSON.stringify(context.userPreferences, null, 2) : 'None'}` : 'No context provided'}

Guidelines:
- Provide technical but accessible explanations
- Use specific metrics and data when available
- Suggest actionable recommendations
- Be concise but thorough
- If asked about specific PoPs, reference the 47 US locations available
- Always consider network optimization opportunities
`;

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    // Get AI response
    const aiResponse = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 500,
      temperature: 0.7
    });

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse.response,
      timestamp: new Date().toISOString()
    };

    // Update context based on conversation
    const updatedContext = updateContext(context, message, aiResponse.response);

    return NextResponse.json({
      message: assistantMessage,
      sessionId,
      context: updatedContext,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

function updateContext(currentContext: any, userMessage: string, aiResponse: string): any {
  const context = { ...currentContext };

  // Extract PoP mentions from user message
  const popMatch = userMessage.match(/\b([A-Z]{3})\b/g);
  if (popMatch) {
    context.currentColo = popMatch[0]; // Use first PoP mentioned
  }

  // Detect if user is asking about performance analysis
  const analysisKeywords = ['analyze', 'performance', 'latency', 'rtt', 'jitter', 'congestion'];
  const isAnalysisRequest = analysisKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );

  if (isAnalysisRequest) {
    context.lastAnalysis = {
      timestamp: new Date().toISOString(),
      type: 'performance_inquiry'
    };
  }

  // Store user preferences for future context
  if (userMessage.toLowerCase().includes('prefer') || userMessage.toLowerCase().includes('like')) {
    context.userPreferences = {
      ...context.userPreferences,
      lastUpdated: new Date().toISOString()
    };
  }

  return context;
}

// GET endpoint for session management
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing sessionId' },
      { status: 400 }
    );
  }

  // In a real implementation, you'd retrieve from Durable Objects
  // For now, return a basic session structure
  return NextResponse.json({
    sessionId,
    messages: [],
    context: {
      currentColo: null,
      lastAnalysis: null,
      userPreferences: {}
    },
    timestamp: new Date().toISOString()
  });
}
