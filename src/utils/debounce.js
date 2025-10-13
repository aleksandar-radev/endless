const DEFAULT_DELAY_MS = 1000;

/**
 * Create a debounced runner that delays invoking `fn` until after `delay` milliseconds
 * have elapsed since the last time the runner was triggered.
 *
 * Returns an object with:
 * - trigger(...args): schedule the function to run after the delay (restarts timer on each call)
 * - flush(): immediately invoke the function if it is pending, otherwise invoke it synchronously
 *
 * The most recent arguments passed to trigger() are used when invoking the function.
 */
export function createDeferredRunner(fn, delay = DEFAULT_DELAY_MS) {
  let timer = null;
  let pendingArgs = null;

  const invoke = () => {
    const args = pendingArgs || [];
    pendingArgs = null;
    timer = null;
    fn(...args);
  };

  return {
    trigger(...args) {
      pendingArgs = args;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(invoke, delay);
    },
    flush() {
      if (timer) {
        clearTimeout(timer);
        invoke();
      } else if (pendingArgs) {
        invoke();
      } else {
        fn();
      }
    },
  };
}
