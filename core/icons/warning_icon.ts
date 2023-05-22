/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Warning');

import {BlockSvg} from '../block_svg.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Icon} from './icon.js';
import {IHasBubble} from '../interfaces/i_has_bubble.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils.js';
import {Svg} from '../utils/svg.js';
import {TextBubble} from '../bubbles/text_bubble.js';

export class WarningIcon extends Icon implements IHasBubble {
  /** The type string used to identify this icon. */
  static readonly TYPE = 'warning';

  /**
   * The weight this icon has relative to other icons. Icons with more positive
   * weight values are rendered farther toward the end of the block.
   */
  static readonly WEIGHT = 2;

  /** The size of this icon in workspace-scale units. */
  static readonly SIZE = 17;

  /** A map of warning IDs to warning text. */
  private textMap: Map<string, string> = new Map();

  /** The bubble used to display the warnings to the user. */
  private textBubble: TextBubble | null = null;

  /** @internal */
  constructor(protected readonly sourceBlock: BlockSvg) {
    super(sourceBlock);
  }

  getType(): string {
    return WarningIcon.TYPE;
  }

  initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // Already initialized.

    super.initView(pointerdownListener);
    // Triangle with rounded corners.
    dom.createSvgElement(
      Svg.PATH,
      {
        'class': 'blocklyIconShape',
        'd': 'M2,15Q-1,15 0.5,12L6.5,1.7Q8,-1 9.5,1.7L15.5,12Q17,15 14,15z',
      },
      this.svgRoot
    );
    // Can't use a real '!' text character since different browsers and
    // operating systems render it differently. Body of exclamation point.
    dom.createSvgElement(
      Svg.PATH,
      {
        'class': 'blocklyIconSymbol',
        'd': 'm7,4.8v3.16l0.27,2.27h1.46l0.27,-2.27v-3.16z',
      },
      this.svgRoot
    );
    // Dot of exclamation point.
    dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyIconSymbol',
        'x': '7',
        'y': '11',
        'height': '2',
        'width': '2',
      },
      this.svgRoot
    );
  }

  dispose() {
    if (this.textBubble) this.textBubble.dispose();
  }

  getWeight(): number {
    return WarningIcon.WEIGHT;
  }

  getSize(): Size {
    return new Size(17, 17);
  }

  applyColour(): void {
    this.textBubble?.setColour(this.sourceBlock.style.colourPrimary);
  }

  updateCollapsed(): void {
    // We are shown when collapsed, so do nothing! I.e. skip the default
    // behavior of hiding.
  }

  /** Tells the blockly that this icon is shown when the block is collapsed. */
  isShownWhenCollapsed(): boolean {
    return true;
  }

  /** Updates the location of the icon's bubble if it is open. */
  onLocationChange(blockOrigin: Coordinate): void {
    super.onLocationChange(blockOrigin);
    if (this.bubbleIsVisible()) {
      this.textBubble?.setAnchorLocation(this.getAnchorLocation());
    }
  }

  /**
   * Adds a warning message to this warning icon.
   *
   * @param text The text of the message to add.
   * @param id The id of the message to add.
   * @internal
   */
  addMessage(text: string, id: string): this {
    if (this.textMap.get(id) === text) return this;

    if (text) {
      this.textMap.set(id, text);
    } else {
      this.textMap.delete(id);
    }

    if (this.bubbleIsVisible()) this.textBubble?.setText(this.getText());
    return this;
  }

  /**
   * @return the display text for this icon. Includes all warning messages
   *     concatenated together with newlines.
   * @internal
   */
  getText(): string {
    return [...this.textMap.values()].join('\n');
  }

  /** Toggles the visibility of the bubble. */
  onClick(): void {
    this.setBubbleVisible(!this.bubbleIsVisible());
  }

  bubbleIsVisible(): boolean {
    return !!this.textBubble;
  }

  setBubbleVisible(visible: boolean): void {
    if (this.bubbleIsVisible() === visible) return;

    if (visible) {
      this.textBubble = new TextBubble(
        this.getText(),
        this.sourceBlock.workspace,
        this.getAnchorLocation(),
        this.getBubbleOwnerRect()
      );
      this.applyColour();
    } else {
      this.textBubble?.dispose();
      this.textBubble = null;
    }
  }

  /**
   * @return the location the bubble should be anchored to.
   *     I.E. the middle of this icon.
   */
  private getAnchorLocation(): Coordinate {
    const midIcon = WarningIcon.SIZE / 2;
    return Coordinate.sum(
      this.workspaceLocation,
      new Coordinate(midIcon, midIcon)
    );
  }

  /**
   * @return the rect the bubble should avoid overlapping.
   *     I.E. the block that owns this icon.
   */
  private getBubbleOwnerRect(): Rect {
    const bbox = this.sourceBlock.getSvgRoot().getBBox();
    return new Rect(bbox.y, bbox.y + bbox.height, bbox.x, bbox.x + bbox.width);
  }
}
