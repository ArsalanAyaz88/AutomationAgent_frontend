// Agent-specific handlers for chat interface
import {
  auditChannel,
  auditTitles,
  generateScript,
  scriptToPrompts,
  generateIdeas,
  generateRoadmap,
  fetchFiftyVideos,
  AgentResponse
} from './api';

// Helper function to parse URLs from user input
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Agent 1: Channel Auditor
export async function handleChannelAuditor(userInput: string): Promise<AgentResponse> {
  const urls = extractUrls(userInput);
  
  console.log('📍 Channel Auditor - Input:', userInput);
  console.log('🔗 Extracted URLs:', urls);
  
  // Send to backend - it will handle all types of inputs
  // (video URLs, channel URLs, handles, names, questions, etc.)
  const response = await auditChannel({
    channel_urls: urls,
    user_query: userInput
  });
  
  console.log('✅ Backend response:', response);
  
  // If backend fails, provide helpful message with actual error
  if (!response.success && response.error) {
    console.error('🔴 Backend error:', response.error);
    
    return {
      success: true,
      result: `I can help you with YouTube channel analysis! I'm smart enough to handle:

🎯 **What I Accept**:
- Video URLs (any format) - I'll find the channel for you
- Channel URLs (@channelname or /channel/UCxxx)
- Channel handles (@username)
- Channel names ("MrBeast", "Tech Channel")
- General YouTube questions

📊 **What I Can Do**:
- Analyze channels deeply
- Discuss YouTube strategies
- Explain growth tactics
- Compare channels
- Answer YouTube questions

💬 **Examples**:
- "Analyze @mrbeast"
- "What makes a successful channel?"
- "Compare tech YouTubers"
- https://youtube.com/@channelname

${response.error.includes('Failed to fetch') || response.error.includes('NetworkError') 
  ? '\n⚠️ **Backend Connection Issue**: Make sure the backend is running at ' + (process.env.NEXT_PUBLIC_API_URL || 'https://automation-agent-backend.vercel.app')
  : '\n🔍 **Technical Details**: ' + response.error}

Just tell me what you need - I'll figure it out! What would you like to know?`,
      error: undefined
    };
  }
  
  return response;
}

// Agent 2: Title Auditor
export async function handleTitleAuditor(userInput: string): Promise<AgentResponse> {
  const urls = extractUrls(userInput);
  
  // If URLs are provided, do the audit
  if (urls.length > 0) {
    return await auditTitles({
      video_urls: urls,
      user_query: userInput
    });
  }

  // For general questions, provide helpful responses
  const response = await auditTitles({
    video_urls: [],
    user_query: userInput
  });
  
  // If backend fails, provide a helpful fallback
  if (!response.success && response.error?.includes('500')) {
    return {
      success: true,
      result: `I specialize in title and thumbnail analysis! Here's what I can do:

🎯 **Video Analysis**: Share video URLs (e.g., https://youtube.com/watch?v=xxx) and I'll analyze:
- Title effectiveness
- Thumbnail appeal
- Hook strategies
- Keyword usage
- CTR optimization

💡 **Title & Thumbnail Tips**:
- Use power words that create curiosity
- Keep titles under 60 characters
- Include relevant keywords early
- Thumbnails should be clear at small sizes
- Create contrast and use readable fonts
- Show faces with emotions for higher CTR

What would you like to know about titles and thumbnails?`,
      error: undefined
    };
  }
  
  return response;
}

// Agent 3: Script Writer
export async function handleScriptWriter(userInput: string, previousData?: string): Promise<AgentResponse> {
  // Extract topic from user input
  const topicMatch = userInput.match(/topic[:\s]+([^\n]+)/i);
  const topic = topicMatch ? topicMatch[1].trim() : userInput;

  // Process the request
  const response = await generateScript({
    title_audit_data: previousData || 'No previous audit data',
    topic: topic,
    user_query: userInput
  });
  
  // If backend fails, provide helpful guidance
  if (!response.success && response.error?.includes('500')) {
    return {
      success: true,
      result: `I'm your YouTube script writer! Here's how I can help:

📝 **Script Generation**: Tell me your topic and I'll create:
- Engaging hooks (first 10 seconds)
- Clear structure (intro, body, conclusion)
- Storytelling elements
- Call-to-actions
- Time stamps suggestions

💡 **Scriptwriting Tips**:
- Hook viewers in first 5 seconds
- Use pattern interrupts every 30 seconds
- Tell stories, don't just list facts
- Include visual cues for editing
- End with clear call-to-action

**Example**: "Generate a script about AI in education" or "topic: how to start a YouTube channel"

What topic would you like a script for?`,
      error: undefined
    };
  }
  
  return response;
}

