import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { StepRendererProps } from '../types';

export function YesNoStep({ step, state, index, onChange }: StepRendererProps) {
  const toggle = (answer: 'yes' | 'no') =>
    onChange({ answer: state.answer === answer ? null : answer, comment: '' });

  return (
    <div className={cn(
      'rounded-lg border p-3 flex flex-col gap-2.5 transition-colors',
      state.answer === 'yes' ? 'border-green-700 bg-green-900/30'
      : state.answer === 'no'  ? 'border-red-700 bg-red-900/30'
      :                           'border-slate-700 bg-slate-800',
    )}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Step {index + 1}
      </span>
      <div className="flex items-start gap-2 -mt-1">
        <HelpCircle className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] font-medium text-slate-200 leading-snug">{step.text}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toggle('yes')}
          className={cn(
            'flex-1 rounded-lg border py-1.5 text-xs font-semibold cursor-pointer transition-colors',
            state.answer === 'yes'
              ? 'border-green-500 bg-green-600 text-white'
              : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-green-700 hover:bg-green-900/40 hover:text-green-300',
          )}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => toggle('no')}
          className={cn(
            'flex-1 rounded-lg border py-1.5 text-xs font-semibold cursor-pointer transition-colors',
            state.answer === 'no'
              ? 'border-red-500 bg-red-600 text-white'
              : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-red-700 hover:bg-red-900/40 hover:text-red-300',
          )}
        >
          No
        </button>
      </div>
      {state.answer === 'no' && (
        <input
          type="text"
          value={state.comment}
          onChange={e => onChange({ comment: e.target.value })}
          placeholder="What was confusing or missing? (optional)"
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
      )}
    </div>
  );
}
