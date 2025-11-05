'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SceneViewerProps {
  content: string;
}

export default function SceneViewer({ content }: SceneViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Extract JSON code blocks from the content
  const extractScenes = (text: string) => {
    const scenes: Array<{ json: string; fullBlock: string }> = [];
    const jsonBlockRegex = /```json\n([\s\S]*?)\n```/g;
    let match;

    while ((match = jsonBlockRegex.exec(text)) !== null) {
      scenes.push({
        json: match[1].trim(),
        fullBlock: match[0]
      });
    }

    return scenes;
  };

  const scenes = extractScenes(content);

  // If no scenes found, return content as-is with markdown
  if (scenes.length === 0) {
    return (
      <div className="text-military-text text-sm leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </div>
    );
  }

  const handleCopyScene = async (sceneJson: string, index: number) => {
    try {
      await navigator.clipboard.writeText(sceneJson);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy scene', error);
    }
  };

  // Extract intro text (before first scene)
  const firstSceneIndex = content.indexOf('```json');
  const introText = firstSceneIndex > 0 ? content.substring(0, firstSceneIndex).trim() : '';

  // Extract outro text (after last scene)
  const lastSceneEnd = content.lastIndexOf('```');
  const outroText = lastSceneEnd > 0 && lastSceneEnd < content.length - 3 
    ? content.substring(lastSceneEnd + 3).trim() 
    : '';

  return (
    <div className="space-y-4">
      {/* Intro text if exists */}
      {introText && (
        <div className="text-military-text text-sm leading-relaxed whitespace-pre-wrap mb-4">
          {introText}
        </div>
      )}

      {/* Scene blocks */}
      {scenes.map((scene, index) => {
        let sceneData: any = {};
        try {
          sceneData = JSON.parse(scene.json);
        } catch (e) {
          // If parsing fails, just display raw
        }

        return (
          <div 
            key={index} 
            className="border border-military-border rounded-lg bg-military-dark/40 overflow-hidden"
          >
            {/* Scene Header */}
            <div className="bg-military-gray/30 border-b border-military-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-military-orange font-mono text-sm font-semibold">
                  {sceneData.scene || `Scene ${index + 1}`}
                </span>
                {sceneData.duration && (
                  <span className="text-military-muted font-mono text-xs">
                    {sceneData.duration}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleCopyScene(scene.json, index)}
                className="inline-flex items-center gap-1.5 rounded bg-military-dark/70 border border-military-border px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-military-muted hover:text-military-green hover:border-military-green transition-colors"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Scene
                  </>
                )}
              </button>
            </div>

            {/* Scene Content */}
            <div className="p-4">
              <pre className="text-military-text text-xs font-mono leading-relaxed overflow-x-auto custom-scrollbar">
                <code>{scene.json}</code>
              </pre>
            </div>
          </div>
        );
      })}

      {/* Outro text if exists */}
      {outroText && (
        <div className="text-military-text text-sm leading-relaxed whitespace-pre-wrap mt-4">
          {outroText}
        </div>
      )}
    </div>
  );
}
