'use client';

import { useState } from 'react';
import { FileText, Plus, X, Loader2 } from 'lucide-react';

interface ScriptGeneratorFormProps {
  onSubmit: (formData: ScriptFormData) => Promise<void>;
  isLoading: boolean;
}

export interface ScriptFormData {
  topic: string;
  total_words: number;
  tone: string;
  target_audience: string;
  video_duration: number | null;
  include_hook: boolean;
  include_cta: boolean;
  script_structure: string;
  key_points: string[];
  additional_instructions: string;
}

export default function ScriptGeneratorForm({ onSubmit, isLoading }: ScriptGeneratorFormProps) {
  const [formData, setFormData] = useState<ScriptFormData>({
    topic: '',
    total_words: 1500,
    tone: 'conversational',
    target_audience: 'general',
    video_duration: null,
    include_hook: true,
    include_cta: true,
    script_structure: 'standard',
    key_points: [],
    additional_instructions: ''
  });

  const [keyPointInput, setKeyPointInput] = useState('');

  const handleAddKeyPoint = () => {
    if (keyPointInput.trim()) {
      setFormData(prev => ({
        ...prev,
        key_points: [...prev.key_points, keyPointInput.trim()]
      }));
      setKeyPointInput('');
    }
  };

  const handleRemoveKeyPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_points: prev.key_points.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;
    await onSubmit(formData);
  };

  return (
    <div className="bg-military-darker/90 backdrop-blur-sm border border-military-green/30 rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-military-green/30">
        <FileText className="w-6 h-6 text-military-green" />
        <h2 className="text-xl font-bold text-military-green">Script Generation Parameters</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic - Required */}
        <div>
          <label className="block text-sm font-medium text-military-text mb-2">
            Topic <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., How to Learn Python in 30 Days"
            className="w-full bg-military-gray/50 border border-military-green/30 rounded px-4 py-2 text-military-text placeholder-military-text/50 focus:outline-none focus:border-military-green transition-colors"
            required
          />
        </div>

        {/* Word Count & Video Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-military-text mb-2">
              Total Words
            </label>
            <input
              type="number"
              value={formData.total_words}
              onChange={(e) => setFormData({ ...formData, total_words: parseInt(e.target.value) })}
              min="100"
              step="100"
              className="w-full bg-military-gray/50 border border-military-green/30 rounded px-4 py-2 text-military-text focus:outline-none focus:border-military-green transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-military-text mb-2">
              Video Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.video_duration || ''}
              onChange={(e) => setFormData({ ...formData, video_duration: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Optional"
              min="1"
              max="60"
              className="w-full bg-military-gray/50 border border-military-green/30 rounded px-4 py-2 text-military-text placeholder-military-text/50 focus:outline-none focus:border-military-green transition-colors"
            />
          </div>
        </div>

        {/* Tone & Target Audience */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-military-text mb-2">
              Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              className="w-full bg-military-gray/50 border border-military-green/30 rounded px-4 py-2 text-military-text focus:outline-none focus:border-military-green transition-colors"
            >
              <option value="conversational">Conversational</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="energetic">Energetic</option>
              <option value="educational">Educational</option>
              <option value="entertaining">Entertaining</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-military-text mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              placeholder="e.g., beginners, professionals"
              className="w-full bg-military-gray/50 border border-military-green/30 rounded px-4 py-2 text-military-text placeholder-military-text/50 focus:outline-none focus:border-military-green transition-colors"
            />
          </div>
        </div>

        {/* Script Structure */}
        <div>
          <label className="block text-sm font-medium text-military-text mb-2">
            Script Structure
          </label>
          <select
            value={formData.script_structure}
            onChange={(e) => setFormData({ ...formData, script_structure: e.target.value })}
            className="w-full bg-military-gray/50 border border-military-green/30 rounded px-4 py-2 text-military-text focus:outline-none focus:border-military-green transition-colors"
          >
            <option value="standard">Standard (Hook → Intro → Main → Climax → CTA)</option>
            <option value="story-based">Story-Based (Hook → Setup → Conflict → Journey → Resolution)</option>
            <option value="tutorial">Tutorial (Hook → Problem → Steps → Common Mistakes → Summary)</option>
            <option value="listicle">Listicle (Hook → Intro → List Items → Bonus → CTA)</option>
          </select>
        </div>

        {/* Include Hook & CTA */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-military-gray/30 border border-military-green/20 rounded cursor-pointer hover:bg-military-gray/50 transition-colors">
            <input
              type="checkbox"
              checked={formData.include_hook}
              onChange={(e) => setFormData({ ...formData, include_hook: e.target.checked })}
              className="w-5 h-5 rounded border-military-green/30 text-military-green focus:ring-military-green focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-military-text">Include Hook (First 15s)</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-military-gray/30 border border-military-green/20 rounded cursor-pointer hover:bg-military-gray/50 transition-colors">
            <input
              type="checkbox"
              checked={formData.include_cta}
              onChange={(e) => setFormData({ ...formData, include_cta: e.target.checked })}
              className="w-5 h-5 rounded border-military-green/30 text-military-green focus:ring-military-green focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-military-text">Include Call-to-Action</span>
          </label>
        </div>

        {/* Key Points */}
        <div>
          <label className="block text-sm font-medium text-military-text mb-2">
            Key Points to Cover
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={keyPointInput}
                onChange={(e) => setKeyPointInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyPoint())}
                placeholder="Add a key point..."
                className="flex-1 bg-military-gray/50 border border-military-green/30 rounded px-4 py-2 text-military-text placeholder-military-text/50 focus:outline-none focus:border-military-green transition-colors"
              />
              <button
                type="button"
                onClick={handleAddKeyPoint}
                className="px-4 py-2 bg-military-green/20 border border-military-green/30 rounded text-military-green hover:bg-military-green/30 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.key_points.length > 0 && (
              <div className="space-y-2 mt-3">
                {formData.key_points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 bg-military-gray/30 border border-military-green/20 rounded px-3 py-2">
                    <span className="flex-1 text-sm text-military-text">{point}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyPoint(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="block text-sm font-medium text-military-text mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={formData.additional_instructions}
            onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
            placeholder="Any extra instructions or specific requirements..."
            rows={3}
            className="w-full bg-military-gray/50 border border-military-green/30 rounded px-4 py-2 text-military-text placeholder-military-text/50 focus:outline-none focus:border-military-green transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.topic.trim()}
          className="w-full bg-military-green/20 border-2 border-military-green/50 rounded px-6 py-3 text-military-green font-bold hover:bg-military-green/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Script...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate Script
            </>
          )}
        </button>
      </form>
    </div>
  );
}
