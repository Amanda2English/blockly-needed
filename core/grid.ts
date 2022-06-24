/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object for configuring and updating a workspace grid in
 * Blockly.
 */

/**
 * Object for configuring and updating a workspace grid in
 * Blockly.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Grid');

import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';
import * as userAgent from './utils/useragent.js';


/**
 * Class for a workspace's grid.
 * @alias Blockly.Grid
 */
export class Grid {
  /**
   * The scale of the grid, used to set stroke width on grid lines.
   * This should always be the same as the workspace scale.
   */
  private scale_ = 1;
  private readonly spacing_: number;
  private readonly length_: number;
  private readonly line1_: SVGElement;
  private readonly line2_: SVGElement;
  private readonly snapToGrid_: boolean;

  /**
   * @param pattern The grid's SVG pattern, created during injection.
   * @param options A dictionary of normalized options for the grid.
   *     See grid documentation:
   *     https://developers.google.com/blockly/guides/configure/web/grid
   */
  constructor(private pattern: SVGElement, options: AnyDuringMigration) {
    /** The spacing of the grid lines (in px). */
    this.spacing_ = options['spacing'];

    /** How long the grid lines should be (in px). */
    this.length_ = options['length'];

    /** The horizontal grid line, if it exists. */
    this.line1_ = pattern.firstChild as SVGElement;

    /** The vertical grid line, if it exists. */
    this.line2_ = this.line1_ && this.line1_.nextSibling as SVGElement;

    /** Whether blocks should snap to the grid. */
    this.snapToGrid_ = options['snap'];
  }

  /**
   * Dispose of this grid and unlink from the DOM.
   * @suppress {checkTypes}
   */
  dispose() {
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'SVGElement'.
    this.pattern = null as AnyDuringMigration;
  }

  /**
   * Whether blocks should snap to the grid, based on the initial configuration.
   * @return True if blocks should snap, false otherwise.
   */
  shouldSnap(): boolean {
    return this.snapToGrid_;
  }

  /**
   * Get the spacing of the grid points (in px).
   * @return The spacing of the grid points.
   */
  getSpacing(): number {
    return this.spacing_;
  }

  /**
   * Get the ID of the pattern element, which should be randomized to avoid
   * conflicts with other Blockly instances on the page.
   * @return The pattern ID.
   */
  getPatternId(): string {
    return this.pattern.id;
  }

  /**
   * Update the grid with a new scale.
   * @param scale The new workspace scale.
   */
  update(scale: number) {
    this.scale_ = scale;
    // MSIE freaks if it sees a 0x0 pattern, so set empty patterns to 100x100.
    const safeSpacing = this.spacing_ * scale || 100;

    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.pattern.setAttribute('width', safeSpacing as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.pattern.setAttribute('height', safeSpacing as AnyDuringMigration);

    let half = Math.floor(this.spacing_ / 2) + 0.5;
    let start = half - this.length_ / 2;
    let end = half + this.length_ / 2;

    half *= scale;
    start *= scale;
    end *= scale;

    this.setLineAttributes_(this.line1_, scale, start, end, half, half);
    this.setLineAttributes_(this.line2_, scale, half, half, start, end);
  }

  /**
   * Set the attributes on one of the lines in the grid.  Use this to update the
   * length and stroke width of the grid lines.
   * @param line Which line to update.
   * @param width The new stroke size (in px).
   * @param x1 The new x start position of the line (in px).
   * @param x2 The new x end position of the line (in px).
   * @param y1 The new y start position of the line (in px).
   * @param y2 The new y end position of the line (in px).
   */
  private setLineAttributes_(
      line: SVGElement, width: number, x1: number, x2: number, y1: number,
      y2: number) {
    if (line) {
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      line.setAttribute('stroke-width', width as AnyDuringMigration);
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      line.setAttribute('x1', x1 as AnyDuringMigration);
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      line.setAttribute('y1', y1 as AnyDuringMigration);
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      line.setAttribute('x2', x2 as AnyDuringMigration);
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      line.setAttribute('y2', y2 as AnyDuringMigration);
    }
  }

  /**
   * Move the grid to a new x and y position, and make sure that change is
   * visible.
   * @param x The new x position of the grid (in px).
   * @param y The new y position of the grid (in px).
   */
  moveTo(x: number, y: number) {
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.pattern.setAttribute('x', x as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.pattern.setAttribute('y', y as AnyDuringMigration);

    if (userAgent.IE || userAgent.EDGE) {
      // IE/Edge doesn't notice that the x/y offsets have changed.
      // Force an update.
      this.update(this.scale_);
    }
  }

  /**
   * Create the DOM for the grid described by options.
   * @param rnd A random ID to append to the pattern's ID.
   * @param gridOptions The object containing grid configuration.
   * @param defs The root SVG element for this workspace's defs.
   * @return The SVG element for the grid pattern.
   */
  static createDom(
      rnd: string, gridOptions: AnyDuringMigration,
      defs: SVGElement): SVGElement {
    /*
          <pattern id="blocklyGridPattern837493" patternUnits="userSpaceOnUse">
            <rect stroke="#888" />
            <rect stroke="#888" />
          </pattern>
        */
    const gridPattern = dom.createSvgElement(
        Svg.PATTERN,
        {'id': 'blocklyGridPattern' + rnd, 'patternUnits': 'userSpaceOnUse'},
        defs);
    // x1, y1, x1, x2 properties will be set later in update.
    if (gridOptions['length'] > 0 && gridOptions['spacing'] > 0) {
      dom.createSvgElement(
          Svg.LINE, {'stroke': gridOptions['colour']}, gridPattern);
      if (gridOptions['length'] > 1) {
        dom.createSvgElement(
            Svg.LINE, {'stroke': gridOptions['colour']}, gridPattern);
      }
    } else {
      // Edge 16 doesn't handle empty patterns
      dom.createSvgElement(Svg.LINE, {}, gridPattern);
    }
    return gridPattern;
  }
}
