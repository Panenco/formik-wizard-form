import { createContext, useContext, createElement } from 'react';

export interface MagicalContext {
  current: {
    step: number;
    meta?: any;
  };
  register: Function;
  next: Function;
  back: Function;
  toStep: Function;
  toFirstStep: Function;
  toLastStep: Function;
  setWizardState: Function;
  readonly wizardState: any;
}

export const MagicalContext = createContext<MagicalContext>({
  current: {
    step: 0,
    meta: {},
  },
  register: () => {},
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
