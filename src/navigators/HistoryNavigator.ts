import { INavigator, INavigatorConstructor } from '../the-boy-who-lived';

export class HistoryNavigator implements INavigator {
  static history: any;
  currentStep: any;
  unlisten: () => void;
  steps: any[];

  static setHistory(history): INavigatorConstructor {
    HistoryNavigator.history = history;

    return HistoryNavigator;
  }

  constructor(steps, initalStepIndex) {
    if (!HistoryNavigator.history) {
      throw new ReferenceError(
        `You probably didn't set "history" object via HistoryNavigator.setHistory() before class usage.`,
      );
    }

    this.currentStep = initalStepIndex;
    this.steps = steps;

    HistoryNavigator.history.replace(this.getStepUrl(0), { stepIdx: 0 }); // replacing first page in history

    if (initalStepIndex !== 0) {
      for (let stepIdx = 1; stepIdx <= initalStepIndex; stepIdx += 1) {
        HistoryNavigator.history.push(this.getStepUrl(stepIdx), { stepIdx });
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

  navigate(prevStep, nextStep) {
    console.log('navigating', prevStep, nextStep);

    if (prevStep < nextStep && !this.steps[nextStep].touched) {
      HistoryNavigator.history.push(this.getStepUrl(nextStep), { stepIdx: nextStep });
    } else {
      HistoryNavigator.history.go(nextStep - prevStep);
    }

    this.currentStep = nextStep;
  }
}
