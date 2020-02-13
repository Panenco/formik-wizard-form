import { INavigator, INavigatorConstructor, NavigatableStepMeta } from '../the-boy-who-lived';

export class HistoryNavigator implements INavigator {
  static history: any;
  currentStep: any;
  unlisten: () => void;
  steps: any[];

  static setHistory(history): INavigatorConstructor {
    HistoryNavigator.history = history;

    return HistoryNavigator;
  }

  constructor(steps: NavigatableStepMeta<any>[], initialStepIndex: number) {
    if (!HistoryNavigator.history) {
      throw new ReferenceError(
        `You probably didn't set "history" object via HistoryNavigator.setHistory() before class usage.`,
      );
    }
    const { history } = HistoryNavigator;

    this.currentStep = initialStepIndex;
    this.steps = steps;
    history.replace(this.getStepUrl(0), { ...history.location.state, stepIdx: 0 }); // replacing first page in history

    if (initialStepIndex !== 0) {
      for (let stepIdx = 1; stepIdx <= initialStepIndex; stepIdx += 1) {
        history.push(this.getStepUrl(stepIdx), {
          ...history.location.state,
          stepIdx,
        });
      }
    }
  }

  getStepUrl(stepIndex: number) {
    return this.steps[stepIndex].Step?.RoutePath ?? `#step-${stepIndex + 1}`;
  }

  mount(goTo) {
    this.unlisten = HistoryNavigator.history.listen((location, action) => {
      if (action === 'POP') {
        goTo(location.state.stepIdx, true);
      }
    });
  }

  unmount() {
    this.unlisten();
  }

  navigate(prevStep: number, nextStep: number) {
    const { history } = HistoryNavigator;

    if (prevStep < nextStep && !this.steps[nextStep].touched) {
      history.push(this.getStepUrl(nextStep), { ...history.location.state, stepIdx: nextStep });
    } else {
      history.go(nextStep - prevStep);
    }

    this.currentStep = nextStep;
  }
}
