import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { StepRendererProps } from '../types';

export function QuestionStep({ step, state, index, onChange }: StepRendererProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Step {index + 1}
      </span>
      <div className="flex items-start gap-2 -mt-1">
        <MessageSquare className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] font-medium text-slate-200 leading-snug">{step.text}</p>
      </div>
      <textarea
        rows={3}
        value={state.response}
        onChange={e => onChange({ response: e.target.value })}
        placeholder="Your answer…"
        className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-[12px] text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
      />
    </div>
  );
}
