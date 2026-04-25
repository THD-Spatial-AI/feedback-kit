import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, ChevronRight, ChevronLeft,
  CheckCircle2, Bug, Monitor, ImagePlus, Trash2, Send,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { defaultStepRenderers } from '../renderers';
import { useFeedbackKitContext } from '../context/FeedbackKitProvider';
import type {
  TestingTask, StepState, StepRendererMap, StepType, SubtaskResult,
} from '../types';

// ─── Internal types ───────────────────────────────────────────────────────────

interface ScreenshotData {
  name:     string;
  data:     string;
  mimeType: string;
  preview:  string;
}

type PanelView = 'task' | 'report' | 'report_done';

export interface SessionPanelProps {
  tasks:             TestingTask[];
  view:              string;
  taskIndex:         number;
  collapsed:         boolean;
  onToggleCollapsed: () => void;
  onNextTask:        () => void;
  onPrevTask:        () => void;
  apiEndpoint?:      string;
  stepRenderers?:    StepRendererMap;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initStepStates(count: number): StepState[] {
  return Array.from({ length: count }, () => ({
    status: 'pending', comment: '', response: '', answer: null, rating: null,
  }));
}

function deriveRating(states: StepState[], types: StepType[]): number {
  const ratingVals = types
    .map((t, i) => t === 'rating' ? states[i].rating : null)
    .filter((v): v is number => v !== null);
  if (ratingVals.length > 0) {
    const avg = ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length;
    return Math.round(6 - avg);
  }
  const todos = types.map((t, i) => t === 'todo' ? states[i] : null).filter(Boolean) as StepState[];
  if (todos.length === 0) return 3;
  const done  = todos.filter(s => s.status === 'done').length;
  const ratio = done / todos.length;
  if (ratio >= 1)   return 1;
  if (ratio >= 0.6) return 2;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 4;
  return 5;
}

async function captureScreen(): Promise<string> {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 1 }, audio: false });
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    const cleanup = () => { stream.getTracks().forEach(t => t.stop()); video.srcObject = null; };
    const track = stream.getVideoTracks()[0];
    track?.addEventListener('ended', () => { cleanup(); reject(new DOMException('ended', 'AbortError')); }, { once: true });
    video.onloadedmetadata = () => video.play();
    video.onplaying = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')!.drawImage(video, 0, 0);
      cleanup();
      resolve(canvas.toDataURL('image/png'));
    };
    video.onerror = (e) => { cleanup(); reject(e); };
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const darkTextarea = 'w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-[12px] text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none resize-none';

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionPanel({
  tasks,
  view,
  taskIndex,
  collapsed,
  onToggleCollapsed,
  onNextTask,
  onPrevTask,
  apiEndpoint:   propEndpoint,
  stepRenderers: propRenderers,
}: SessionPanelProps) {
  const ctx         = useFeedbackKitContext();
  const apiEndpoint = propEndpoint  ?? ctx?.apiEndpoint  ?? '/api/feedback';
  const renderers   = propRenderers ?? ctx?.stepRenderers ?? defaultStepRenderers;

  const allDone = taskIndex >= tasks.length;
  const task    = allDone ? null : tasks[taskIndex];

  const [panelView,   setPanelView]   = useState<PanelView>('task');
  const [stepStates,  setStepStates]  = useState<StepState[]>(task ? initStepStates(task.steps.length) : []);
  const [taskComment, setTaskComment] = useState('');
  const [reportText,  setReportText]  = useState('');
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>([]);
  const [capturing,   setCapturing]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setStepStates(initStepStates(task.steps.length));
      setTaskComment('');
      setPanelView('task');
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIndex]);

  const updateStep = (i: number, patch: Partial<StepState>) =>
    setStepStates(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));

  // ── Session submission ────────────────────────────────────────────────────

  const submitSession = async () => {
    if (!task) return;
    const hasInteraction = stepStates.some((s, i) => {
      const type = task.steps[i].type;
      if (type === 'todo')     return s.status !== 'pending';
      if (type === 'question') return s.response.trim() !== '';
      if (type === 'yesno')    return s.answer !== null;
      if (type === 'rating')   return s.rating !== null;
      return false;
    }) || taskComment.trim() !== '';
    if (!hasInteraction) return;

    const types = task.steps.map(s => s.type);
    const subtaskResults: SubtaskResult[] = stepStates.map((s, i) => {
      const { type, text } = task.steps[i];
      if (type === 'todo')     return { type, step: text, status: s.status, ...(s.comment ? { comment: s.comment } : {}) };
      if (type === 'question') return { type, step: text, response: s.response };
      if (type === 'rating')   return { type, step: text, rating: s.rating };
      return                          { type, step: text, answer: s.answer, ...(s.comment ? { comment: s.comment } : {}) };
    });

    const doneCount = stepStates.filter((s, i) => task.steps[i].type === 'todo' && s.status === 'done').length;
    const todoCount = task.steps.filter(s => s.type === 'todo').length;

    let payload = {
      goal:      `Task ${taskIndex + 1} — ${task.title}`,
      result:    todoCount > 0 ? `${doneCount} of ${todoCount} action steps completed.` : 'Observation task.',
      rating:    deriveRating(stepStates, types),
      view,      context: 'Session task completion',
      url:       window.location.href,
      timestamp: new Date().toISOString(),
      screenshots:    [],
      taskId:         task.id,
      taskTitle:      task.title,
      feedbackType:   'session' as const,
      subtaskResults,
      ...(taskComment.trim() ? { additionalComment: taskComment.trim() } : {}),
    };

    if (ctx?.onBeforeSubmit) payload = await ctx.onBeforeSubmit(payload) as typeof payload;

    try {
      const res = await fetch(apiEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (res.ok && ctx?.onSubmitSuccess) {
        const data = await res.json() as { issueNumber: number; issueUrl: string };
        ctx.onSubmitSuccess(data);
      }
    } catch (e) {
      ctx?.onSubmitError?.(e instanceof Error ? e : new Error(String(e)));
    }
  };

  const handleNext = () => { submitSession(); onNextTask(); };

  // ── Screenshot capture ────────────────────────────────────────────────────

  const handleCapture = async () => {
    setError(null); setCapturing(true);
    await new Promise(r => setTimeout(r, 120));
    try {
      const preview = await captureScreen();
      setScreenshots(prev => [...prev, { name: `screenshot-${Date.now()}.png`, data: preview.split(',')[1], mimeType: 'image/png', preview }]);
    } catch { /* cancelled */ }
    finally { setCapturing(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const file of files) {
      try {
        const preview = await readFile(file);
        setScreenshots(prev => [...prev, { name: file.name, data: preview.split(',')[1], mimeType: file.type, preview }]);
      } catch { setError('Could not read file.'); }
    }
  };

  // ── Issue submission ──────────────────────────────────────────────────────

  const submitIssue = async () => {
    if (!reportText.trim()) return;
    setSubmitting(true); setError(null);
    let payload = {
      goal:      reportText.trim(),
      result:    reportText.trim(),
      rating:    4,
      view,
      context:   task ? `Task ${taskIndex + 1} — ${task.title}` : 'Post-session',
      url:       window.location.href,
      timestamp: new Date().toISOString(),
      screenshots: screenshots.map(({ name, data, mimeType }) => ({ name, data, mimeType })),
      taskId:       task?.id    ?? null,
      taskTitle:    task?.title ?? null,
      feedbackType: 'issue' as const,
    };
    if (ctx?.onBeforeSubmit) payload = await ctx.onBeforeSubmit(payload) as typeof payload;
    try {
      const res = await fetch(apiEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      if (ctx?.onSubmitSuccess) {
        const data = await res.json() as { issueNumber: number; issueUrl: string };
        ctx.onSubmitSuccess(data);
      }
      setPanelView('report_done');
      setReportText(''); setScreenshots([]);
    } catch { setError('Could not submit. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const closeReport = () => { setPanelView('task'); setReportText(''); setScreenshots([]); setError(null); };

  // ── Shell ─────────────────────────────────────────────────────────────────

  const shell = (children: React.ReactNode, footer?: React.ReactNode) => (
    <>
      <button
        type="button"
        onClick={() => { if (collapsed) onToggleCollapsed(); setPanelView('report'); }}
        title={`Report an issue (current view: ${view})`}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-orange-700/40 bg-slate-900/90 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-orange-400 shadow-lg hover:bg-slate-800 hover:border-orange-600/60 cursor-pointer transition-colors"
      >
        <Bug className="size-3.5" /> Report an issue
      </button>

      <div className="fixed right-0 top-4 bottom-16 z-50 flex items-stretch">
        <div className={cn(
          'flex items-stretch h-full transition-transform duration-300 ease-in-out',
          collapsed ? 'translate-x-[320px]' : 'translate-x-0',
        )}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            title={collapsed ? 'Show tasks' : 'Hide tasks'}
            className="w-8 shrink-0 bg-slate-800 hover:bg-slate-700 border-y border-l border-slate-600 rounded-l-xl flex flex-col items-center justify-center gap-3 py-8 cursor-pointer transition-colors shadow-xl"
          >
            <ChevronLeft className={cn('size-3.5 text-slate-300 transition-transform duration-300', !collapsed && 'rotate-180')} />
            <span className="text-[13px] font-semibold text-slate-300 select-none"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Tasks
            </span>
          </button>

          <div className="w-80 bg-slate-900 border-y border-l border-slate-700 shadow-2xl flex flex-col h-full overflow-hidden">
            {children}
            {footer}
          </div>
        </div>
      </div>
    </>
  );

  // ── Header ────────────────────────────────────────────────────────────────

  const panelHeader = (
    <div className="shrink-0 px-4 pt-4 pb-0">
      {panelView === 'report' || panelView === 'report_done' ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="size-4 text-orange-400" />
            <span className="text-sm font-semibold text-white">Report an issue</span>
          </div>
          <button type="button" onClick={closeReport}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
            <ChevronLeft className="size-3.5" /> Back to tasks
          </button>
        </div>
      ) : allDone ? (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-slate-400" />
          <span className="text-sm font-semibold text-white">Session complete</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="size-3.5 text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Task {taskIndex + 1} of {tasks.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">{task!.timeEstimate}</span>
          </div>
          <p className="text-base font-bold text-white leading-snug">{task!.title}</p>
          <p className="text-[12px] text-slate-400 leading-snug">{task!.description}</p>
        </div>
      )}
    </div>
  );

  // ── Report form ───────────────────────────────────────────────────────────

  const reportBody = (
    <div className={cn('flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3', capturing && 'opacity-0 pointer-events-none')}>
      {panelView === 'report_done' ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle2 className="size-9 text-green-400" />
          <p className="text-sm font-semibold text-white">Issue reported</p>
          <p className="text-xs text-slate-400 leading-snug">Thank you — this has been logged and will be reviewed.</p>
          <button type="button" onClick={closeReport}
            className="rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 cursor-pointer transition-colors">
            Back to tasks
          </button>
        </div>
      ) : (
        <>
          <p className="text-[12px] text-slate-400 leading-snug">
            Describe what went wrong or what was confusing — no technical detail needed.
          </p>
          <textarea autoFocus rows={5} value={reportText} onChange={e => setReportText(e.target.value)}
            placeholder="e.g. I couldn't find where to enter the floor area…"
            className={darkTextarea}
          />
          {screenshots.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {screenshots.map((s, i) => (
                <div key={i} className="relative group rounded-md overflow-hidden border border-slate-700 aspect-video bg-slate-800">
                  <img src={s.preview} alt={`screenshot ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setScreenshots(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="size-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={handleCapture} disabled={capturing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-500 cursor-pointer transition-colors disabled:opacity-40">
              <Monitor className="size-3.5" />{capturing ? 'Select…' : 'Screenshot'}
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-600 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-500 cursor-pointer transition-colors">
              <ImagePlus className="size-3.5" />Upload
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleFileChange} />
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <button type="button" disabled={!reportText.trim() || submitting} onClick={submitIssue}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-primary/90 cursor-pointer transition-colors">
            {submitting ? <span className="animate-pulse">Sending…</span> : <><Send className="size-3.5" /> Submit issue</>}
          </button>
          {task && <p className="text-[10px] text-slate-600 truncate">📋 {task.title} · 📍 {view}</p>}
        </>
      )}
    </div>
  );

  // ── Task body ─────────────────────────────────────────────────────────────

  const taskBody = !task ? null : (
    <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 flex flex-col gap-3">
      <div className="border-t border-slate-700/60" />
      <div className="flex flex-col gap-3">
        {task.steps.map((step, i) => {
          const Renderer = renderers[step.type];
          if (!Renderer) return null;
          return (
            <Renderer
              key={i}
              step={step}
              state={stepStates[i] ?? { status: 'pending', comment: '', response: '', answer: null, rating: null }}
              index={i}
              onChange={patch => updateStep(i, patch)}
            />
          );
        })}
      </div>
      <div className="border-t border-slate-700/60 pt-3 flex flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Anything else?</p>
        <textarea rows={2} value={taskComment} onChange={e => setTaskComment(e.target.value)}
          placeholder="Optional comments or observations…"
          className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
      </div>
    </div>
  );

  // ── Footer ────────────────────────────────────────────────────────────────

  const taskFooter = (
    <div className="px-4 pb-4 flex flex-col gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1">
          {tasks.map((t, i) => (
            <div key={t.id} className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < taskIndex ? 'bg-slate-500' : i === taskIndex ? 'bg-slate-400' : 'bg-slate-700',
            )} />
          ))}
          <span className="ml-1.5 text-[10px] text-slate-600 shrink-0">{taskIndex + 1} / {tasks.length}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          {taskIndex > 0 && (
            <button type="button" onClick={onPrevTask} title="Previous task"
              className="flex items-center justify-center size-7 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200 cursor-pointer transition-colors">
              <ChevronLeft className="size-4" />
            </button>
          )}
          <button type="button" onClick={handleNext}
            className="flex items-center gap-1 rounded-lg bg-slate-200 hover:bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 cursor-pointer transition-colors">
            {taskIndex === tasks.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Done state ────────────────────────────────────────────────────────────

  const doneBody = (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-green-500/15">
        <CheckCircle2 className="size-7 text-green-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">All tasks complete</p>
        <p className="text-xs text-slate-400 leading-snug mt-1.5">
          Thank you — feel free to keep exploring. Use the{' '}
          <span className="text-orange-400 font-semibold">Report an issue</span>{' '}
          button if you spot anything worth noting.
        </p>
      </div>
    </div>
  );

  const activeBody = (() => {
    if (panelView === 'report' || panelView === 'report_done') return reportBody;
    if (allDone) return doneBody;
    return taskBody;
  })();

  const showFooter = panelView === 'task' && !allDone;
  return shell(<>{panelHeader}{activeBody}</>, showFooter ? taskFooter : undefined);
}
