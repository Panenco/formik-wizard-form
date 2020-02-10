import { createContext, useContext, createElement } from 'react';

export interface WizardStepMeta {
  stepIndex: number;
  title: React.ReactNode;
  noReturn: boolean;
  touched: boolean;
}

export interface MagicalContext {
  currentStepIndex: number;
  stepsMeta: Array<WizardStepMeta>;
  next: () => void;
  back: () => void;
  toStep: (step: number) => void;
  toFirstStep: () => void;
  toLastStep: () => void;
  setWizardState: (state: any | Function) => void;
  readonly wizardState: any;
}

export const MagicalContext = createContext<MagicalContext>({
  currentStepIndex: 0,
  stepsMeta: [],
  next: () => {},
  back: () => {},
  toStep: () => {},
  toFirstStep: () => {},
  toLastStep: () => {},
  setWizardState: () => {},
  wizardState: null,
});

export const withWizardContext = <WrappedComponentProps = any>(
  Component: React.ComponentType<WrappedComponentProps>,
) => {
  const wizardProps = useContext(MagicalContext);

  return (props: WrappedComponentProps) => createElement(Component, { ...wizardProps, ...props });
};

export const useWizardContext = () => {
  return useContext(MagicalContext);
};
