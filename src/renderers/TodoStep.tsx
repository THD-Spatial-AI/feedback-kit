import React from 'react';
import { cn } from '../lib/utils';
import type { StepRendererProps } from '../types';

export function TodoStep({ step, state, index, onChange }: StepRendererProps) {
  const toggle = (status: 'done' | 'couldnt_finish') =>
    onChange({ status: state.status === status ? 'pending' : status });

  return (
    <div className={cn(
      'rounded-lg border p-3 flex flex-col gap-2.5 transition-colors',
      state.status === 'done'            ? 'border-green-700 bg-green-900/30'
      : state.status === 'couldnt_finish' ? 'border-red-700 bg-red-900/30'
      :                                     'border-slate-700 bg-slate-800',
    )}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Step {index + 1}
      </span>
      <p className={cn(
        'text-[12px] leading-snug -mt-1',
        state.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200',
      )}>
        {step.text}
      </p>
      <p className="text-[11px] font-medium text-slate-500">Were you able to complete this?</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toggle('done')}
          className={cn(
            'flex-1 rounded-lg border py-1.5 text-xs font-semibold cursor-pointer transition-colors',
            state.status === 'done'
              ? 'border-green-500 bg-green-600 text-white'
              : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-green-700 hover:bg-green-900/40 hover:text-green-300',
          )}
        >
          Yes, done ✓
        </button>
        <button
          type="button"
          onClick={() => toggle('couldnt_finish')}
          className={cn(
            'flex-1 rounded-lg border py-1.5 text-xs font-semibold cursor-pointer transition-colors',
            state.status === 'couldnt_finish'
              ? 'border-red-500 bg-red-600 text-white'
              : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-red-700 hover:bg-red-900/40 hover:text-red-300',
          )}
        >
          No, I couldn't
        </button>
      </div>
      {state.status === 'couldnt_finish' && (
        <textarea
          rows={2}
          value={state.comment}
          onChange={e => onChange({ comment: e.target.value })}
          placeholder="What went wrong, or what stopped you?"
          className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
      )}
    </div>
  );
}
