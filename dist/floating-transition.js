"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingTransition = exports.useFloatingTransition = exports.useFloating = void 0;
const react_1 = require("@headlessui/react");
const react_2 = __importDefault(require("react"));
const dom_1 = require("@floating-ui/dom");
const deepEqual_1 = require("./utils/deepEqual");
function defaultPositionFloating(reference, floating, options) {
    const { x, y, strategy } = options;
    if (floating) {
        floating.style.top = `${y !== null && y !== void 0 ? y : 0}px`;
        floating.style.left = `${x !== null && x !== void 0 ? x : 0}px`;
        floating.style.position = strategy;
    }
}
function useFloating({ middleware = [], placement = 'bottom', strategy = 'absolute', positionFloating = defaultPositionFloating, } = {}) {
    const [latestMiddleware, setLatestMiddleware] = react_2.default.useState(middleware);
    if (!(0, deepEqual_1.deepEqual)(latestMiddleware === null || latestMiddleware === void 0 ? void 0 : latestMiddleware.map(({ name, options }) => ({ name, options })), middleware === null || middleware === void 0 ? void 0 : middleware.map(({ name, options }) => ({ name, options })))) {
        setLatestMiddleware(middleware);
    }
    const reference = react_2.default.useRef(null);
    const floating = react_2.default.useRef(null);
    const update = react_2.default.useCallback(() => {
        if (!reference.current || !floating.current) {
            return;
        }
        (0, dom_1.computePosition)(reference.current, floating.current, {
            middleware: latestMiddleware,
            placement: placement,
            strategy: strategy,
        }).then((data) => {
            positionFloating(reference.current, floating.current, data);
        });
    }, [latestMiddleware, placement, strategy, positionFloating]);
    return react_2.default.useMemo(() => ({
        update,
        reference,
        floating,
    }), [update, floating, reference]);
}
exports.useFloating = useFloating;
function useFloatingTransition(show, useFloatOptions = {}) {
    const [showing, updateShowing] = react_2.default.useState(false);
    const [isTransitioning, updateIsTransitioning] = react_2.default.useState(show);
    const [transitioningTo, updateTransitioningTo] = react_2.default.useState(show);
    const afterLeave = react_2.default.useCallback(function () {
        updateIsTransitioning(false);
    }, []);
    const { reference, floating, update } = useFloating(useFloatOptions);
    const isFirstRender = react_2.default.useRef(true);
    react_2.default.useLayoutEffect(function () {
        if (!isFirstRender) {
            updateIsTransitioning(true);
            updateTransitioningTo(show);
        }
        else {
            isFirstRender.current = false;
        }
    }, [show]);
    react_2.default.useLayoutEffect(function () {
        update();
        let cleanup;
        if (reference.current && floating.current && transitioningTo) {
            cleanup = (0, dom_1.autoUpdate)(reference.current, floating.current, update);
        }
        else {
            cleanup = function () { };
        }
        updateShowing(transitioningTo);
        return function () {
            cleanup();
        };
    }, [floating, reference, transitioningTo, update]);
    return {
        visible: showing || isTransitioning,
        show: showing,
        updateShowing,
        afterLeave,
        reference,
        floating
    };
}
exports.useFloatingTransition = useFloatingTransition;
function FloatingTransition(props) {
    const { state, children, afterLeave: afterLeaveTransition } = props, rest = __rest(props, ["state", "children", "afterLeave"]);
    const { visible, afterLeave: afterLeaveFloating } = state;
    const afterLeave = react_2.default.useCallback(function () {
        afterLeaveFloating();
        if (afterLeaveTransition) {
            afterLeaveTransition();
        }
    }, [afterLeaveTransition, afterLeaveFloating]);
    if (state.visible) {
        return (react_2.default.createElement(react_1.Transition, Object.assign({ show: state.show, unmount: false, as: react_2.default.Fragment, afterLeave: afterLeave }, rest), children));
    }
    else {
        return null;
    }
}
exports.FloatingTransition = FloatingTransition;
