/** @fileoverview Object representing an input (value, statement, or dummy). */


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
 * Object representing an input (value, statement, or dummy).
 * @class
 */

// Unused import preserved for side-effects. Remove if unneeded.
import './field_label';

/* eslint-disable-next-line no-unused-vars */
import { Block } from './block';
/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from './block_svg';
/* eslint-disable-next-line no-unused-vars */
import { Connection } from './connection';
/* eslint-disable-next-line no-unused-vars */
import { Field } from './field';
import * as fieldRegistry from './field_registry';
import { inputTypes } from './input_types';
/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from './rendered_connection';


/**
 * Class for an input with an optional field.
 * @alias Blockly.Input
 */
export class Input {
  static Align: AnyDuringMigration;
  private sourceBlock_: Block;
  fieldRow: Field[] = [];
  align: number;

  /** Is the input visible? */
  private visible_ = true;

  /**
   * @param type The type of the input.
   * @param name Language-neutral identifier which may used to find this input
   *     again.
   * @param block The block containing this input.
   * @param connection Optional connection for this input.
   */
  constructor(
    public type: number, public name: string, block: Block,
    public connection: Connection | null) {
    if (type !== inputTypes.DUMMY && !name) {
      throw Error(
        'Value inputs and statement inputs must have non-empty name.');
    }
    this.sourceBlock_ = block;

    /** Alignment of input's fields (left, right or centre). */
    this.align = Align.LEFT;
  }

  /**
   * Get the source block for this input.
   * @return The source block, or null if there is none.
   */
  getSourceBlock(): Block | null {
    return this.sourceBlock_;
  }

  /**
   * Add a field (or label from string), and all prefix and suffix fields, to
   * the end of the input's field row.
   * @param field Something to add as a field.
   * @param opt_name Language-neutral identifier which may used to find this
   *     field again.  Should be unique to the host block.
   * @return The input being append to (to allow chaining).
   */
  appendField(field: string | Field, opt_name?: string): Input {
    this.insertFieldAt(this.fieldRow.length, field, opt_name);
    return this;
  }

  /**
   * Inserts a field (or label from string), and all prefix and suffix fields,
   * at the location of the input's field row.
   * @param index The index at which to insert field.
   * @param field Something to add as a field.
   * @param opt_name Language-neutral identifier which may used to find this
   *     field again.  Should be unique to the host block.
   * @return The index following the last inserted field.
   */
  insertFieldAt(index: number, field: string | Field, opt_name?: string): number {
    if (index < 0 || index > this.fieldRow.length) {
      throw Error('index ' + index + ' out of bounds.');
    }
    // Falsy field values don't generate a field, unless the field is an empty
    // string and named.
    if (!field && !(field === '' && opt_name)) {
      return index;
    }

    // Generate a FieldLabel when given a plain text field.
    if (typeof field === 'string') {
      field = fieldRegistry.fromJson({
        'type': 'field_label',
        'text': field,
      }) as Field;
    }

    field.setSourceBlock(this.sourceBlock_);
    if (this.sourceBlock_.rendered) {
      field.init();
      field.applyColour();
    }
    field.name = opt_name;
    field.setVisible(this.isVisible());

    if (field.prefixField) {
      // Add any prefix.
      index = this.insertFieldAt(index, field.prefixField);
    }
    // Add the field to the field row.
    this.fieldRow.splice(index, 0, field);
    index++;
    if (field.suffixField) {
      // Add any suffix.
      index = this.insertFieldAt(index, field.suffixField);
    }

    if (this.sourceBlock_.rendered) {
      (this.sourceBlock_ as BlockSvg).render();
      // Adding a field will cause the block to change shape.
      this.sourceBlock_.bumpNeighbours();
    }
    return index;
  }

  /**
   * Remove a field from this input.
   * @param name The name of the field.
   * @param opt_quiet True to prevent an error if field is not present.
   * @return True if operation succeeds, false if field is not present and
   *     opt_quiet is true.
   * @throws {Error} if the field is not present and opt_quiet is false.
   */
  removeField(name: string, opt_quiet?: boolean): boolean {
    for (let i = 0, field; field = this.fieldRow[i]; i++) {
      if (field.name === name) {
        field.dispose();
        this.fieldRow.splice(i, 1);
        if (this.sourceBlock_.rendered) {
          (this.sourceBlock_ as BlockSvg).render();
          // Removing a field will cause the block to change shape.
          this.sourceBlock_.bumpNeighbours();
        }
        return true;
      }
    }
    if (opt_quiet) {
      return false;
    }
    throw Error('Field "' + name + '" not found.');
  }