// Agent 4: Scene Director (Script to Prompts)
export async function handleSceneDirector(userInput: string): Promise<AgentResponse> {
  const response = await scriptToPrompts({
    script: userInput,
    user_query: userInput
  });
  
  // If backend fails, provide helpful guidance
  if (!response.success && response.error?.includes('500')) {
    return {
      success: true,
      result: `I convert scripts to visual scene prompts! Here's what I can do:

🎬 **Script to Scenes**: Paste your script and I'll create:
- Scene-by-scene breakdown
- Visual prompts for each section
- Camera angle suggestions
- B-roll recommendations
- Transition ideas

💡 **Video Production Tips**:
- Vary your shots (wide, medium, close-up)
- Plan B-roll for every key point
- Use rule of thirds
- Good lighting is crucial
- Capture 3x more footage than needed

**To use**: Paste your complete script (at least a few paragraphs) and I'll break it down into visual scenes.

Would you like tips on video production or ready to convert a script?`,
      error: undefined
    };
  }
  
  return response;
}

// Agent 5: Ideas Generator
export async function handleIdeasGenerator(userInput: string, winningData?: string): Promise<AgentResponse> {
  const response = await generateIdeas({
    winning_videos_data: winningData || userInput,
    user_query: userInput
  });
  
  // If backend fails, provide helpful guidance
  if (!response.success && response.error?.includes('500')) {
    return {
      success: true,
      result: `I generate winning video ideas! Here's what I can create:

💡 **Idea Generation**: Tell me your niche and I'll generate:
- 3 viral-worthy title ideas
- Thumbnail concepts for each
- Target audience insights
- Trending angles
- Content formats that work

🎯 **Viral Content Formula**:
- Tap into emotions (curiosity, surprise, joy)
- Solve specific problems
- Use numbers and lists
- Create urgency or FOMO
- Leverage trends and news

**Example Niches**:
- "Generate ideas for tech review channel"
- "Ideas for fitness content"
- "niche: cooking tutorials"

What's your niche or content focus?`,
      error: undefined
    };
  }
  
  return response;
}

// Agent 6: Roadmap Strategist
export async function handleRoadmapStrategist(userInput: string): Promise<AgentResponse> {
  // Extract niche from user input
  const nicheMatch = userInput.match(/niche[:\s]+([^\n]+)/i);
  const niche = nicheMatch ? nicheMatch[1].trim() : userInput;

  const response = await generateRoadmap({
    niche: niche,
    user_query: userInput
  });
  
  // If backend fails, provide helpful guidance
  if (!response.success && response.error?.includes('500')) {
    return {
      success: true,
      result: `I create strategic content roadmaps! Here's what I can plan:

🗺️ **30-Video Roadmap**: Tell me your niche and I'll create:
- 30 video topics with progression
- Title variations for each video
- Thumbnail concepts
- Content pillars strategy
- Upload schedule recommendations

📊 **Content Planning Strategy**:
- Start with foundational content
- Mix evergreen + trending topics
- Create series and playlists
- Plan seasonal content
- Build content clusters for SEO

**Example**:
- "Create a roadmap for fitness channel"
- "niche: personal finance"
- "Plan content for my cooking channel"

What's your niche or content area?`,
      error: undefined
    };
  }
  
  return response;
}

// 50 Videos Fetcher
export async function handleFiftyVideosFetcher(userInput: string): Promise<AgentResponse> {
  const response = await fetchFiftyVideos({
    input: userInput,
    user_query: userInput
  });
  
  // If backend fails, provide helpful guidance
  if (!response.success && response.error?.includes('500')) {
    return {
      success: true,
      result: `I fetch the latest 50 video links from any YouTube channel! Here's what I can do:

🔗 **Link Collection**: Give me any of these and I'll fetch 50 videos:
- Channel ID (UCxxxxxxxxx)
- Channel URL (youtube.com/@channelname or /channel/UCxxx)
- Any video URL from that channel
- Channel handle (@username)

📊 **What You'll Get**:
- Latest 50 video links from the channel
- Video titles for easy reference
- Clean, copy-friendly format
- Ready to analyze or use

**Example Inputs**:
- "https://youtube.com/watch?v=VIDEO_ID"
- "@mrbeast"
- "UCxxxxxxxxxxx"
- "Get videos from Tech Channel"

What channel would you like video links from?`,
      error: undefined
    };
  }
  
  return response;
}

// Main handler that routes to specific agent
export async function handleAgentMessage(
  agentId: number,
  userInput: string,
  additionalData?: any
): Promise<AgentResponse> {
  switch (agentId) {
    case 1:
      return handleChannelAuditor(userInput);
    case 2:
      return handleTitleAuditor(userInput);
    case 3:
      return handleScriptWriter(userInput, additionalData?.previousData);
    case 4:
      return handleSceneDirector(userInput);
    case 5:
      return handleIdeasGenerator(userInput, additionalData?.winningData);
    case 6:
      return handleRoadmapStrategist(userInput);
    case 7:
      return handleFiftyVideosFetcher(userInput);
    default:
      return {
        success: false,
        result: '',
        error: 'Invalid agent ID'
      };
  }
}
