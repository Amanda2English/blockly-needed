/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Browser event handling.
 */

/**
 * Browser event handling.
 * @namespace Blockly.browserEvents
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.browserEvents');

import * as Touch from './touch.js';
import * as userAgent from './utils/useragent.js';


/**
 * Blockly opaque event data used to unbind events when using
 * `bind` and `conditionalBind`.
 * @alias Blockly.browserEvents.Data
 */
export type Data = [EventTarget, string, (e: Event) => void][];

/**
 * The multiplier for scroll wheel deltas using the line delta mode.
 * See https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
 * for more information on deltaMode.
 */
const LINE_MODE_MULTIPLIER = 40;

/**
 * The multiplier for scroll wheel deltas using the page delta mode.
 * See https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
 * for more information on deltaMode.
 */
const PAGE_MODE_MULTIPLIER = 125;

/**
 * Bind an event handler that can be ignored if it is not part of the active
 * touch stream.
 * Use this for events that either start or continue a multi-part gesture (e.g.
 * mousedown or mousemove, which may be part of a drag or click).
 * @param node Node upon which to listen.
 * @param name Event name to listen to (e.g. 'mousedown').
 * @param thisObject The value of 'this' in the function.
 * @param func Function to call when event is triggered.
 * @param opt_noCaptureIdentifier True if triggering on this event should not
 *     block execution of other event handlers on this touch or other
 *     simultaneous touches.  False by default.
 * @param opt_noPreventDefault True if triggering on this event should prevent
 *     the default handler.  False by default.  If opt_noPreventDefault is
 *     provided, opt_noCaptureIdentifier must also be provided.
 * @return Opaque data that can be passed to unbindEvent_.
 * @alias Blockly.browserEvents.conditionalBind
 */
export function conditionalBind(
    node: EventTarget, name: string, thisObject: AnyDuringMigration|null,
    func: Function, opt_noCaptureIdentifier?: boolean,
    opt_noPreventDefault?: boolean): Data {
  let handled = false;
  function wrapFunc(e: Event) {
    const captureIdentifier = !opt_noCaptureIdentifier;
    // Handle each touch point separately.  If the event was a mouse event, this
    // will hand back an array with one element, which we're fine handling.
    const events = Touch.splitEventByTouches(e);
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (captureIdentifier && !Touch.shouldHandleEvent(event)) {
        continue;
      }
      Touch.setClientFromTouch(event);
      if (thisObject) {
        func.call(thisObject, event);
      } else {
        func(event);
      }
      handled = true;
    }
  }

  const bindData: Data = [];
  if (globalThis['PointerEvent'] && name in Touch.TOUCH_MAP) {
    for (let i = 0; i < Touch.TOUCH_MAP[name].length; i++) {
      const type = Touch.TOUCH_MAP[name][i];
      node.addEventListener(type, wrapFunc, false);
      bindData.push([node, type, wrapFunc]);
    }
  } else {
    node.addEventListener(name, wrapFunc, false);
    bindData.push([node, name, wrapFunc]);

    // Add equivalent touch event.
    if (name in Touch.TOUCH_MAP) {
      const touchWrapFunc = (e: Event) => {
        wrapFunc(e);
        // Calling preventDefault stops the browser from scrolling/zooming the
        // page.
        const preventDef = !opt_noPreventDefault;
        if (handled && preventDef) {
          e.preventDefault();
        }
      };
      for (let i = 0; i < Touch.TOUCH_MAP[name].length; i++) {
        const type = Touch.TOUCH_MAP[name][i];
        node.addEventListener(type, touchWrapFunc, false);
        bindData.push([node, type, touchWrapFunc]);
      }
    }
  }
  return bindData;
}

/**
 * Bind an event handler that should be called regardless of whether it is part
 * of the active touch stream.
 * Use this for events that are not part of a multi-part gesture (e.g.
 * mouseover for tooltips).
 * @param node Node upon which to listen.
 * @param name Event name to listen to (e.g. 'mousedown').
 * @param thisObject The value of 'this' in the function.
 * @param func Function to call when event is triggered.
 * @return Opaque data that can be passed to unbindEvent_.
 * @alias Blockly.browserEvents.bind
 */
