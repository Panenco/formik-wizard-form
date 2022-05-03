import * as React from 'react';
import { Formik, FormikConfig, FormikHelpers, FormikProps } from 'formik';
import { object } from 'yup';

import { MagicalContext, WizardStepMeta } from './context';
import { isFunction } from './utils';

export interface WizardStepContainer<Values> {
  onSubmit?: (values?: Values, formikHelpers?: FormikHelpers<Values>) => void | Promise<any>;
  NoReturn?: boolean;
  Title?: React.ReactNode;
  Validation?: any | (() => any);
}

export type NavigatableStepMeta<Values> = {
  Step: React.ComponentType<any> & WizardStepContainer<Values>;
} & WizardStepMeta;

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface INavigatorConstructor<Values = any> {
  new (steps: NavigatableStepMeta<Values>[], initialStep: number): INavigator;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface INavigator {
  mount(goTo: (n: number, fromNavigator?: boolean) => void): void;

  unmount(): void;

  navigate(prevStepIndex: number, nextStepIndex: number): void;
}

export interface WizardProps<Values> extends FormikConfig<Values> {
  steps: (React.ComponentType<any> & WizardStepContainer<Values>)[];
  children?:
    | ((
        current: {
          step: React.ReactNode;
        } & WizardStepMeta,
      ) => React.ReactNode)
    | React.ReactNode;
  component?: React.ComponentType<any>;
  navigator?: INavigatorConstructor;
  initialStep?: number;
}

export interface WizardState {
  currentStep: number;
  magicState: any;
}

class HarryPotter<Values = any> extends React.Component<WizardProps<Values>, WizardState> {
  public stepRef: any;

  public stepsMeta: WizardStepMeta[];

  public navigator: INavigator;

  public static displayName = '🧙‍♂️WizardForm';

  constructor(props: WizardProps<Values>) {
    super(props);

    this.state = {
      currentStep: props.initialStep ?? 0,
      magicState: undefined,
    };

    this.stepRef = React.createRef();
    this.stepsMeta = this.createStepsMeta(props.steps);

    const { navigator: Navigator } = props;

    if (Navigator) {
      const {
        props: { steps },
        state: { currentStep },
        stepsMeta,
      } = this;

      const stepsData = steps.map((Step, i) => ({ Step, ...stepsMeta[i] }));

      this.navigator = new Navigator(stepsData, currentStep);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  createStepsMeta(steps: (React.ComponentType<any> & WizardStepContainer<Values>)[]) {
    return steps.map((Step, stepIndex) => ({
      stepIndex,
      title: Step.Title ?? '',
      noReturn: Step.NoReturn ?? false,
      touched: false,
    }));
  }

  componentDidUpdate(prevProps: WizardProps<Values>, prevState: WizardState): void {
    if (prevProps.steps !== this.props.steps || prevProps.steps.length !== this.props.steps.length) {
      this.stepsMeta = this.createStepsMeta(this.props.steps);
    }

    if (prevState.currentStep !== this.state.currentStep) {
      this.stepsMeta[prevState.currentStep].touched = true;
    }
  }

  componentDidMount(): void {
    this.navigator?.mount(this.toStepFromNavigator); // NAVIGATOR BACK BUTTON LISTENER
  }

  componentWillUnmount(): void {
    this.navigator?.unmount(); // NAVIGATOR LISTENER UNREGISTER
  }

  setWizardState = (state: any, cb?: () => void): void => {
    this.setState(
      (currentState) => ({
        magicState: isFunction(state) ? state(currentState.magicState) : { ...currentState.magicState, ...state },
      }),
      cb,
    );
  };

  isTransgressionAllowed(step: number): boolean {
    const { currentStep } = this.state;

    if (step < 0 || step >= this.props.steps.length) {
      console.error(`You can only go to steps 0 - ${this.props.steps.length}`);
      return false;
    }

    // Traveling back
    if (step < currentStep) {
      for (let i = step; i < currentStep; i += 1) {
        if (this.props.steps[i].NoReturn) {
          console.error('Transgression is prohibited over "point of no return"');
          return false;
        }
      }
    } else {
      // Traveling forward
      for (let i = currentStep + 1; i <= step; i += 1) {
        if (this.props.steps[i && i - 1].NoReturn) {
          console.error('Transgression is prohibited over "point of no return"');
          return false;
        }
      }
    }

    return true;
  }

  toStep = (step: number): void => {
    const { currentStep } = this.state;

    if (step === currentStep || !this.isTransgressionAllowed(step)) return;

    this.setState(
      {
        currentStep: step,
      },
      () => {
        this.navigator?.navigate(currentStep, step);
      },
    );
  };

  toStepFromNavigator = (step: number): void => {
    const { currentStep } = this.state;

    if (step === currentStep || !this.isTransgressionAllowed(step)) return;

    this.setState({
      currentStep: step,
    });
  };

  toFirstStep = (): void => this.toStep(0);

  toLastStep = (): void => this.toStep(this.props.steps.length - 1);

  next = (): void => {
    const { currentStep: prevStep } = this.state;

    this.setState(
      (state) => ({
        currentStep: state.currentStep + 1 < this.props.steps.length ? state.currentStep + 1 : state.currentStep,
      }),
      () => {
        this.navigator?.navigate(prevStep, this.state.currentStep);
      },
    );
  };

  back = (): void => {
    const { currentStep } = this.state;
    this.toStep(currentStep - 1);
  };

  onSubmit = async (values: Values, formikBag: FormikHelpers<Values>): Promise<void> => {
    if (this.stepRef.current?.onSubmit) {
      await this.stepRef.current.onSubmit(values, formikBag);
    }
    if (this.state.currentStep + 1 < this.props.steps.length) {
      this.next();
    } else if (this.props.onSubmit) {
      await this.props.onSubmit(values, formikBag);
    }
  };

  onReset = (): void => {
    this.stepsMeta = this.createStepsMeta(this.props.steps);
    this.setState({
      currentStep: 0,
      magicState: undefined,
    });
  };

  render(): React.ReactElement {
    const { currentStep, magicState } = this.state;

    const { onSubmit, children, component, steps, ...props } = this.props;

    const { next, back, toStep, toFirstStep, toLastStep, stepRef: ref, setWizardState, stepsMeta } = this;

    const magicBag = {
      currentStepIndex: currentStep,
      stepsMeta,
      setWizardState,
      next, // TO BE REMOVED
      back,
      toStep,
      toFirstStep,
      toLastStep,
      get wizardState() {
        return magicState;
      },
    };

    const currentValidationSchema = steps[currentStep].Validation || object();

    return (
      <MagicalContext.Provider value={magicBag}>
        <Formik
          onSubmit={this.onSubmit}
          onReset={this.onReset}
          validationSchema={currentValidationSchema}
          enableReinitialize
          {...props}
        >
          {(formikBag: FormikProps<Values>): React.ReactNode => {
            const currentStepElement = React.createElement(steps[currentStep], { ref, ...magicBag, ...formikBag });

            if (component) {
              return React.createElement(component, {
                step: currentStepElement,
                ...stepsMeta[currentStep],
              });
            }

            if (children) {
              return isFunction(children)
                ? children({ step: currentStepElement, ...stepsMeta[currentStep] })
                : children;
            }

            return currentStepElement;
          }}
        </Formik>
      </MagicalContext.Provider>
    );
  }
}

export default HarryPotter;
