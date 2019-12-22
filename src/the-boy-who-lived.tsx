import * as React from 'react';
import { FormikConfig, FormikHelpers, Formik } from 'formik';
import { object } from 'yup';

import { MagicalContext } from 'context';
import { isFunction } from 'utils';

export interface WizardStepContainer<Values> {
  onSubmit?: (values: Values, formikHelpers: FormikHelpers<Values>) => void | Promise<any>;
  NoReturn?: boolean;
  Title?: React.ReactNode;
  Validation?: any | (() => any);
}

export interface WizardProps<Values> extends FormikConfig<Values> {
  steps: (React.ComponentType<any> & WizardStepContainer<Values>)[];
  children?: (step: React.ReactNode) => React.ReactNode | React.ReactNode;
  component?: React.ComponentType<any>;
}

export interface WizardState {
  currentStep: number;
  magicState: any;
}

class HarryPotter<Values = any> extends React.Component<WizardProps<Values>, WizardState> {
  steps: any[];
  stepRef: any;

  constructor(props: WizardProps<Values>) {
    super(props);
    this.state = {
      currentStep: 0,
      magicState: undefined,
    };

    this.stepRef = React.createRef();
    this.steps = props.steps;
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
      for (let i = step; i <= currentStep; i += 1) {
        if (this.steps[i].NoReturn) {
          console.error(`You can't do fast travel over "point of no return"`);
          return;
        }
      }
    } else {
      // Traveling forward
      // TODO: validation check
      for (let i = currentStep; i <= step; i += 1) {
        if (this.steps[i && i - 1].NoReturn) {
          console.error(`You can't do fast travel over "point of no return"`);
          return;
        }
      }
    }

    this.setState(
      {
        currentStep: step,
      },
      cb,
    );
  };

  register = step => {
    this.steps.push(step);
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
    if (this.steps[currentStep && currentStep - 1].NoReturn) {
      console.error('You are trying to go back from "point of no return"');
      return;
    }

    this.setState(
      state => ({
        currentStep: state.currentStep > 0 ? state.currentStep - 1 : state.currentStep,
      }),
      cb,
    );
  };

  onSubmit = async (values, formikBag) => {
    if (this.stepRef.current.onSubmit) {
      try {
        await this.stepRef.current.onSubmit(values, formikBag);
      } catch (e) {
        return e;
      }
    }
    this.next();
  };

  render() {
    const { currentStep, magicState } = this.state;

    const { onSubmit, children, component, ...props } = this.props;

    const { register, next, back, toStep, toFirstStep, toLastStep, stepRef: ref, setWizardState } = this;

    const magicBag = {
      current: {
        step: currentStep,
        meta: {
          title: this.steps[currentStep].Title || null,
          noReturn: this.steps[currentStep].NoReturn || false,
        },
      },
      setWizardState,
      register,
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
              return React.createElement(component, { step: currentStepElement });
            }

            if (!!children) {
              return isFunction(children) ? children(currentStepElement) : children;
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