export function bind(
  node: EventTarget, name: string, thisObject: AnyDuringMigration | null,
  func: Function): Data {
  function wrapFunc(e: Event) {
    if (thisObject) {
      func.call(thisObject, e);
    } else {
      func(e);
    }
  }

  const bindData: Data = [];
  if (globalThis['PointerEvent'] && name in Touch.TOUCH_MAP) {
    for (let i = 0; i < Touch.TOUCH_MAP[name].length; i++) {
      const type = Touch.TOUCH_MAP[name][i];
      node.addEventListener(type, wrapFunc, false);
      bindData.push([node, type, wrapFunc]);
    }
  } else {
    node.addEventListener(name, wrapFunc, false);
    bindData.push([node, name, wrapFunc]);

    // Add equivalent touch event.
    if (name in Touch.TOUCH_MAP) {
      const touchWrapFunc = (e: Event) => {
        // Punt on multitouch events.
        if (e.changedTouches && e.changedTouches.length === 1) {
          // Map the touch event's properties to the event.
          const touchPoint = e.changedTouches[0];
          e.clientX = touchPoint.clientX;
          e.clientY = touchPoint.clientY;
        }
        wrapFunc(e);

        // Stop the browser from scrolling/zooming the page.
        e.preventDefault();
      };
      for (let i = 0; i < Touch.TOUCH_MAP[name].length; i++) {
        const type = Touch.TOUCH_MAP[name][i];
        node.addEventListener(type, touchWrapFunc, false);
        bindData.push([node, type, touchWrapFunc]);
      }
    }
  }
  return bindData;
}

/**
 * Unbind one or more events event from a function call.
 * @param bindData Opaque data from bindEvent_.
 *     This list is emptied during the course of calling this function.
 * @return The function call.
 * @alias Blockly.browserEvents.unbind
 */
export function unbind(bindData: Data): (e: Event) => void {
  while (bindData.length) {
    const bindDatum = bindData.pop();
    const node = bindDatum![0];
    const name = bindDatum![1];
    const func = bindDatum![2];
    node.removeEventListener(name, func, false);
  }
  return bindData[bindData.length - 1][2];
}

/**
 * Returns true if this event is targeting a text input widget?
 * @param e An event.
 * @return True if text input.
 * @alias Blockly.browserEvents.isTargetInput
 */
export function isTargetInput(e: Event): boolean {
  if (e.target instanceof HTMLElement) {
    if (e.target.isContentEditable ||
        e.target.getAttribute('data-is-text-input') === 'true') {
      return true;
    }

    if (e.target instanceof HTMLInputElement) {
      const target = e.target;
      return target.type === 'text' || target.type === 'number' ||
          target.type === 'email' || target.type === 'password' ||
          target.type === 'search' || target.type === 'tel' ||
          target.type === 'url';
    }

    if (e.target instanceof HTMLTextAreaElement) {
      return true;
    }
  }

  return false;
}

/**
 * Returns true this event is a right-click.
 * @param e Mouse event.
 * @return True if right-click.
 * @alias Blockly.browserEvents.isRightButton
 */
export function isRightButton(e: Event): boolean {
  // AnyDuringMigration because:  Property 'ctrlKey' does not exist on type
  // 'Event'.
  if ((e as AnyDuringMigration).ctrlKey && userAgent.MAC) {
    // Control-clicking on Mac OS X is treated as a right-click.
    // WebKit on Mac OS X fails to change button to 2 (but Gecko does).
    return true;
  }
  // AnyDuringMigration because:  Property 'button' does not exist on type
  // 'Event'.
  return (e as AnyDuringMigration).button === 2;
}

/**
 * Returns the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param e Mouse event.
 * @param svg SVG element.
 * @param matrix Inverted screen CTM to use.
 * @return Object with .x and .y properties.
 * @alias Blockly.browserEvents.mouseToSvg
 */
export function mouseToSvg(
    e: Event, svg: SVGSVGElement, matrix: SVGMatrix|null): SVGPoint {
  const svgPoint = svg.createSVGPoint();
  // AnyDuringMigration because:  Property 'clientX' does not exist on type
  // 'Event'.
  svgPoint.x = (e as AnyDuringMigration).clientX;
  // AnyDuringMigration because:  Property 'clientY' does not exist on type
  // 'Event'.
  svgPoint.y = (e as AnyDuringMigration).clientY;

  if (!matrix) {
    matrix = svg.getScreenCTM()!.inverse();
  }
  return svgPoint.matrixTransform(matrix);
}

/**
 * Returns the scroll delta of a mouse event in pixel units.
 * @param e Mouse event.
 * @return Scroll delta object with .x and .y properties.
 * @alias Blockly.browserEvents.getScrollDeltaPixels
 */
export function getScrollDeltaPixels(e: WheelEvent): {x: number, y: number} {
  switch (e.deltaMode) {
    case 0x00:  // Pixel mode.
    default:
      return {x: e.deltaX, y: e.deltaY};
    case 0x01:  // Line mode.
      return {
        x: e.deltaX * LINE_MODE_MULTIPLIER,
        y: e.deltaY * LINE_MODE_MULTIPLIER,
      };
    case 0x02:  // Page mode.
      return {
        x: e.deltaX * PAGE_MODE_MULTIPLIER,
        y: e.deltaY * PAGE_MODE_MULTIPLIER,
      };
  }
}
