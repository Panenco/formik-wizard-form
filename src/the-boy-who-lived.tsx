import * as React from 'react';
import { FormikConfig, FormikHelpers, Formik } from 'formik';
import { object } from 'yup';

import { MagicalContext, WizardStepMeta } from 'context';
import { isFunction } from 'utils';

export interface WizardStepContainer<Values> {
  onSubmit?: (values: Values, formikHelpers: FormikHelpers<Values>) => void | Promise<any>;
  NoReturn?: boolean;
  Title?: React.ReactNode;
  Validation?: any | (() => any);
}

export interface WizardProps<Values> extends FormikConfig<Values> {
  steps: (React.ComponentType<any> & WizardStepContainer<Values>)[];
  children?: (
    current: {
      step: React.ReactNode;
    } & WizardStepMeta,
  ) => React.ReactNode | React.ReactNode;
  component?: React.ComponentType<any>;
}

export interface WizardState {
  currentStep: number;
  magicState: any;
}

class HarryPotter<Values = any> extends React.Component<WizardProps<Values>, WizardState> {
  steps: any[];
  stepRef: any;
  stepsMeta: WizardStepMeta[];

  constructor(props: WizardProps<Values>) {
    super(props);
    this.state = {
      currentStep: 0,
      magicState: undefined,
    };

    this.stepRef = React.createRef();
    this.steps = props.steps;
    this.stepsMeta = this.steps.map((Step, stepIndex) => ({
      stepIndex,
      title: Step.Title ?? '',
      noReturn: Step.NoReturn ?? false,
      touched: false,
    }));
  }

  setWizardState = (state: any, cb?: () => void) => {
    this.setState(
      currentState => ({
        magicState: isFunction(state) ? state(currentState.magicState) : state,
      }),
      cb,
    );
  };

  // TODO: allow fast travel after reset, or modify handleReset
  toStep = (step: number, cb: () => void = () => {}) => {
    if (step < 0 || step >= this.steps.length) {
      console.error(`You can only go to steps 0 - ${this.steps.length}`);
      return;
    }

    const { currentStep } = this.state;

    if (step === currentStep) return;

    // Traveling back
    if (step < currentStep) {
      for (let i = step; i < currentStep; i += 1) {
        if (this.steps[i].NoReturn) {
          console.error(`Transgression is prohibited over "point of no return"`);
          return;
        }
      }
    } else {
      // Traveling forward
      for (let i = currentStep + 1; i <= step; i += 1) {
        if (this.steps[i && i - 1].NoReturn) {
          console.error(`Transgression is prohibited over "point of no return"`);
          return;
        }
      }
    }

    this.setState(state => {
      this.stepsMeta[state.currentStep].touched = true;
      return {
        currentStep: step,
      };
    }, cb);
  };

  toFirstStep = () => this.toStep(0);

  toLastStep = () => this.toStep(this.steps.length - 1);

  next = (cb: () => void = () => {}) => {
    this.setState(
      state => ({
        currentStep: state.currentStep + 1 < this.steps.length ? state.currentStep + 1 : state.currentStep,
      }),
      cb,
    );
  };

  back = (cb: () => void = () => {}) => {
    const { currentStep } = this.state;
    this.toStep(currentStep - 1, cb);
  };

  onSubmit = async (values, formikBag) => {
    if (this.stepRef.current?.onSubmit) {
      try {
        await this.stepRef.current.onSubmit(values, formikBag);
      } catch (e) {
        return e;
      }
    }
    if (this.state.currentStep + 1 < this.steps.length) {
      this.next();
    } else if (!!this.props.onSubmit) {
      try {
        await this.props.onSubmit(values, formikBag);
      } catch (e) {
        return e;
      }
    }
  };

  render() {
    const { currentStep, magicState } = this.state;

    const { onSubmit, children, component, ...props } = this.props;

    const { next, back, toStep, toFirstStep, toLastStep, stepRef: ref, setWizardState, stepsMeta } = this;

    const magicBag = {
      currentStepIndex: currentStep,
      stepsMeta,
      setWizardState,
      next,
      back,
      toStep,
      toFirstStep,
      toLastStep,
      get wizardState() {
        return magicState;
      },
    };

    const currentValidationSchema = this.steps[currentStep].Validation || object();

    return (
      <MagicalContext.Provider value={magicBag}>
        <Formik onSubmit={this.onSubmit} validationSchema={currentValidationSchema} {...props}>
          {formikBag => {
            const currentStepElement = React.createElement(
              this.steps[currentStep],
              Object.assign({ ref }, magicBag, formikBag),
            );

            if (!!component) {
              return React.createElement(component, {
                step: currentStepElement,
                ...stepsMeta[currentStep],
              });
            }

            if (!!children) {
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

/*
  <Wizard
   initialValues={{}}
   steps=[Container, Container2, Container3]
  >
    {step => (
      <Layout>
        <WizardStepper />
        {step}
      </Layout>
    )}
  </Wizard>

  <Wizard
   initialValues={{}}
   steps=[Container, Contaiener2, Container3]
   component={Component}
  />

  <Wizard
   initialValues={{}}
   steps=[Container, Container2, Container3]
  />


  FirstStepContainer extends React.Component {
    static Validation = Yup.object();

    static Title = 'Title';

    static NoReturn = true;

    onSubmit = () => {}

    render() {
      return (<Form>...</Form>);
    }
  }

*/
