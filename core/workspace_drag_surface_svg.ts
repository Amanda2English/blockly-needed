/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * An SVG that floats on top of the workspace.
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using CSS translation instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.WorkspaceDragSurfaceSvg');

import type {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';
import * as svgMath from './utils/svg_math.js';


/**
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using CSS transforms instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * @alias Blockly.WorkspaceDragSurfaceSvg
 */
export class WorkspaceDragSurfaceSvg {
  /**
   * The SVG drag surface. Set once by WorkspaceDragSurfaceSvg.createDom.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGElement'.
  private SVG_: SVGElement = null as AnyDuringMigration;

  /**
   * The element to insert the block canvas and bubble canvas after when it
   * goes back in the DOM at the end of a drag.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Element'.
  private previousSibling_: Element = null as AnyDuringMigration;

  /** @param container Containing element. */
  constructor(private readonly container: Element) {
    this.createDom();
  }

  /** Create the drag surface and inject it into the container. */
  createDom() {
    if (this.SVG_) {
      return;  // Already created.
    }
    /**
     * Dom structure when the workspace is being dragged. If there is no drag in
     * progress, the SVG is empty and display: none.
     * <svg class="blocklyWsDragSurface" style=transform:translate3d(...)>
     *   <g class="blocklyBlockCanvas"></g>
     *   <g class="blocklyBubbleCanvas">/g>
     * </svg>
     */
    this.SVG_ = dom.createSvgElement(Svg.SVG, {
      'xmlns': dom.SVG_NS,
      'xmlns:html': dom.HTML_NS,
      'xmlns:xlink': dom.XLINK_NS,
      'version': '1.1',
      'class': 'blocklyWsDragSurface blocklyOverflowVisible',
    });
    this.container.appendChild(this.SVG_);
  }

  /**
   * Translate the entire drag surface during a drag.
   * We translate the drag surface instead of the blocks inside the surface
   * so that the browser avoids repainting the SVG.
   * Because of this, the drag coordinates must be adjusted by scale.
   * @param x X translation for the entire surface
   * @param y Y translation for the entire surface
   * @internal
   */
  translateSurface(x: number, y: number) {
    // Make sure the svg exists on a pixel boundary so that it is not fuzzy.
    const fixedX = Math.round(x);
    const fixedY = Math.round(y);

    this.SVG_.style.display = 'block';
    dom.setCssTransform(
        this.SVG_, 'translate3d(' + fixedX + 'px, ' + fixedY + 'px, 0)');
  }

  /**
   * Reports the surface translation in scaled workspace coordinates.
   * Use this when finishing a drag to return blocks to the correct position.
   * @return Current translation of the surface
   * @internal
   */
  getSurfaceTranslation(): Coordinate {
    return svgMath.getRelativeXY((this.SVG_));
  }

  /**
   * Move the blockCanvas and bubbleCanvas out of the surface SVG and on to
   * newSurface.
   * @param newSurface The element to put the drag surface contents into.
   * @internal
   */
  clearAndHide(newSurface: SVGElement) {
    if (!newSurface) {
      throw Error(
          'Couldn\'t clear and hide the drag surface: missing new surface.');
    }
    const blockCanvas = this.SVG_.childNodes[0] as Element;
    const bubbleCanvas = this.SVG_.childNodes[1] as Element;
    if (!blockCanvas || !bubbleCanvas ||
        !dom.hasClass(blockCanvas, 'blocklyBlockCanvas') ||
        !dom.hasClass(bubbleCanvas, 'blocklyBubbleCanvas')) {
      throw Error(
          'Couldn\'t clear and hide the drag surface. A node was missing.');
    }

    // If there is a previous sibling, put the blockCanvas back right
    // afterwards, otherwise insert it as the first child node in newSurface.
    if (this.previousSibling_ !== null) {
      dom.insertAfter(blockCanvas, this.previousSibling_);
    } else {
      newSurface.insertBefore(blockCanvas, newSurface.firstChild);
    }

    // Reattach the bubble canvas after the blockCanvas.
    dom.insertAfter(bubbleCanvas, blockCanvas);
    // Hide the drag surface.
    this.SVG_.style.display = 'none';
    if (this.SVG_.childNodes.length) {
      throw Error('Drag surface was not cleared.');
    }
    dom.setCssTransform(this.SVG_, '');
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'Element'.
    this.previousSibling_ = null as AnyDuringMigration;
  }

  /**
     * Set the SVG to have the block canvas and bubble canvas in it and then
     * show the surface.
     * @param blockCanvas The block canvas <g> element from the
     *     workspace.
     * @param bubbleCanvas The <g> element that contains the
     bubbles.
     * @param previousSibling The element to insert the block canvas and
           bubble canvas after when it goes back in the DOM at the end of a
     drag.
     * @param width The width of the workspace SVG element.
     * @param height The height of the workspace SVG element.
     * @param scale The scale of the workspace being dragged.
 * @internal
     */
  setContentsAndShow(
      blockCanvas: SVGElement, bubbleCanvas: SVGElement,
      previousSibling: Element, width: number, height: number, scale: number) {
    if (this.SVG_.childNodes.length) {
      throw Error('Already dragging a block.');
    }
    this.previousSibling_ = previousSibling;
    // Make sure the blocks and bubble canvas are scaled appropriately.
    blockCanvas.setAttribute(
        'transform', 'translate(0, 0) scale(' + scale + ')');
    bubbleCanvas.setAttribute(
        'transform', 'translate(0, 0) scale(' + scale + ')');
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.SVG_.setAttribute('width', width as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.SVG_.setAttribute('height', height as AnyDuringMigration);
    this.SVG_.appendChild(blockCanvas);
    this.SVG_.appendChild(bubbleCanvas);
    this.SVG_.style.display = 'block';
  }
}
