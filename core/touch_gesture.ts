/**
 * @fileoverview The class extends Gesture to support pinch to zoom
 * for both pointer and touch events.
 */

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * The class extends Gesture to support pinch to zoom
 * for both pointer and touch events.
 * @class
 */

import * as browserEvents from './browser_events';
import { Gesture } from './gesture';
import * as Touch from './touch';
import { Coordinate } from './utils/coordinate';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from './workspace_svg';


/*
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */


/** A multiplier used to convert the gesture scale to a zoom in delta. */
const ZOOM_IN_MULTIPLIER = 5;

/** A multiplier used to convert the gesture scale to a zoom out delta. */
const ZOOM_OUT_MULTIPLIER = 6;

/**
 * Class for one gesture.
 * @alias Blockly.TouchGesture
 */
export class TouchGesture extends Gesture {
  /** Boolean for whether or not this gesture is a multi-touch gesture. */
  private isMultiTouch_ = false;
  private cachedPoints_: { [key: string]: Coordinate };

  /**
   * This is the ratio between the starting distance between the touch points
   * and the most recent distance between the touch points.
   * Scales between 0 and 1 mean the most recent zoom was a zoom out.
   * Scales above 1.0 mean the most recent zoom was a zoom in.
   */
  private previousScale_ = 0;

  /** The starting distance between two touch points. */
  private startDistance_ = 0;

  /**
   * A handle to use to unbind the second touch start or pointer down listener
   * at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   */
  private onStartWrapper_: browserEvents.Data | null = null;

  /** Boolean for whether or not the workspace supports pinch-zoom. */
  private isPinchZoomEnabled_: boolean | null = null;
  override onMoveWrapper_: AnyDuringMigration;
  override onUpWrapper_: AnyDuringMigration;

  /**
   * @param e The event that kicked off this gesture.
   * @param creatorWorkspace The workspace that created this gesture and has a
   *     reference to it.
   */
  constructor(e: Event, creatorWorkspace: WorkspaceSvg) {
    super(e, creatorWorkspace);

    /** A map of cached points used for tracking multi-touch gestures. */
    this.cachedPoints_ = Object.create(null);
  }

  /**
   * Start a gesture: update the workspace to indicate that a gesture is in
   * progress and bind mousemove and mouseup handlers.
   * @param e A mouse down, touch start or pointer down event.
   */
  override doStart(e: Event) {
    this.isPinchZoomEnabled_ = this.startWorkspace_.options.zoomOptions &&
      this.startWorkspace_.options.zoomOptions.pinch;
    super.doStart(e);
    if (!this.isEnding_ && Touch.isTouchEvent(e)) {
      this.handleTouchStart(e);
    }
  }