  /**
   * Gets whether this input is visible or not.
   * @return True if visible.
   */
  isVisible(): boolean {
    return this.visible_;
  }

  /**
   * Sets whether this input is visible or not.
   * Should only be used to collapse/uncollapse a block.
   * @param visible True if visible.
   * @return List of blocks to render.
   */
  setVisible(visible: boolean): BlockSvg[] {
    // Note: Currently there are only unit tests for block.setCollapsed()
    // because this function is package. If this function goes back to being a
    // public API tests (lots of tests) should be added.
    let renderList: AnyDuringMigration[] = [];
    if (this.visible_ === visible) {
      return renderList;
    }
    this.visible_ = visible;

    for (let y = 0, field; field = this.fieldRow[y]; y++) {
      field.setVisible(visible);
    }
    if (this.connection) {
      const renderedConnection = this.connection as RenderedConnection;
      // Has a connection.
      if (visible) {
        renderList = renderedConnection.startTrackingAll();
      } else {
        renderedConnection.stopTrackingAll();
      }
      const child = renderedConnection.targetBlock();
      if (child) {
        child.getSvgRoot().style.display = visible ? 'block' : 'none';
      }
    }
    return renderList;
  }

  /** Mark all fields on this input as dirty. */
  markDirty() {
    for (let y = 0, field; field = this.fieldRow[y]; y++) {
      field.markDirty();
    }
  }

  /**
   * Change a connection's compatibility.
   * @param check Compatible value type or list of value types.  Null if all
   *     types are compatible.
   * @return The input being modified (to allow chaining).
   */
  setCheck(check: string | string[] | null): Input {
    if (!this.connection) {
      throw Error('This input does not have a connection.');
    }
    this.connection.setCheck(check);
    return this;
  }

  /**
   * Change the alignment of the connection's field(s).
   * @param align One of the values of Align In RTL mode directions are
   *     reversed, and Align.RIGHT aligns to the left.
   * @return The input being modified (to allow chaining).
   */
  setAlign(align: number): Input {
    this.align = align;
    if (this.sourceBlock_.rendered) {
      const sourceBlock = this.sourceBlock_ as BlockSvg;
      sourceBlock.render();
    }
    return this;
  }

  /**
   * Changes the connection's shadow block.
   * @param shadow DOM representation of a block or null.
   * @return The input being modified (to allow chaining).
   */
  setShadowDom(shadow: Element | null): Input {
    if (!this.connection) {
      throw Error('This input does not have a connection.');
    }
    this.connection.setShadowDom(shadow);
    return this;
  }

  /**
   * Returns the XML representation of the connection's shadow block.
   * @return Shadow DOM representation of a block or null.
   */
  getShadowDom(): Element | null {
    if (!this.connection) {
      throw Error('This input does not have a connection.');
    }
    return this.connection.getShadowDom();
  }

  /** Initialize the fields on this input. */
  init() {
    if (!this.sourceBlock_.workspace.rendered) {
      return;
    }
    // Headless blocks don't need fields initialized.
    for (let i = 0; i < this.fieldRow.length; i++) {
      this.fieldRow[i].init();
    }
  }

  /**
   * Sever all links to this input.
   * @suppress {checkTypes}
   */
  dispose() {
    for (let i = 0, field; field = this.fieldRow[i]; i++) {
      field.dispose();
    }
    if (this.connection) {
      this.connection.dispose();
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'Block'.
    this.sourceBlock_ = null as AnyDuringMigration;
  }
}

/**
 * Enum for alignment of inputs.
 * @alias Blockly.Input.Align
 */
export enum Align {
  LEFT = -1,
  CENTRE,
  RIGHT
}

// Add Align to Input so that `Blockly.Input.Align` is publicly accessible.
Input.Align = Align;
