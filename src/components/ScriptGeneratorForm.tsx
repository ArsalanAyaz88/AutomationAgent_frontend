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
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-8 space-y-8 shadow-xl transition-colors">
      <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Script Generation Parameters</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Customize the brief before sending it to the agent</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic - Required */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Topic <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., How to Learn Python in 30 Days"
            className="w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Word Count & Video Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Total Words
            </label>
            <input
              type="number"
              value={formData.total_words}
              onChange={(e) => setFormData({ ...formData, total_words: parseInt(e.target.value) })}
              min="100"
              step="100"
              className="w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Video Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.video_duration || ''}
              onChange={(e) => setFormData({ ...formData, video_duration: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Optional"
              min="1"
              max="60"
              className="w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Tone & Target Audience */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              className="w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              placeholder="e.g., beginners, professionals"
              className="w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Script Structure */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Script Structure
          </label>
          <select
            value={formData.script_structure}
            onChange={(e) => setFormData({ ...formData, script_structure: e.target.value })}
            className="w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="standard">Standard (Hook → Intro → Main → Climax → CTA)</option>
            <option value="story-based">Story-Based (Hook → Setup → Conflict → Journey → Resolution)</option>
            <option value="tutorial">Tutorial (Hook → Problem → Steps → Common Mistakes → Summary)</option>
            <option value="listicle">Listicle (Hook → Intro → List Items → Bonus → CTA)</option>
          </select>
        </div>

        {/* Include Hook & CTA */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-colors">
            <input
              type="checkbox"
              checked={formData.include_hook}
              onChange={(e) => setFormData({ ...formData, include_hook: e.target.checked })}
              className="mt-0.5 h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 dark:border-gray-600"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Include Hook (First 15s)</span>
          </label>
          <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-colors">
            <input
              type="checkbox"
              checked={formData.include_cta}
              onChange={(e) => setFormData({ ...formData, include_cta: e.target.checked })}
              className="mt-0.5 h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 dark:border-gray-600"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Include Call-to-Action</span>
          </label>
        </div>

        {/* Key Points */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                className="flex-1 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleAddKeyPoint}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.key_points.length > 0 && (
              <div className="space-y-2 mt-3">
                {formData.key_points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{point}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyPoint(index)}
                      className="text-red-500 hover:text-red-400 transition-colors"
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
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={formData.additional_instructions}
            onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
            placeholder="Any extra instructions or specific requirements..."
            rows={3}
            className="w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.topic.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
