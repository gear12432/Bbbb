import React, { useState, useEffect } from 'react';
import { Note, AIActionType } from '../types/note';
import { processWithAI } from '../services/aiService';
import { MarkdownViewer } from './MarkdownViewer';
import { Sparkles, X, Check, Copy, RefreshCw, ArrowRight, CornerDownLeft } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  actionType: AIActionType | 'custom';
  note: Note | null;
  onClose: () => void;
  onApplyResult: (newContent: string, mode: 'replace' | 'append', newTags?: string[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  actionType,
  note,
  onClose,
  onApplyResult,
  onShowToast,
}) => {
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [targetTone, setTargetTone] = useState('Professional');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && note) {
      setResultText('');
      setGeneratedTags([]);
      setCustomPrompt('');
      if (actionType !== 'custom' && actionType !== 'translate' && actionType !== 'change_tone') {
        runAiAction(actionType);
      }
    }
  }, [isOpen, actionType, note?.id]);

  if (!isOpen || !note) return null;

  const runAiAction = async (action: AIActionType | 'custom') => {
    setLoading(true);
    setResultText('');

    const res = await processWithAI({
      action,
      text: note.content,
      title: note.title,
      customInstruction: customPrompt,
      targetLanguage,
      targetTone,
    });

    setLoading(false);

    if (res.error) {
      onShowToast(res.error, 'error');
      return;
    }

    if (res.tags) {
      setGeneratedTags(res.tags);
    }

    if (res.result) {
      setResultText(res.result);
    }
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'summarize':
        return 'AI Key Summary';
      case 'improve':
        return 'Improve Writing & Flow';
      case 'fix_grammar':
        return 'Fix Spelling & Grammar';
      case 'continue':
        return 'Continue Writing Note';
      case 'outline':
        return 'Generate Topic Outline';
      case 'auto_tag':
        return 'Auto-Generate Tags';
      case 'translate':
        return 'Translate Note';
      case 'change_tone':
        return 'Adjust Writing Tone';
      case 'custom':
        return 'Custom AI Assistant Prompt';
      default:
        return 'AI Assistant';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText || generatedTags.map((t) => `#${t}`).join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {getActionTitle()}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by server-side Gemini 3.8 Flash AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options for Custom / Translate / Tone */}
        {(actionType === 'custom' || actionType === 'translate' || actionType === 'change_tone') && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 shrink-0">
            {actionType === 'custom' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom AI Instruction:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runAiAction('custom')}
                    placeholder="e.g. Turn this note into an email, add a conclusion..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                  <button
                    onClick={() => runAiAction('custom')}
                    disabled={!customPrompt.trim()}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg shrink-0"
                  >
                    Generate
                  </button>
                </div>
              </div>
            )}

            {actionType === 'translate' && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Language:
                </span>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Chinese">Chinese (Simplified)</option>
                  <option value="Portuguese">Portuguese</option>
                </select>
                <button
                  onClick={() => runAiAction('translate')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shrink-0"
                >
                  Translate Note
                </button>
              </div>
            )}

            {actionType === 'change_tone' && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Desired Tone:
                </span>
                <select
                  value={targetTone}
                  onChange={(e) => setTargetTone(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="Professional & Business">Professional & Business</option>
                  <option value="Casual & Friendly">Casual & Friendly</option>
                  <option value="Concise & Direct">Concise & Direct</option>
                  <option value="Persuasive & Enthusiastic">Persuasive & Enthusiastic</option>
                  <option value="Academic & Formal">Academic & Formal</option>
                </select>
                <button
                  onClick={() => runAiAction('change_tone')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shrink-0"
                >
                  Rewrite Note
                </button>
              </div>
            )}
          </div>
        )}

        {/* Output Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[160px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <Sparkles className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 animate-pulse">
                Gemini AI is analyzing and generating response...
              </p>
            </div>
          ) : resultText ? (
            <MarkdownViewer content={resultText} />
          ) : generatedTags.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Suggested Tags:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {generatedTags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 rounded-lg"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-10">
              Click generate to see AI response...
            </p>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => runAiAction(actionType)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!resultText && generatedTags.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>

            {generatedTags.length > 0 ? (
              <button
                onClick={() => {
                  onApplyResult(note.content, 'append', generatedTags);
                  onClose();
                  onShowToast('Added AI generated tags!', 'success');
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Tags</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onApplyResult(resultText, 'append');
                    onClose();
                    onShowToast('Appended AI content to note', 'success');
                  }}
                  disabled={!resultText}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-all"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Append to Note</span>
                </button>

                <button
                  onClick={() => {
                    onApplyResult(resultText, 'replace');
                    onClose();
                    onShowToast('Replaced note with AI result', 'success');
                  }}
                  disabled={!resultText}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg shadow-sm transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Replace Note</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
