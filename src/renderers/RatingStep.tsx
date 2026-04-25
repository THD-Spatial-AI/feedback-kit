import React from 'react';
import { cn } from '../lib/utils';
import type { StepRendererProps } from '../types';

const RATING_COLORS = [
  { idle: 'border-red-800/60    bg-red-950/50    text-red-400',    active: 'border-red-500    bg-red-500    text-white' },
  { idle: 'border-orange-800/60 bg-orange-950/50 text-orange-400', active: 'border-orange-500 bg-orange-500 text-white' },
  { idle: 'border-amber-700/60  bg-amber-950/50  text-amber-400',  active: 'border-amber-400  bg-amber-400  text-white' },
  { idle: 'border-lime-800/60   bg-lime-950/50   text-lime-400',   active: 'border-lime-500   bg-lime-500   text-white' },
  { idle: 'border-green-800/60  bg-green-950/50  text-green-400',  active: 'border-green-500  bg-green-500  text-white' },
];

export function RatingStep({ step, state, index, onChange }: StepRendererProps) {
  return (
    <div className={cn(
      'rounded-lg border p-3 flex flex-col gap-2.5 transition-colors',
      state.rating !== null ? 'border-slate-600 bg-slate-700/50' : 'border-slate-700 bg-slate-800',
    )}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Step {index + 1}
      </span>
      <p className="text-[12px] font-medium text-slate-200 leading-snug -mt-1">{step.text}</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 justify-center">
          {[1, 2, 3, 4, 5].map((n) => {
            const col = RATING_COLORS[n - 1];
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ rating: state.rating === n ? null : n })}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg border text-xs font-bold cursor-pointer transition-all',
                  state.rating === n ? col.active : col.idle,
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
        {(step.lowLabel || step.highLabel) && (
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] text-red-500/70">{step.lowLabel}</span>
            <span className="text-[9px] text-green-500/70">{step.highLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
