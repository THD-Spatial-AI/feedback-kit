import { createContext, useMemo, useState, useRef, useEffect, useContext, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { MessageSquare, HelpCircle, Bug, ChevronLeft, CheckCircle2, ClipboardList, Trash2, Monitor, ImagePlus, Send, ChevronRight, MessageSquarePlus, X, Crop, Check } from 'lucide-react';

// src/context/FeedbackKitProvider.tsx
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function TodoStep({ step, state, index, onChange }) {
  const toggle = (status) => onChange({ status: state.status === status ? "pending" : status });
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "rounded-lg border p-3 flex flex-col gap-2.5 transition-colors",
    state.status === "done" ? "border-green-700 bg-green-900/30" : state.status === "couldnt_finish" ? "border-red-700 bg-red-900/30" : "border-slate-700 bg-slate-800"
  ), children: [
    /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-slate-500", children: [
      "Step ",
      index + 1
    ] }),
    /* @__PURE__ */ jsx("p", { className: cn(
      "text-[12px] leading-snug -mt-1",
      state.status === "done" ? "text-slate-500 line-through" : "text-slate-200"
    ), children: step.text }),
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-slate-500", children: "Were you able to complete this?" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => toggle("done"),
          className: cn(
            "flex-1 rounded-lg border py-1.5 text-xs font-semibold cursor-pointer transition-colors",
            state.status === "done" ? "border-green-500 bg-green-600 text-white" : "border-slate-600 bg-slate-700 text-slate-300 hover:border-green-700 hover:bg-green-900/40 hover:text-green-300"
          ),
          children: "Yes, done \u2713"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => toggle("couldnt_finish"),
          className: cn(
            "flex-1 rounded-lg border py-1.5 text-xs font-semibold cursor-pointer transition-colors",
            state.status === "couldnt_finish" ? "border-red-500 bg-red-600 text-white" : "border-slate-600 bg-slate-700 text-slate-300 hover:border-red-700 hover:bg-red-900/40 hover:text-red-300"
          ),
          children: "No, I couldn't"
        }
      )
    ] }),
    state.status === "couldnt_finish" && /* @__PURE__ */ jsx(
      "textarea",
      {
        rows: 2,
        value: state.comment,
        onChange: (e) => onChange({ comment: e.target.value }),
        placeholder: "What went wrong, or what stopped you?",
        className: "w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
      }
    )
  ] });
}
function QuestionStep({ step, state, index, onChange }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-700 bg-slate-800 p-3 flex flex-col gap-2", children: [
    /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-slate-500", children: [
      "Step ",
      index + 1
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 -mt-1", children: [
      /* @__PURE__ */ jsx(MessageSquare, { className: "size-3.5 text-slate-400 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] font-medium text-slate-200 leading-snug", children: step.text })
    ] }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        rows: 3,
        value: state.response,
        onChange: (e) => onChange({ response: e.target.value }),
        placeholder: "Your answer\u2026",
        className: "w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-[12px] text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
      }
    )
  ] });
}
function YesNoStep({ step, state, index, onChange }) {
  const toggle = (answer) => onChange({ answer: state.answer === answer ? null : answer, comment: "" });
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "rounded-lg border p-3 flex flex-col gap-2.5 transition-colors",
    state.answer === "yes" ? "border-green-700 bg-green-900/30" : state.answer === "no" ? "border-red-700 bg-red-900/30" : "border-slate-700 bg-slate-800"
  ), children: [
    /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-slate-500", children: [
      "Step ",
      index + 1
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 -mt-1", children: [
      /* @__PURE__ */ jsx(HelpCircle, { className: "size-3.5 text-slate-400 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] font-medium text-slate-200 leading-snug", children: step.text })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => toggle("yes"),
          className: cn(
            "flex-1 rounded-lg border py-1.5 text-xs font-semibold cursor-pointer transition-colors",
            state.answer === "yes" ? "border-green-500 bg-green-600 text-white" : "border-slate-600 bg-slate-700 text-slate-300 hover:border-green-700 hover:bg-green-900/40 hover:text-green-300"
          ),
          children: "Yes"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => toggle("no"),
          className: cn(
            "flex-1 rounded-lg border py-1.5 text-xs font-semibold cursor-pointer transition-colors",
            state.answer === "no" ? "border-red-500 bg-red-600 text-white" : "border-slate-600 bg-slate-700 text-slate-300 hover:border-red-700 hover:bg-red-900/40 hover:text-red-300"
          ),
          children: "No"
        }
      )
    ] }),
    state.answer === "no" && /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value: state.comment,
        onChange: (e) => onChange({ comment: e.target.value }),
        placeholder: "What was confusing or missing? (optional)",
        className: "w-full rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
      }
    )
  ] });
}
var RATING_COLORS = [
  { idle: "border-red-800/60    bg-red-950/50    text-red-400", active: "border-red-500    bg-red-500    text-white" },
  { idle: "border-orange-800/60 bg-orange-950/50 text-orange-400", active: "border-orange-500 bg-orange-500 text-white" },
  { idle: "border-amber-700/60  bg-amber-950/50  text-amber-400", active: "border-amber-400  bg-amber-400  text-white" },
  { idle: "border-lime-800/60   bg-lime-950/50   text-lime-400", active: "border-lime-500   bg-lime-500   text-white" },
  { idle: "border-green-800/60  bg-green-950/50  text-green-400", active: "border-green-500  bg-green-500  text-white" }
];
function RatingStep({ step, state, index, onChange }) {
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "rounded-lg border p-3 flex flex-col gap-2.5 transition-colors",
    state.rating !== null ? "border-slate-600 bg-slate-700/50" : "border-slate-700 bg-slate-800"
  ), children: [
    /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-slate-500", children: [
      "Step ",
      index + 1
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-[12px] font-medium text-slate-200 leading-snug -mt-1", children: step.text }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 justify-center", children: [1, 2, 3, 4, 5].map((n) => {
        const col = RATING_COLORS[n - 1];
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => onChange({ rating: state.rating === n ? null : n }),
            className: cn(
              "flex size-8 items-center justify-center rounded-lg border text-xs font-bold cursor-pointer transition-all",
              state.rating === n ? col.active : col.idle
            ),
            children: n
          },
          n
        );
      }) }),
      (step.lowLabel || step.highLabel) && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-0.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-red-500/70", children: step.lowLabel }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-green-500/70", children: step.highLabel })
      ] })
    ] })
  ] });
}

