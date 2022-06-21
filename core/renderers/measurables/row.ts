/** @fileoverview Object representing a single row on a rendered block. */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Object representing a single row on a rendered block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants.js';

/* eslint-disable-next-line no-unused-vars */
import {Measurable} from './base.js';
/* eslint-disable-next-line no-unused-vars */
import {InRowSpacer} from './in_row_spacer.js';
/* eslint-disable-next-line no-unused-vars */
import {InputConnection} from './input_connection.js';
import {Types} from './types.js';


/**
 * An object representing a single row on a rendered block and all of its
 * subcomponents.
 * @alias Blockly.blockRendering.Row
 */
export class Row {
  /** @internal */
  type: number;

  /**
   * An array of elements contained in this row.
   * @internal
   */
  elements: Measurable[] = [];

  /**
   * The height of the row.
   * @internal
   */
  height = 0;

  /**
   * The width of the row, from the left edge of the block to the right.
   * Does not include child blocks unless they are inline.
   * @internal
   */
  width = 0;

  /**
   * The minimum height of the row.
   * @internal
   */
  minHeight = 0;

  /**
   * The minimum width of the row, from the left edge of the block to the
   * right. Does not include child blocks unless they are inline.
   * @internal
   */
  minWidth = 0;

  /**
   * The width of the row, from the left edge of the block to the edge of the
   * block or any connected child blocks.
   * @internal
   */
  widthWithConnectedBlocks = 0;

  /**
   * The Y position of the row relative to the origin of the block's svg
   * group.
   * @internal
   */
  yPos = 0;

  /**
   * The X position of the row relative to the origin of the block's svg
   * group.
   * @internal
   */
  xPos = 0;

  /**
   * Whether the row has any external inputs.
   * @internal
   */
  hasExternalInput = false;

  /**
   * Whether the row has any statement inputs.
   * @internal
   */
  hasStatement = false;

  /**
   * Where the left edge of all of the statement inputs on the block should
   * be. This makes sure that statement inputs which are proceded by fields
   * of varius widths are all aligned.
   */
  statementEdge = 0;

  /**
   * Whether the row has any inline inputs.
   * @internal
   */
  hasInlineInput = false;

  /**
   * Whether the row has any dummy inputs.
   * @internal
   */
  hasDummyInput = false;

  /**
   * Whether the row has a jagged edge.
   * @internal
   */
  hasJaggedEdge = false;
  notchOffset: number;

  /**
   * Alignment of the row.
   * @internal
   */
  align: number|null = null;

  /**
   * @param constants_ The rendering constants provider.
   * @internal
   */
  constructor(protected readonly constants_: ConstantProvider) {
    /** The type of this rendering object. */
    this.type = Types.ROW;

    this.notchOffset = this.constants.NOTCH_OFFSET_LEFT;
  }

  /**
   * Get the last input on this row, if it has one.
   * @return The last input on the row, or null.
   * @internal
   */
  getLastInput(): InputConnection {
    // TODO: Consider moving this to InputRow, if possible.
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const elem = this.elements[i];
      if (Types.isInput(elem)) {
        return elem as InputConnection;
      }
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'InputConnection'.
    return null as AnyDuringMigration;
  }

  /**
   * Inspect all subcomponents and populate all size properties on the row.
   * @internal
   */
  measure() {
    throw Error('Unexpected attempt to measure a base Row.');
  }

  /**
   * Determines whether this row should start with an element spacer.
   * @return Whether the row should start with a spacer.
   * @internal
   */
  startsWithElemSpacer(): boolean {
    return true;
  }

  /**
   * Determines whether this row should end with an element spacer.
   * @return Whether the row should end with a spacer.
   * @internal
   */
  endsWithElemSpacer(): boolean {
    return true;
  }

  /**
   * Convenience method to get the first spacer element on this row.
   * @return The first spacer element on this row.
   * @internal
   */
  getFirstSpacer(): InRowSpacer {
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      if (Types.isSpacer(elem)) {
        return elem as InRowSpacer;
      }
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'InRowSpacer'.
    return null as AnyDuringMigration;
  }

  /**
   * Convenience method to get the last spacer element on this row.
   * @return The last spacer element on this row.
   * @internal
   */
  getLastSpacer(): InRowSpacer {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const elem = this.elements[i];
      if (Types.isSpacer(elem)) {
        return elem as InRowSpacer;
      }
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'InRowSpacer'.
    return null as AnyDuringMigration;
  }
}
