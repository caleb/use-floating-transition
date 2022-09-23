import { Transition } from "@headlessui/react"
import React from "react"
import { computePosition, autoUpdate } from '@floating-ui/dom';
import { deepEqual } from './utils/deepEqual';

function defaultPositionFloating(reference: any,
  floating: any,
  options: { x: number, y: number, strategy: string }) {
  const { x, y, strategy } = options

  if (floating) {
    floating.style.top = `${y ?? 0}px`
    floating.style.left = `${x ?? 0}px`
    floating.style.position = strategy
  }
}

export function useFloating({
  middleware = [],
  placement = 'bottom',
  strategy = 'absolute',
  positionFloating = defaultPositionFloating,
} = {}) {

  const [latestMiddleware, setLatestMiddleware] = React.useState(middleware);

  if (!deepEqual(
    latestMiddleware?.map(({ name, options }) => ({ name, options })),
    middleware?.map(({ name, options }) => ({ name, options })))) {
    setLatestMiddleware(middleware);
  }

  const reference = React.useRef(null);
  const floating = React.useRef(null);

  const update = React.useCallback(() => {
    if (!reference.current || !floating.current) {
      return;
    }

    computePosition(reference.current, floating.current, {
      middleware: latestMiddleware,
      placement: placement as any,
      strategy: strategy as any,
    }).then((data: any) => {
      positionFloating(reference.current, floating.current, data)
    });
  }, [latestMiddleware, placement, strategy, positionFloating]);

  return React.useMemo(
    () => ({
      update,
      reference,
      floating,
    }),
    [update, floating, reference]
  );
}

export function useFloatingTransition(show: boolean, useFloatOptions = {}) {
  const [showing, updateShowing] = React.useState(false)
  const [isTransitioning, updateIsTransitioning] = React.useState(show)
  const [transitioningTo, updateTransitioningTo] = React.useState(show)
  const afterLeave = React.useCallback(function () {
    updateIsTransitioning(false)
  }, [])
  const { reference, floating, update } = useFloating(useFloatOptions)

  React.useLayoutEffect(function () {
    updateIsTransitioning(true)
    updateTransitioningTo(show)
  }, [show]);

  React.useLayoutEffect(function () {
    update()
    let cleanup: any;
    if (reference.current && floating.current && transitioningTo) {
      cleanup = autoUpdate(reference.current, floating.current, update)
    } else {
      cleanup = function () { }
    }
    updateShowing(transitioningTo)

    return function () {
      cleanup()
    }
  }, [floating, reference, transitioningTo, update]);

  return {
    visible: showing || isTransitioning,
    show: showing,
    updateShowing,
    afterLeave,
    reference,
    floating
  }
}

export function FloatingTransition(props: any) {
  const { state, children, afterLeave: afterLeaveTransition, ...rest } = props
  const {visible, afterLeave: afterLeaveFloating} = state

  const afterLeave = React.useCallback(function() {
    afterLeaveFloating()
    if (afterLeaveTransition) {
      afterLeaveTransition()
    }
  }, [afterLeaveTransition, afterLeaveFloating])

  if (state.visible) {
    return (
      <Transition show={state.show}
        unmount={false}
        as={React.Fragment}
        afterLeave={afterLeave}
        {...rest}>
        {children}
      </Transition>);
  } else {
    return null;
  }
}