  /**
   * Bind gesture events.
   * Overriding the gesture definition of this function, binding the same
   * functions for onMoveWrapper_ and onUpWrapper_ but passing
   * opt_noCaptureIdentifier.
   * In addition, binding a second mouse down event to detect multi-touch
   * events.
   * @param e A mouse down or touch start event.
   */
  override bindMouseEvents(e: Event) {
    this.onStartWrapper_ = browserEvents.conditionalBind(
      document, 'mousedown', null, this.handleStart.bind(this),
        /* opt_noCaptureIdentifier */ true);
    this.onMoveWrapper_ = browserEvents.conditionalBind(
      document, 'mousemove', null, this.handleMove.bind(this),
        /* opt_noCaptureIdentifier */ true);
    this.onUpWrapper_ = browserEvents.conditionalBind(
      document, 'mouseup', null, this.handleUp.bind(this),
        /* opt_noCaptureIdentifier */ true);

    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handle a mouse down, touch start, or pointer down event.
   * @param e A mouse down, touch start, or pointer down event.
   */
  handleStart(e: Event) {
    if (this.isDragging()) {
      // A drag has already started, so this can no longer be a pinch-zoom.
      return;
    }
    if (Touch.isTouchEvent(e)) {
      this.handleTouchStart(e);

      if (this.isMultiTouch()) {
        Touch.longStop();
      }
    }
  }

  /**
   * Handle a mouse move, touch move, or pointer move event.
   * @param e A mouse move, touch move, or pointer move event.
   */
  override handleMove(e: Event) {
    if (this.isDragging()) {
      // We are in the middle of a drag, only handle the relevant events
      if (Touch.shouldHandleEvent(e)) {
        super.handleMove(e);
      }
      return;
    }
    if (this.isMultiTouch()) {
      if (Touch.isTouchEvent(e)) {
        this.handleTouchMove(e);
      }
      Touch.longStop();
    } else {
      super.handleMove(e);
    }
  }

  /**
   * Handle a mouse up, touch end, or pointer up event.
   * @param e A mouse up, touch end, or pointer up event.
   */
  override handleUp(e: Event) {
    if (Touch.isTouchEvent(e) && !this.isDragging()) {
      this.handleTouchEnd(e);
    }
    if (!this.isMultiTouch() || this.isDragging()) {
      if (!Touch.shouldHandleEvent(e)) {
        return;
      }
      super.handleUp(e);
    } else {
      e.preventDefault();
      e.stopPropagation();

      this.dispose();
    }
  }

  /**
   * Whether this gesture is part of a multi-touch gesture.
   * @return Whether this gesture is part of a multi-touch gesture.
   */
  isMultiTouch(): boolean {
    return this.isMultiTouch_;
  }

  /** Sever all links from this object. */
  override dispose() {
    super.dispose();

    if (this.onStartWrapper_) {
      browserEvents.unbind(this.onStartWrapper_);
    }
  }

  /**
   * Handle a touch start or pointer down event and keep track of current
   * pointers.
   * @param e A touch start, or pointer down event.
   */
  handleTouchStart(e: Event) {
    const pointerId = Touch.getTouchIdentifierFromEvent(e);
    // store the pointerId in the current list of pointers
    // AnyDuringMigration because:  Type 'Coordinate | null' is not assignable
    // to type 'Coordinate'.
    this.cachedPoints_[pointerId] = this.getTouchPoint(e) as AnyDuringMigration;
    const pointers = Object.keys(this.cachedPoints_);
    // If two pointers are down, store info
    if (pointers.length === 2) {
      const point0 = (this.cachedPoints_[pointers[0]]);
      const point1 = (this.cachedPoints_[pointers[1]]);
      this.startDistance_ = Coordinate.distance(point0, point1);
      this.isMultiTouch_ = true;
      e.preventDefault();
    }
  }

  /**
   * Handle a touch move or pointer move event and zoom in/out if two pointers
   * are on the screen.
   * @param e A touch move, or pointer move event.
   */
  handleTouchMove(e: Event) {
    const pointerId = Touch.getTouchIdentifierFromEvent(e);
    // Update the cache
    // AnyDuringMigration because:  Type 'Coordinate | null' is not assignable
    // to type 'Coordinate'.
    this.cachedPoints_[pointerId] = this.getTouchPoint(e) as AnyDuringMigration;

    const pointers = Object.keys(this.cachedPoints_);
    if (this.isPinchZoomEnabled_ && pointers.length === 2) {
      this.handlePinch_(e);
    } else {
      super.handleMove(e);
    }
  }

  /**
   * Handle pinch zoom gesture.
   * @param e A touch move, or pointer move event.
   */
  private handlePinch_(e: Event) {
    const pointers = Object.keys(this.cachedPoints_);
    // Calculate the distance between the two pointers
    const point0 = (this.cachedPoints_[pointers[0]]);
    const point1 = (this.cachedPoints_[pointers[1]]);
    const moveDistance = Coordinate.distance(point0, point1);
    const scale = moveDistance / this.startDistance_;

    if (this.previousScale_ > 0 && this.previousScale_ < Infinity) {
      const gestureScale = scale - this.previousScale_;
      const delta = gestureScale > 0 ? gestureScale * ZOOM_IN_MULTIPLIER :
        gestureScale * ZOOM_OUT_MULTIPLIER;
      const workspace = this.startWorkspace_;
      const position = browserEvents.mouseToSvg(
        e, workspace.getParentSvg(), workspace.getInverseScreenCTM());
      workspace.zoom(position.x, position.y, delta);
    }
    this.previousScale_ = scale;
    e.preventDefault();
  }

  /**
   * Handle a touch end or pointer end event and end the gesture.
   * @param e A touch end, or pointer end event.
   */
  handleTouchEnd(e: Event) {
    const pointerId = Touch.getTouchIdentifierFromEvent(e);
    if (this.cachedPoints_[pointerId]) {
      delete this.cachedPoints_[pointerId];
    }
    if (Object.keys(this.cachedPoints_).length < 2) {
      this.cachedPoints_ = Object.create(null);
      this.previousScale_ = 0;
    }
  }

  /**
   * Helper function returning the current touch point coordinate.
   * @param e A touch or pointer event.
   * @return The current touch point coordinate
   */
  getTouchPoint(e: Event): Coordinate | null {
    if (!this.startWorkspace_) {
      return null;
    }
    // TODO(#6097): Make types accurate, possibly by refactoring touch handling.
    const typelessEvent = e as AnyDuringMigration;
    return new Coordinate(
      typelessEvent.changedTouches ? typelessEvent.changedTouches[0].pageX :
        typelessEvent.pageX,
      typelessEvent.changedTouches ? typelessEvent.changedTouches[0].pageY :
        typelessEvent.pageY);
  }
}
