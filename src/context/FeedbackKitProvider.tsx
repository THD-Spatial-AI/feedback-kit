import React, { createContext, useContext, useMemo } from 'react';
import type { FeedbackPayload, StepRendererMap, SubmitResult, WidgetConfig } from '../types';
import { defaultStepRenderers } from '../renderers';

export interface ResolvedTheme {
  position:     'bottom-right' | 'bottom-left';
  buttonLabel:  string;
  primaryColor?: string;
}

export interface FeedbackKitContextValue {
  apiEndpoint:      string;
  theme:            ResolvedTheme;
  stepRenderers:    StepRendererMap;
  onBeforeSubmit?:  (payload: FeedbackPayload) => FeedbackPayload | Promise<FeedbackPayload>;
  onSubmitSuccess?: (result: SubmitResult) => void;
  onSubmitError?:   (error: Error) => void;
}

export const FeedbackKitContext = createContext<FeedbackKitContextValue | null>(null);

export function useFeedbackKitContext(): FeedbackKitContextValue | null {
  return useContext(FeedbackKitContext);
}

interface FeedbackKitProviderProps {
  apiEndpoint:      string;
  theme?:           WidgetConfig;
  stepRenderers?:   StepRendererMap;
  onBeforeSubmit?:  FeedbackKitContextValue['onBeforeSubmit'];
  onSubmitSuccess?: FeedbackKitContextValue['onSubmitSuccess'];
  onSubmitError?:   FeedbackKitContextValue['onSubmitError'];
  children:         React.ReactNode;
}

export function FeedbackKitProvider({
  apiEndpoint,
  theme,
  stepRenderers,
  onBeforeSubmit,
  onSubmitSuccess,
  onSubmitError,
  children,
}: FeedbackKitProviderProps) {
  const value = useMemo<FeedbackKitContextValue>(() => ({
    apiEndpoint,
    theme: {
      position:     theme?.position     ?? 'bottom-right',
      buttonLabel:  theme?.buttonLabel  ?? 'Feedback',
      primaryColor: theme?.primaryColor ?? undefined,
    },
    stepRenderers:  stepRenderers ?? defaultStepRenderers,
    onBeforeSubmit,
    onSubmitSuccess,
    onSubmitError,
  }), [apiEndpoint, theme, stepRenderers, onBeforeSubmit, onSubmitSuccess, onSubmitError]);

  return (
    <FeedbackKitContext.Provider value={value}>
      {children}
    </FeedbackKitContext.Provider>
  );
}
