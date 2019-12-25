# Wizard Form 🧙‍♂️

This package was created to make step-by-step forms easier... I hope so

## Installation

To install breadcrumbs from Panenco's registry follow next steps:

1. Create `.npmrc` file with the next lines near to your `package.json` file you want to add this package to

```sh
registry=https://registry.npmjs.org/
@panenco:registry=https://npm.pkg.github.com
always-auth=true
```

2. Check `formik@^2.0.0` to be also installed as a `peerDependency`

## Usage

The main phylosopy of this wizard form is 'divide and conquer'. Therefore, step containers contain all needed properties for working. Idea is to keep all fields and step related data in the same place like: `Title`, `Validation`, `onSubmit`, `NoReturn`.

### Create your step containers

There are couple different steps containers definitions examples below. For steps that send data independtly you can define class component method `onSubmit` or in functional components use hook [`useImperativeHandler`](https://reactjs.org/docs/hooks-reference.html#useimperativehandle) in combination with `forwardRef` for exposing methods.

```javascript
import * as React from 'react';
import { Form } from 'formik';
import Field from '@panenco/formik-form-field';
import { PrimaryButton, TextInput, SelectInput } from '@panenco/pui';

export const PhilosophersStone = () => {
  return (
    <Form>
      <Field name="firstName" placeholder="First name" component={TextInput} />
      <Field name="lastName" placeholder="Last name" component={TextInput} />
      <div>
        <PrimaryButton type="submit">Next</PrimaryButton>
      </div>
    </Form>
  );
};

const faculties = [
  { label: 'Gryffindor', value: 'Gryffindor' },
  { label: 'Hufflepuff', value: 'Hufflepuff' },
  { label: 'Ravenclaw', value: 'Ravenclaw' },
  { label: 'Slytherin', value: 'Slytherin' },
];

export const TheChamberOfSecrets = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    onSubmit: async (values, formikBag) => {
      await sayToHat(values, formikBag);
    },
  }));

  return (
    <Form>
      <Field name="faculty" placeholder="Faculty" component={SelectInput} options={faculties} />
      <div>
        <PrimaryButton type="submit">Make choice</PrimaryButton>
      </div>
    </Form>
  );
});

TheChamberOfSecrets.Title = 'The Chamber of Secrets';
TheChamberOfSecrets.Validation = Yup.object().required('You need to choose faculty');
TheChamberOfSecrets.NoReturn = true;

export class ThePrisonerOfAzkaban extends React.Component {
  static Title = 'The Prisoner of Azkaban';

  onSubmit = (...args) => {
    console.log(...args);
  };

  render() {
    return (
      <Form>
        <Field name="email" placeholder="Email" component={TextInput} />
        <div>
          <PrimaryButton type="submit">Submit</PrimaryButton>
        </div>
      </Form>
    );
  }
}
```

### Init `WizardForm`

`WizardForm` is a wrapper around `Formik`, so you need to pass props that are used to init formik form. For instance, `initialValues` is still required, but `onSubmit`- not (in case you have defined one as step container method, otherwise it will just do on step validation and do `next()`).

### `WizardBag`

There are couple props passed in `MagicalContext` and to all steps as props

```typescript
export interface WizardStepMeta {
  stepIndex: number;
  title: string;
  noReturn: boolean;
  touched: boolean;
}

export interface MagicalContext {
  currentStepIndex: number;
  stepsMeta: Array<WizardStepMeta>;
  next: (cb: () => void) => void;
  back: (cb: () => void) => void;
  toStep: (step: number, cb: () => void) => void;
  toFirstStep: () => void;
  toLastStep: () => void;
  setWizardState: (state: any | Function) => void;
  readonly wizardState: any;
}
```

Argument `cb: () => void` is a function that is called after internal `setState(..., cb)` of `WizardForm`. May be useful for React-Navigation.

### Rendering

There are couple ways to render current step.

#### 1. **Do nothing** will just render current step container and pass `MagicalBag` + `FormikBag` to it 🙃

```javascript
import * as React from 'react';
import { WizardForm } from '@panenco/formik-wizard-form';

import * as HarryPotterAnd from './steps';

const App = () => {
  return (
    <WizardForm
      initialValues={{
        firstName: '',
        lastName: '',
        faculty: null,
        email: '',
      }}
      steps={[
        HarryPotterAnd.PhilosophersStone,
        HarryPotterAnd.TheChamberOfSecrets,
        HarryPotterAnd.ThePrisonerOfAzkaban,
      ]}
    />
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

#### 2. Use function in `children` prop that receives 'ready to render' argument.

`children: (current: { step: React.ReactNode } & WizardStepMeta) => React.ReactNode`

```javascript
import * as React from 'react';
import { WizardForm } from '@panenco/formik-wizard-form';

import * as HarryPotterAnd from './steps';

const App = () => {
  return (
    <WizardForm
      initialValues={{
        firstName: '',
        lastName: '',
        faculty: null,
        email: '',
      }}
      steps={[
        HarryPotterAnd.PhilosophersStone,
        HarryPotterAnd.TheChamberOfSecrets,
        HarryPotterAnd.ThePrisonerOfAzkaban,
      ]}
    >
      {({ step }) => (
        <div>
          <h1>My Wizard Form</h1>
          <div>{step}</div>
        </div>
      )}
    </WizardForm>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

#### 3. Use `component` prop with same signature.

```javascript
import * as React from 'react';
import { WizardForm, useWizardContext } from '@panenco/formik-wizard-form';
import { SecondaryButton } from '@panenco/pui';

import * as HarryPotterAnd from './steps';

const Layout = ({ step }) => {
  const { toFirstStep } = useWizardContext();

  const handleClick = () => toFirstStep();

  return (
    <div>
      <h1>My Wizard Form</h1>
      <div>{step}</div>
      <div>
        <SecondaryButton type="button" onClick={handleClick}>
          Go to start
        </SecondaryButton>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <WizardForm
      initialValues={{
        firstName: '',
        lastName: '',
        faculty: null,
        email: '',
      }}
      steps={[
        HarryPotterAnd.PhilosophersStone,
        HarryPotterAnd.TheChamberOfSecrets,
        HarryPotterAnd.ThePrisonerOfAzkaban,
      ]}
      component={Layout}
    />
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

## Steps Track

If you need to do a steps 'trackline' this can be customly done using Wizard's `MagicalContext`.

```javascript
import * as React from 'react';
import { WizardForm, useWizardContext } from '@panenco/formik-wizard-form';

import * as HarryPotterAnd from './steps';

const WizardTrack = () => {
  const { currentStepIndex, stepsMeta, toStep } = useWizardContext();

  const handleStepClick = step => () => toStep(step);

  return (
    <div style={{ display: 'flex' }}>
      {stepsMeta.map((step, index) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {Boolean(index) && <div style={{ color: index <= currentStepIndex ? 'black' : 'grey' }}> - </div>}
            <button
              type="button"
              onClick={handleStepClick(index)}
              style={{ color: index <= currentStepIndex ? 'black' : 'grey' }}
            >
              [{step.title || `Step ${index}`}]
            </button>
          </div>
        );
      })}
    </div>
  );
};

const App = () => {
  return (
    <WizardForm
      initialValues={{
        firstName: '',
        lastName: '',
        faculty: null,
        email: '',
      }}
      steps={[
        HarryPotterAnd.PhilosophersStone,
        HarryPotterAnd.TheChamberOfSecrets,
        HarryPotterAnd.ThePrisonerOfAzkaban,
      ]}
    >
      {({ step }) => (
        <div>
          <h1>My Wizard Form</h1>
          <WizardTrack />
          <div>{step}</div>
        </div>
      )}
    </WizardForm>
  );
};
```

## To do List:

- React Native (with React-Navigation) usage
- Validation on 'fast travel' with `toStep`
- Fiels error to step return
- Add `isValid` to `stepsMeta` TBD
