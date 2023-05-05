/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Coordinate} from '../utils/coordinate.js';
import {Size} from '../utils/size.js';


export interface IIcon {
  /**
   * @return the string representing the type of the icon.
   * E.g. 'comment', 'warning', etc. This string should also be used when
   * registering the icon class.
   */
  getType(): string;

  /**
   * Creates the SVG elements for the icon that will live on the block.
   *
   * @param pointerdownListener The listener to be attached to the root svg
   *     element. This passes off the pointer down to Blockly's gesture system
   *     so that clicks and drags can be properly handled.
   */
  initView(pointerdownListener: (e: PointerEvent) => void): void;

  /**
   * Disposes of any elements of the icon.
   *
   * @remarks
   *
   * In particular, if this icon is currently showing a bubble, this should be
   * used to hide it.
   */
  dispose(): void;

  /**
   * @return the "weight" of the icon, which determines the static order which
   *     icons should be rendered in.
   *
   *     More positive numbers are rendered farther toward the end of the block.
   */
  getWeight(): number;

  /** @return The dimensions of the icon for use in rendering. */
  getSize(): Size;

  /** Notifies the icon that the block's colour has changed. */
  applyColour(): void;

  /** Notifies the icon that the block's editability has changed. */
  updateEditable(): void;

  /** Notifies the icon that the block's collapsed-ness has changed. */
  updateCollapsed(): void;

  /**
   * @return Whether this icon is shown when the block is collapsed. Used
   *     to allow renderers to account for padding.
   */
  isShownWhenCollapsed(): boolean;

  /**
   * Notifies the icon where it is relative to its block's top-start, in
   * workspace units.
   */
  setOffsetInBlock(offset: Coordinate): void;

  /**
   * Notifies the icon that it has changed locations.
   *
   * @param blockOrigin The location of this icon's block's top-start corner
   *     in workspace coordinates.
   */
  onLocationChange(blockOrigin: Coordinate): void;

  /**
   * Notifies the icon that it has been clicked.
   */
  onClick(): void;
}

/** Type guard that checks whether the given object is an IIcon. */
export function isIcon(obj: any): obj is IIcon {
  return obj.getType !== undefined && obj.initView !== undefined &&
      obj.dispose !== undefined && obj.getWeight !== undefined &&
      obj.getSize !== undefined && obj.applyColour !== undefined &&
      obj.updateEditable !== undefined && obj.updateCollapsed !== undefined &&
      obj.isShownWhenCollapsed !== undefined &&
      obj.setOffsetInBlock !== undefined &&
      obj.onLocationChange !== undefined && obj.onClick !== undefined;
}
