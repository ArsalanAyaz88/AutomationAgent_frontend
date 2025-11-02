/**
 * Utility functions for formatting agent outputs
 */

/**
 * Removes special formatting characters and emojis from text
 * Cleans up markdown symbols, box-drawing characters, and emojis
 */
export function cleanAgentOutput(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Remove emojis (all unicode emoji ranges)
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

  // Remove markdown bold (**text**)
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');

  // Remove box-drawing characters (═, ─, │, ┌, ┐, └, ┘, etc.)
  cleaned = cleaned.replace(/[═─│┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬]/g, '');

  // Remove multiple consecutive dashes (---, ===, etc.)
  cleaned = cleaned.replace(/[-=]{3,}/g, '');

  // Remove markdown headers (## HEADER)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove backticks used for code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' '); // Multiple spaces to single space
  
  // Trim each line
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Formats timestamp text (e.g., "0:00-0:18" -> "0:00 - 0:18")
 */
export function formatTimestamp(text: string): string {
  return text.replace(/(\d+:\d+)-(\d+:\d+)/g, '$1 - $2');
}

/**
 * Apply all formatting/cleaning to agent output
 */
export function formatAgentOutput(text: string, agentId?: number): string {
  let formatted = text;

  // Apply cleaning for Agent 4 (Scene Director) specifically
  if (agentId === 4) {
    formatted = cleanAgentOutput(formatted);
    formatted = formatTimestamp(formatted);
  }

  return formatted;
}