// src/renderers/index.ts
var defaultStepRenderers = {
  todo: TodoStep,
  question: QuestionStep,
  yesno: YesNoStep,
  rating: RatingStep
};
var FeedbackKitContext = createContext(null);
function useFeedbackKitContext() {
  return useContext(FeedbackKitContext);
}
function FeedbackKitProvider({
  apiEndpoint,
  theme,
  stepRenderers,
  onBeforeSubmit,
  onSubmitSuccess,
  onSubmitError,
  children
}) {
  const value = useMemo(() => ({
    apiEndpoint,
    theme: {
      position: theme?.position ?? "bottom-right",
      buttonLabel: theme?.buttonLabel ?? "Feedback",
      primaryColor: theme?.primaryColor ?? void 0
    },
    stepRenderers: stepRenderers ?? defaultStepRenderers,
    onBeforeSubmit,
    onSubmitSuccess,
    onSubmitError
  }), [apiEndpoint, theme, stepRenderers, onBeforeSubmit, onSubmitSuccess, onSubmitError]);
  return /* @__PURE__ */ jsx(FeedbackKitContext.Provider, { value, children });
}
function initStepStates(count) {
  return Array.from({ length: count }, () => ({
    status: "pending",
    comment: "",
    response: "",
    answer: null,
    rating: null
  }));
}
function deriveRating(states, types) {
  const ratingVals = types.map((t, i) => t === "rating" ? states[i].rating : null).filter((v) => v !== null);
  if (ratingVals.length > 0) {
    const avg = ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length;
    return Math.round(6 - avg);
  }
  const todos = types.map((t, i) => t === "todo" ? states[i] : null).filter(Boolean);
  if (todos.length === 0) return 3;
  const done = todos.filter((s) => s.status === "done").length;
  const ratio = done / todos.length;
  if (ratio >= 1) return 1;
  if (ratio >= 0.6) return 2;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 4;
  return 5;
}
async function captureScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 1 }, audio: false });
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    const cleanup = () => {
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    };
    const track = stream.getVideoTracks()[0];
    track?.addEventListener("ended", () => {
      cleanup();
      reject(new DOMException("ended", "AbortError"));
    }, { once: true });
    video.onloadedmetadata = () => video.play();
    video.onplaying = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      cleanup();
      resolve(canvas.toDataURL("image/png"));
    };
    video.onerror = (e) => {
      cleanup();
      reject(e);
    };
  });
}
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
var darkTextarea = "w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-[12px] text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none resize-none";
function SessionPanel({
  tasks,
  view,
  taskIndex,
  collapsed,
  onToggleCollapsed,
  onNextTask,
  onPrevTask,
  apiEndpoint: propEndpoint,
  stepRenderers: propRenderers,
  showReportButton: showReportButtonProp
}) {
  const ctx = useFeedbackKitContext();
  const apiEndpoint = propEndpoint ?? ctx?.apiEndpoint ?? "/api/feedback";
  const renderers = propRenderers ?? ctx?.stepRenderers ?? defaultStepRenderers;
  const showReportButton = showReportButtonProp ?? true;
  const allDone = taskIndex >= tasks.length;
  const task = allDone ? null : tasks[taskIndex];
  const [panelView, setPanelView] = useState("task");
  const [stepStates, setStepStates] = useState(task ? initStepStates(task.steps.length) : []);
  const [taskComment, setTaskComment] = useState("");
  const [reportText, setReportText] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  useEffect(() => {
    if (task) {
      setStepStates(initStepStates(task.steps.length));
      setTaskComment("");
      setPanelView("task");
      setError(null);
    }
  }, [taskIndex]);
  const updateStep = (i, patch) => setStepStates((prev) => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  const submitSession = async () => {
    if (!task) return;
    const hasInteraction = stepStates.some((s, i) => {
      const type = task.steps[i].type;
      if (type === "todo") return s.status !== "pending";
      if (type === "question") return s.response.trim() !== "";
      if (type === "yesno") return s.answer !== null;
      if (type === "rating") return s.rating !== null;
      return false;
    }) || taskComment.trim() !== "";
    if (!hasInteraction) return;
    const types = task.steps.map((s) => s.type);
    const subtaskResults = stepStates.map((s, i) => {
      const { type, text } = task.steps[i];
      if (type === "todo") return { type, step: text, status: s.status, ...s.comment ? { comment: s.comment } : {} };
      if (type === "question") return { type, step: text, response: s.response };
      if (type === "rating") return { type, step: text, rating: s.rating };
      return { type, step: text, answer: s.answer, ...s.comment ? { comment: s.comment } : {} };
    });
    const doneCount = stepStates.filter((s, i) => task.steps[i].type === "todo" && s.status === "done").length;
    const todoCount = task.steps.filter((s) => s.type === "todo").length;
    let payload = {
      goal: `Task ${taskIndex + 1} \u2014 ${task.title}`,
      result: todoCount > 0 ? `${doneCount} of ${todoCount} action steps completed.` : "Observation task.",
      rating: deriveRating(stepStates, types),
      view,
      context: "Session task completion",
      url: window.location.href,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      screenshots: [],
      taskId: task.id,
      taskTitle: task.title,
      feedbackType: "session",
      subtaskResults,
      ...taskComment.trim() ? { additionalComment: taskComment.trim() } : {}
    };
    if (ctx?.onBeforeSubmit) payload = await ctx.onBeforeSubmit(payload);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok && ctx?.onSubmitSuccess) {
        const data = await res.json();
        ctx.onSubmitSuccess(data);
      }
    } catch (e) {
      ctx?.onSubmitError?.(e instanceof Error ? e : new Error(String(e)));
    }
  };
  const handleNext = () => {
    submitSession();
    onNextTask();
  };
  const handleCapture = async () => {
    setError(null);
    setCapturing(true);
    await new Promise((r) => setTimeout(r, 120));
    try {
      const preview = await captureScreen();
      setScreenshots((prev) => [...prev, { name: `screenshot-${Date.now()}.png`, data: preview.split(",")[1], mimeType: "image/png", preview }]);
    } catch {
    } finally {
      setCapturing(false);
    }
  };
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) {
      try {
        const preview = await readFile(file);
        setScreenshots((prev) => [...prev, { name: file.name, data: preview.split(",")[1], mimeType: file.type, preview }]);
      } catch {
        setError("Could not read file.");
      }
    }
  };
  const submitIssue = async () => {
    if (!reportText.trim()) return;
    setSubmitting(true);
    setError(null);
    let payload = {
      goal: reportText.trim(),
      result: reportText.trim(),
      rating: 4,
      view,
      context: task ? `Task ${taskIndex + 1} \u2014 ${task.title}` : "Post-session",
      url: window.location.href,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      screenshots: screenshots.map(({ name, data, mimeType }) => ({ name, data, mimeType })),
      taskId: task?.id ?? null,
      taskTitle: task?.title ?? null,
      feedbackType: "issue"
    };
    if (ctx?.onBeforeSubmit) payload = await ctx.onBeforeSubmit(payload);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      if (ctx?.onSubmitSuccess) {
        const data = await res.json();
        ctx.onSubmitSuccess(data);
      }
      setPanelView("report_done");
      setReportText("");
      setScreenshots([]);
    } catch {
      setError("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const closeReport = () => {
    setPanelView("task");
    setReportText("");
    setScreenshots([]);
    setError(null);
  };
  const shell = (children, footer) => (
    // Outer: fixed column that owns the panel + button. Width = tab(2rem) + panel(20rem).
    // overflow:hidden clips the horizontal slide animation when collapsed.
    /* @__PURE__ */ jsxs("div", { style: {
      position: "fixed",
      right: 0,
      top: "1rem",
      bottom: "1rem",
      zIndex: 50,
      width: "22rem",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { flex: "1 1 0", minHeight: 0, display: "flex" }, children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "transition-transform duration-300 ease-in-out",
          style: {
            flex: "1 1 0",
            minHeight: 0,
            display: "flex",
            alignItems: "stretch",
            transform: collapsed ? "translateX(20rem)" : "translateX(0)"
          },
          children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: onToggleCollapsed,
                title: collapsed ? "Show tasks" : "Hide tasks",
                style: { flexShrink: 0, width: "2rem" },
                className: "bg-slate-800 hover:bg-slate-700 border-y border-l border-slate-600 rounded-l-xl flex flex-col items-center justify-center gap-3 py-8 cursor-pointer transition-colors shadow-xl",
                children: [
                  /* @__PURE__ */ jsx(ChevronLeft, { className: cn("size-3.5 text-slate-300 transition-transform duration-300", !collapsed && "rotate-180") }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "text-[13px] font-semibold text-slate-300 select-none",
                      style: { writingMode: "vertical-rl", transform: "rotate(180deg)" },
                      children: "Tasks"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "bg-slate-900 border-y border-l border-slate-700 shadow-2xl",
                style: { flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" },
                children: [
                  children,
                  footer
                ]
              }
            )
          ]
        }
      ) }),
      showReportButton && /* @__PURE__ */ jsx("div", { style: { flexShrink: 0, display: "flex", justifyContent: "flex-end", padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            if (collapsed) onToggleCollapsed();
            setPanelView("report");
          },
          title: `Report an issue (current view: ${view})`,
          className: "flex items-center gap-1.5 rounded-full border border-orange-700/40 bg-slate-900/90 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-orange-400 shadow-lg hover:bg-slate-800 hover:border-orange-600/60 cursor-pointer transition-colors",
          children: [
            /* @__PURE__ */ jsx(Bug, { className: "size-3.5" }),
            " Report an issue"
          ]
        }
      ) })
    ] })
  );
  const panelHeader = /* @__PURE__ */ jsx("div", { className: "shrink-0 px-4 pt-4 pb-0", style: { flexShrink: 0 }, children: panelView === "report" || panelView === "report_done" ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Bug, { className: "size-4 text-orange-400" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-white", children: "Report an issue" })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: closeReport,
        className: "flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer transition-colors",
        children: [
          /* @__PURE__ */ jsx(ChevronLeft, { className: "size-3.5" }),
          " Back to tasks"
        ]
      }
    )
  ] }) : allDone ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx(CheckCircle2, { className: "size-4 text-slate-400" }),
    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-white", children: "Session complete" })
  ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(ClipboardList, { className: "size-3.5 text-slate-500" }),
        /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wide", children: [
          "Task ",
          taskIndex + 1,
          " of ",
          tasks.length
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-slate-500", children: task.timeEstimate })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-base font-bold text-white leading-snug", children: task.title }),
    /* @__PURE__ */ jsx("p", { className: "text-[12px] text-slate-400 leading-snug", children: task.description })
  ] }) });
  const reportBody = /* @__PURE__ */ jsx("div", { className: cn("px-4 py-4 flex flex-col gap-3", capturing && "opacity-0 pointer-events-none"), style: { flex: "1 1 0%", minHeight: 0, overflowY: "auto" }, children: panelView === "report_done" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 py-8 text-center", children: [
    /* @__PURE__ */ jsx(CheckCircle2, { className: "size-9 text-green-400" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-white", children: "Issue reported" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-snug", children: "Thank you \u2014 this has been logged and will be reviewed." }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: closeReport,
        className: "rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 cursor-pointer transition-colors",
        children: "Back to tasks"
      }
    )
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("p", { className: "text-[12px] text-slate-400 leading-snug", children: "Describe what went wrong or what was confusing \u2014 no technical detail needed." }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        autoFocus: true,
        rows: 5,
        value: reportText,
        onChange: (e) => setReportText(e.target.value),
        placeholder: "e.g. I couldn't find where to enter the floor area\u2026",
        className: darkTextarea
      }
    ),
    screenshots.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1.5", children: screenshots.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "relative group rounded-md overflow-hidden border border-slate-700 aspect-video bg-slate-800", children: [
      /* @__PURE__ */ jsx("img", { src: s.preview, alt: `screenshot ${i + 1}`, className: "w-full h-full object-cover" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setScreenshots((prev) => prev.filter((_, idx) => idx !== i)),
          className: "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
          children: /* @__PURE__ */ jsx(Trash2, { className: "size-4 text-white" })
        }
      )
    ] }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: handleCapture,
          disabled: capturing,
          className: "flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-500 cursor-pointer transition-colors disabled:opacity-40",
          children: [
            /* @__PURE__ */ jsx(Monitor, { className: "size-3.5" }),
            capturing ? "Select\u2026" : "Screenshot"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => fileRef.current?.click(),
          className: "flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-600 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-500 cursor-pointer transition-colors",
          children: [
            /* @__PURE__ */ jsx(ImagePlus, { className: "size-3.5" }),
            "Upload"
          ]
        }
      ),
      /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: "image/png,image/jpeg,image/webp", multiple: true, className: "hidden", onChange: handleFileChange })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-400", children: error }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        disabled: !reportText.trim() || submitting,
        onClick: submitIssue,
        className: "flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-primary/90 cursor-pointer transition-colors",
        children: submitting ? /* @__PURE__ */ jsx("span", { className: "animate-pulse", children: "Sending\u2026" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Send, { className: "size-3.5" }),
          " Submit issue"
        ] })
      }
    ),
    task && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-600 truncate", children: [
      "\u{1F4CB} ",
      task.title,
      " \xB7 \u{1F4CD} ",
      view
    ] })
  ] }) });
  const taskBody = !task ? null : /* @__PURE__ */ jsxs("div", { className: "px-4 pt-3 pb-4 flex flex-col gap-3", style: { flex: "1 1 0%", minHeight: 0, overflowY: "auto" }, children: [
    /* @__PURE__ */ jsx("div", { className: "border-t border-slate-700/60" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: task.steps.map((step, i) => {
      const Renderer = renderers[step.type];
      if (!Renderer) return null;
      return /* @__PURE__ */ jsx(
        Renderer,
        {
          step,
          state: stepStates[i] ?? { status: "pending", comment: "", response: "", answer: null, rating: null },
          index: i,
          onChange: (patch) => updateStep(i, patch)
        },
        i
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-slate-700/60 pt-3 flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-slate-500", children: "Anything else?" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          rows: 2,
          value: taskComment,
          onChange: (e) => setTaskComment(e.target.value),
          placeholder: "Optional comments or observations\u2026",
          className: "w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        }
      )
    ] })
  ] });
  const taskFooter = /* @__PURE__ */ jsx("div", { className: "px-4 pb-4 flex flex-col gap-2 shrink-0", style: { flexShrink: 0 }, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-1", children: [
      tasks.map((t, i) => /* @__PURE__ */ jsx("div", { className: cn(
        "h-1 flex-1 rounded-full transition-colors",
        i < taskIndex ? "bg-slate-500" : i === taskIndex ? "bg-slate-400" : "bg-slate-700"
      ) }, t.id)),
      /* @__PURE__ */ jsxs("span", { className: "ml-1.5 text-[10px] text-slate-600 shrink-0", children: [
        taskIndex + 1,
        " / ",
        tasks.length
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1 shrink-0", children: [
      taskIndex > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onPrevTask,
          title: "Previous task",
          className: "flex items-center justify-center size-7 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200 cursor-pointer transition-colors",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: handleNext,
          className: "flex items-center gap-1 rounded-lg bg-slate-200 hover:bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 cursor-pointer transition-colors",
          children: [
            taskIndex === tasks.length - 1 ? "Finish" : "Next",
            /* @__PURE__ */ jsx(ChevronRight, { className: "size-3.5" })
          ]
        }
      )
    ] })
  ] }) });
  const doneBody = /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-4 px-6 py-10 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "flex size-14 items-center justify-center rounded-full bg-green-500/15", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "size-7 text-green-400" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-white", children: "All tasks complete" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-snug mt-1.5", children: "Thank you \u2014 feel free to keep exploring." })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setPanelView("report"),
        className: "flex items-center gap-1.5 rounded-full border border-orange-700/40 px-3 py-1.5 text-xs font-semibold text-orange-400 hover:border-orange-600/60 hover:bg-slate-800 cursor-pointer transition-colors",
        children: [
          /* @__PURE__ */ jsx(Bug, { className: "size-3.5" }),
          " Report an issue"
        ]
      }
    )
  ] });
  const activeBody = (() => {
    if (panelView === "report" || panelView === "report_done") return reportBody;
    if (allDone) return doneBody;
    return taskBody;
  })();
  const showFooter = panelView === "task" && !allDone;
  return shell(/* @__PURE__ */ jsxs(Fragment, { children: [
    panelHeader,
    activeBody
  ] }), showFooter ? taskFooter : void 0);
}
function CropOverlay({ preview, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [start, setStart] = useState(null);
  const [dragging, setDragging] = useState(false);
  const toImageCoords = useCallback((clientX, clientY) => {
    const r = imgRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(clientX - r.left, r.width)),
      y: Math.max(0, Math.min(clientY - r.top, r.height))
    };
  }, []);
  const onMouseDown = (e) => {
    e.preventDefault();
    const pt = toImageCoords(e.clientX, e.clientY);
    setStart(pt);
    setSel(null);
    setDragging(true);
  };
  const onMouseMove = useCallback((e) => {
    if (!dragging || !start) return;
    const pt = toImageCoords(e.clientX, e.clientY);
    setSel({ x: Math.min(start.x, pt.x), y: Math.min(start.y, pt.y), w: Math.abs(pt.x - start.x), h: Math.abs(pt.y - start.y) });
  }, [dragging, start, toImageCoords]);
  const onMouseUp = useCallback(() => setDragging(false), []);
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);
  const cropAndConfirm = (cropRect) => {
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    if (cropRect && cropRect.w > 4 && cropRect.h > 4) {
      canvas.width = cropRect.w * scaleX;
      canvas.height = cropRect.h * scaleY;
      canvas.getContext("2d").drawImage(
        img,
        cropRect.x * scaleX,
        cropRect.y * scaleY,
        cropRect.w * scaleX,
        cropRect.h * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
    }
    const result = canvas.toDataURL("image/png");
    onConfirm({ name: `screenshot-${Date.now()}.png`, data: result.split(",")[1], mimeType: "image/png", preview: result });
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[100] flex flex-col bg-black/90", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between shrink-0 px-4 py-3 bg-slate-900 border-b border-slate-700", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-white", children: "Select area to crop" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: "Click and drag to select a region, then click Crop" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        sel && sel.w > 4 && sel.h > 4 && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => cropAndConfirm(sel),
            className: "flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 cursor-pointer transition-colors",
            children: [
              /* @__PURE__ */ jsx(Crop, { className: "size-3.5" }),
              " Crop selection"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => cropAndConfirm(null),
            className: "flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-600 cursor-pointer transition-colors",
            children: [
              /* @__PURE__ */ jsx(Check, { className: "size-3.5" }),
              " Use full screenshot"
            ]
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onCancel, className: "text-slate-400 hover:text-white cursor-pointer ml-1", children: /* @__PURE__ */ jsx(X, { className: "size-5" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative flex flex-1 items-center justify-center overflow-hidden p-6 select-none", children: /* @__PURE__ */ jsxs("div", { className: "relative", onMouseDown, style: { cursor: "crosshair" }, children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          ref: imgRef,
          src: preview,
          alt: "captured screenshot",
          className: "max-w-full max-h-[calc(100vh-120px)] rounded shadow-2xl block",
          draggable: false
        }
      ),
      sel && sel.w > 2 && sel.h > 2 && /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0 pointer-events-none", width: "100%", height: "100%", children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("mask", { id: "crop-mask", children: [
          /* @__PURE__ */ jsx("rect", { width: "100%", height: "100%", fill: "white" }),
          /* @__PURE__ */ jsx("rect", { x: sel.x, y: sel.y, width: sel.w, height: sel.h, fill: "black" })
        ] }) }),
        /* @__PURE__ */ jsx("rect", { width: "100%", height: "100%", fill: "rgba(0,0,0,0.55)", mask: "url(#crop-mask)" }),
        /* @__PURE__ */ jsx("rect", { x: sel.x, y: sel.y, width: sel.w, height: sel.h, fill: "none", stroke: "#3b82f6", strokeWidth: "2", strokeDasharray: "6 3" }),
        [[sel.x, sel.y], [sel.x + sel.w, sel.y], [sel.x, sel.y + sel.h], [sel.x + sel.w, sel.y + sel.h]].map(([cx, cy], i) => /* @__PURE__ */ jsx("rect", { x: cx - 4, y: cy - 4, width: 8, height: 8, fill: "white", stroke: "#3b82f6", strokeWidth: "1.5", rx: "1" }, i)),
        /* @__PURE__ */ jsxs("text", { x: sel.x + sel.w / 2, y: sel.y - 6, textAnchor: "middle", fontSize: "11", fill: "white", style: { userSelect: "none" }, children: [
          Math.round(sel.w),
          " \xD7 ",
          Math.round(sel.h)
        ] })
      ] })
    ] }) })
  ] });
}
async function captureScreen2() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 1 }, audio: false });
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    const cleanup = () => {
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    };
    const track = stream.getVideoTracks()[0];
    track?.addEventListener("ended", () => {
      cleanup();
      reject(new DOMException("Screen share ended", "AbortError"));
    }, { once: true });
    video.onloadedmetadata = () => video.play();
    video.onplaying = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      cleanup();
      resolve(canvas.toDataURL("image/png"));
    };
    video.onerror = (e) => {
      cleanup();
      reject(e);
    };
  });
}
function readFile2(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
var RATING_OPTIONS = [
  { value: 1, label: "Very easy", emoji: "\u{1F60A}" },
  { value: 2, label: "Easy", emoji: "\u{1F642}" },
  { value: 3, label: "OK", emoji: "\u{1F610}" },
  { value: 4, label: "Difficult", emoji: "\u{1F615}" },
  { value: 5, label: "Blocked", emoji: "\u{1F624}" }
];
function FeedbackWidget({
  view,
  context = "",
  taskTrigger,
  onTaskTriggerConsumed,
  onSubmitted,
  apiEndpoint: propEndpoint
}) {
  const ctx = useFeedbackKitContext();
  const apiEndpoint = propEndpoint ?? ctx?.apiEndpoint ?? "/api/feedback";
  const buttonLabel = ctx?.theme.buttonLabel ?? "Feedback";
  const [step, setStep] = useState("closed");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState("");
  const [rating, setRating] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [cropPreview, setCropPreview] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const fileRef = useRef(null);
  useEffect(() => {
    if (!taskTrigger) return;
    setActiveTask(taskTrigger);
    setGoal(taskTrigger.prefillGoal);
    setResult("");
    setRating(null);
    setScreenshots([]);
    setError(null);
    setStep("goal");
    onTaskTriggerConsumed?.();
  }, [taskTrigger?.taskId]);
  const reset = () => {
    setStep("closed");
    setGoal("");
    setResult("");
    setRating(null);
    setScreenshots([]);
    setCropPreview(null);
    setError(null);
    setActiveTask(null);
  };
  const handleCapture = async () => {
    setError(null);
    setCapturing(true);
    await new Promise((r) => setTimeout(r, 120));
    try {
      const preview = await captureScreen2();
      setCropPreview(preview);
    } catch {
    } finally {
      setCapturing(false);
    }
  };
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) {
      try {
        const preview = await readFile2(file);
        setScreenshots((prev) => [...prev, { name: file.name, data: preview.split(",")[1], mimeType: file.type, preview }]);
      } catch {
        setError("Could not read one of the files.");
      }
    }
  };
  const submit = async () => {
    if (!goal.trim() || !result.trim() || rating === null) return;
    setLoading(true);
    setError(null);
    let payload = {
      goal: goal.trim(),
      result: result.trim(),
      rating,
      view,
      context,
      url: window.location.href,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      screenshots: screenshots.map(({ name, data, mimeType }) => ({ name, data, mimeType })),
      taskId: activeTask?.taskId ?? null,
      taskTitle: activeTask?.taskTitle ?? null,
      feedbackType: "issue"
    };
    if (ctx?.onBeforeSubmit) payload = await ctx.onBeforeSubmit(payload);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      if (ctx?.onSubmitSuccess) {
        const data = await res.json();
        ctx.onSubmitSuccess(data);
      }
      setStep("done");
      onSubmitted?.();
    } catch {
      setError("Could not send feedback. Please try again.");
      ctx?.onSubmitError?.(new Error("Feedback submission failed"));
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    cropPreview && /* @__PURE__ */ jsx(
      CropOverlay,
      {
        preview: cropPreview,
        onConfirm: (shot) => {
          setScreenshots((prev) => [...prev, shot]);
          setCropPreview(null);
        },
        onCancel: () => setCropPreview(null)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2", children: [
      step !== "closed" && /* @__PURE__ */ jsxs("div", { className: cn(
        "w-80 rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden transition-opacity duration-100",
        capturing ? "opacity-0 pointer-events-none" : "opacity-100"
      ), children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-slate-800 px-4 py-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(MessageSquarePlus, { className: "size-4 text-slate-300" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-white", children: "Share feedback" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: reset, className: "text-slate-400 hover:text-white transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(X, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-4", children: [
          step === "goal" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Step 1 of 4" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-800", children: "What were you trying to do?" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                autoFocus: true,
                rows: 3,
                value: goal,
                onChange: (e) => setGoal(e.target.value),
                placeholder: "e.g. I wanted to add a solar panel to the roof surface\u2026",
                className: "w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                disabled: !goal.trim(),
                onClick: () => setStep("result"),
                className: "flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-slate-700 cursor-pointer transition-colors",
                children: [
                  "Next ",
                  /* @__PURE__ */ jsx(ChevronRight, { className: "size-3.5" })
                ]
              }
            )
          ] }),
          step === "result" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Step 2 of 4" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-800", children: "What happened? What did you expect instead?" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                autoFocus: true,
                rows: 3,
                value: result,
                onChange: (e) => setResult(e.target.value),
                placeholder: "e.g. I couldn't find the install button\u2026",
                className: "w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setStep("goal"), className: "flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors", children: "Back" }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  disabled: !result.trim(),
                  onClick: () => setStep("rating"),
                  className: "flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-slate-700 cursor-pointer transition-colors",
                  children: [
                    "Next ",
                    /* @__PURE__ */ jsx(ChevronRight, { className: "size-3.5" })
                  ]
                }
              )
            ] })
          ] }),
          step === "rating" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Step 3 of 4" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-800", children: "How difficult was this task overall?" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-1", children: RATING_OPTIONS.map((opt) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setRating(opt.value),
                title: opt.label,
                className: cn(
                  "flex flex-col items-center gap-1 rounded-lg border py-2 text-lg transition-all cursor-pointer",
                  rating === opt.value ? "border-slate-700 bg-slate-800 shadow-sm scale-105" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                ),
                children: [
                  opt.emoji,
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-semibold text-slate-500 leading-none", children: opt.label })
                ]
              },
              opt.value
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setStep("result"), className: "flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors", children: "Back" }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  disabled: rating === null,
                  onClick: () => setStep("screenshot"),
                  className: "flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-slate-700 cursor-pointer transition-colors",
                  children: [
                    "Next ",
                    /* @__PURE__ */ jsx(ChevronRight, { className: "size-3.5" })
                  ]
                }
              )
            ] })
          ] }),
          step === "screenshot" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Step 4 of 4 \xB7 Optional" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-800", children: "Add screenshots" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 leading-snug", children: "Capture your screen \u2014 you can crop to a specific area after." }),
            screenshots.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1.5", children: screenshots.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "relative group rounded-md overflow-hidden border border-slate-200 aspect-video bg-slate-100", children: [
              /* @__PURE__ */ jsx("img", { src: s.preview, alt: `screenshot ${i + 1}`, className: "w-full h-full object-cover" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setScreenshots((prev) => prev.filter((_, idx) => idx !== i)),
                  className: "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "size-4 text-white" })
                }
              )
            ] }, i)) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleCapture,
                  disabled: capturing,
                  className: "flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 cursor-pointer transition-colors disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsx(Monitor, { className: "size-4 text-slate-500" }),
                    capturing ? "Select window\u2026" : screenshots.length > 0 ? "Capture another" : "Capture screen"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => fileRef.current?.click(),
                  className: "flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(ImagePlus, { className: "size-4 text-slate-400" }),
                    screenshots.length > 0 ? "Upload more" : "Upload images"
                  ]
                }
              ),
              /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: "image/png,image/jpeg,image/webp", multiple: true, className: "hidden", onChange: handleFileChange })
            ] }),
            error && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-500", children: error }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setStep("rating"), className: "flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors", children: "Back" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  disabled: loading,
                  onClick: submit,
                  className: "flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-primary/90 cursor-pointer transition-colors",
                  children: loading ? /* @__PURE__ */ jsx("span", { className: "animate-pulse", children: "Sending\u2026" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Send, { className: "size-3.5" }),
                    screenshots.length > 0 ? `Send (${screenshots.length})` : "Send without"
                  ] })
                }
              )
            ] })
          ] }),
          step === "done" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 py-2 text-center", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "size-10 text-green-500" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-800", children: "Thank you!" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 leading-snug", children: "Your feedback has been recorded and will help us improve the tool." }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: reset, className: "rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors", children: "Close" })
          ] })
        ] }),
        step !== "done" && /* @__PURE__ */ jsx("div", { className: "border-t border-slate-100 bg-slate-50 px-4 py-2", children: activeTask ? /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 truncate", children: [
          "\u{1F4CB} ",
          activeTask.taskTitle,
          " \xB7 \u{1F4CD} ",
          view
        ] }) : /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 truncate", children: [
          "\u{1F4CD} ",
          view,
          context ? ` \u203A ${context}` : ""
        ] }) })
      ] }),
      step === "closed" && !capturing && /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setStep("goal"),
          className: "flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-700 cursor-pointer transition-all hover:scale-105",
          children: [
            /* @__PURE__ */ jsx(MessageSquarePlus, { className: "size-4" }),
            buttonLabel
          ]
        }
      )
    ] })
  ] });
}

export { FeedbackKitProvider, FeedbackWidget, QuestionStep, RatingStep, SessionPanel, TodoStep, YesNoStep, defaultStepRenderers };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map