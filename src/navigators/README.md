# Navigators

`WizardForm` uses it's internal state for handling navigation between pages, so we can't use `history.back()` and `history.forward()` and naively navigate through the form.

That's why we introduce `Navigator` conception. Idea of `Navigator` is to implement same interface for different navigation strategies like (`react-router`, `react-navigation` and etc).

Here is the interface you need to implement in order to make your custom navigator to work with `FormikWizardForm`.

```javascript
type NavigatableStepMeta<Values> = {
  Step: React.ComponentType<any> & WizardStepContainer<Values>,
} & WizardStepMeta;

interface INavigatorConstructor<Values = any> {
  new(steps: NavigatableStepMeta<Values>[], initialStep: number): INavigator;
}

interface INavigator {
  mount(goTo: (n: number, fromNavigator?: boolean) => void): void;
  unmount(): void;
  navigate(prevStepIndex: number, nextStepIndex: number): void;
}
```

Internally, `FormikWizardForm` will create an instance of your navigator by passing all steps meta and initial step number to it's constructor. Also on `componentDidMount()` and `componentWillUnmount()` lifecycle methods it's own `mount()` and `unmount()` methods will be called. This methods may be needed for adding listenerd for `POP` event of `HTML5 History API`.

## React-Router history `Navigator`

We've already implemented strategy that uses hashes in urls for `react-router` and it can be used by importing it from this library sources.

### Usage

Next little snippet demonstates how to use our navigator with `BrowserRouter` from `react-router-dom`

```javascript
import React from 'react';
import { BrowserRouter, useHistory } from 'react-router-dom';
import { WizardForm } from '@panenco/formik-wizard-form';
import { HistoryNavigator } from '@panenco/formik-wizard-form/lib/navigators/HistoryNavigator';
import * as HarryPotterAnd from './steps';

const WizardFormContainer = () => {
  const history = useHistory();
  HistoryNavigator.setHistory(history);

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
      navigator={HistoryNavigator}
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

const App = () => (
  <BrowserRouter>
    <WizardFormContainer />
  </BrowserRouter>
);

ReactDOM.render(<App />, document.getElementById('root'));
```
