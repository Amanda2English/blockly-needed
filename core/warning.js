/** @fileoverview Object representing a warning. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Object representing a warning.
 * @class
 */

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_bubble_open';

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from './block_svg';
import { Bubble } from './bubble';
import * as eventUtils from './events/utils';
import { Icon } from './icon';
/* eslint-disable-next-line no-unused-vars */
import { Coordinate } from './utils/coordinate';
import * as dom from './utils/dom';
import { Svg } from './utils/svg';


/**
 * Class for a warning.
 * @alias Blockly.Warning
 */
export class Warning extends Icon {
  text_: AnyDuringMigration;

  /** The top-level node of the warning text, or null if not created. */
  private paragraphElement_: SVGTextElement | null = null;

  /** Does this icon get hidden when the block is collapsed? */
  override collapseHidden = false;
  override bubble_: AnyDuringMigration;

  /** @param block The block associated with this warning. */
  constructor(block: BlockSvg) {
    super(block);
    this.createIcon();
    // The text_ object can contain multiple warnings.
    this.text_ = Object.create(null);
  }

  /**
   * Draw the warning icon.
   * @param group The icon group.
   */
  protected override drawIcon_(group: Element) {
    // Triangle with rounded corners.
    dom.createSvgElement(
      Svg.PATH, {
      'class': 'blocklyIconShape',
      'd': 'M2,15Q-1,15 0.5,12L6.5,1.7Q8,-1 9.5,1.7L15.5,12Q17,15 14,15z',
    },
      group);
    // Can't use a real '!' text character since different browsers and
    // operating systems render it differently. Body of exclamation point.
    dom.createSvgElement(
      Svg.PATH, {
      'class': 'blocklyIconSymbol',
      'd': 'm7,4.8v3.16l0.27,2.27h1.46l0.27,-2.27v-3.16z',
    },
      group);
    // Dot of exclamation point.
    dom.createSvgElement(
      Svg.RECT, {
      'class': 'blocklyIconSymbol',
      'x': '7',
      'y': '11',
      'height': '2',
      'width': '2',
    },
      group);
  }

  /**
   * Show or hide the warning bubble.
   * @param visible True if the bubble should be visible.
   */
  override setVisible(visible: boolean) {
    if (visible === this.isVisible()) {
      return;
    }
    // AnyDuringMigration because:  Property 'block_' does not exist on type
    // 'Warning'.
    eventUtils.fire(new (eventUtils.get(eventUtils.BUBBLE_OPEN))!
      ((this as AnyDuringMigration).block_, visible, 'warning'));
    if (visible) {
      this.createBubble_();
    } else {
      this.disposeBubble_();
    }
  }

  /** Show the bubble. */
  private createBubble_() {
    this.paragraphElement_ = Bubble.textToDom(this.getText());
    // AnyDuringMigration because:  Property 'block_' does not exist on type
    // 'Warning'.
    this.bubble_ = Bubble.createNonEditableBubble(
      this.paragraphElement_, (this as AnyDuringMigration).block_ as BlockSvg,
      this.iconXY_ as Coordinate);
    this.applyColour();
  }

  /** Dispose of the bubble and references to it. */
  private disposeBubble_() {
    this.bubble_.dispose();
    this.bubble_ = null;
    this.paragraphElement_ = null;
  }

  /**
   * Set this warning's text.
   * @param text Warning text (or '' to delete). This supports linebreaks.
   * @param id An ID for this text entry to be able to maintain multiple
   *     warnings.
   */
  setText(text: string, id: string) {
    if (this.text_[id] === text) {
      return;
    }
    if (text) {
      this.text_[id] = text;
    } else {
      delete this.text_[id];
    }
    if (this.isVisible()) {
      this.setVisible(false);
      this.setVisible(true);
    }
  }

  /**
   * Get this warning's texts.
   * @return All texts concatenated into one string.
   */
  getText(): string {
    const allWarnings = [];
    for (const id in this.text_) {
      allWarnings.push(this.text_[id]);
    }
    return allWarnings.join('\n');
  }

  /** Dispose of this warning. */
  override dispose() {
    // AnyDuringMigration because:  Property 'block_' does not exist on type
    // 'Warning'.
    (this as AnyDuringMigration).block_.warning = null;
    super.dispose();
  }
}
