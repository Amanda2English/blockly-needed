/** @fileoverview An item in the toolbox. */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * An item in the toolbox.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { ICollapsibleToolboxItem } from '../interfaces/i_collapsible_toolbox_item';
/* eslint-disable-next-line no-unused-vars */
import { IToolbox } from '../interfaces/i_toolbox';
/* eslint-disable-next-line no-unused-vars */
import { IToolboxItem } from '../interfaces/i_toolbox_item';
import * as idGenerator from '../utils/idgenerator';
/* eslint-disable-next-line no-unused-vars */
import * as toolbox from '../utils/toolbox';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from '../workspace_svg';


/**
 * Class for an item in the toolbox.
 * @alias Blockly.ToolboxItem
 */
export class ToolboxItem implements IToolboxItem {
  protected id_: string;
  protected parent_: ICollapsibleToolboxItem | null;
  protected level_: number;
  protected toolboxItemDef_: toolbox.ToolboxItemInfo | null;
  protected workspace_: WorkspaceSvg;

  /**
   * @param toolboxItemDef The JSON defining the toolbox item.
   * @param parentToolbox The toolbox that holds the toolbox item.
   * @param opt_parent The parent toolbox item or null if the category does not
   *     have a parent.
   */
  constructor(
    toolboxItemDef: toolbox.ToolboxItemInfo,
    protected readonly parentToolbox: IToolbox,
    opt_parent?: ICollapsibleToolboxItem) {
    /** The id for the category. */
    this.id_ = (toolboxItemDef as AnyDuringMigration)['toolboxitemid'] ||
      idGenerator.getNextUniqueId();

    /** The parent of the category. */
    this.parent_ = opt_parent || null;

    /** The level that the category is nested at. */
    this.level_ = this.parent_ ? this.parent_.getLevel() + 1 : 0;

    /** The JSON definition of the toolbox item. */
    this.toolboxItemDef_ = toolboxItemDef;

    /** The workspace of the parent toolbox. */
    this.workspace_ = this.parentToolbox.getWorkspace();
  }

  /**
   * Initializes the toolbox item.
   * This includes creating the DOM and updating the state of any items based
   * on the info object.
   */
  init() {}
  // No-op by default.

  /**
   * Gets the div for the toolbox item.
   * @return The div for the toolbox item.
   */
  getDiv(): Element | null {
    return null;
  }

  /**
   * Gets the HTML element that is clickable.
   * The parent toolbox element receives clicks. The parent toolbox will add an
   * ID to this element so it can pass the onClick event to the correct
   * toolboxItem.
   * @return The HTML element that receives clicks, or null if this item should
   *     not receive clicks.
   */
  getClickTarget(): Element | null {
    return null;
  }

  /**
   * Gets a unique identifier for this toolbox item.
   * @return The ID for the toolbox item.
   */
  getId(): string {
    return this.id_;
  }

  /**
   * Gets the parent if the toolbox item is nested.
   * @return The parent toolbox item, or null if this toolbox item is not
   *     nested.
   */
  getParent(): ICollapsibleToolboxItem | null {
    return null;
  }

  /**
   * Gets the nested level of the category.
   * @return The nested level of the category.
   */
  getLevel(): number {
    return this.level_;
  }

  /**
   * Whether the toolbox item is selectable.
   * @return True if the toolbox item can be selected.
   */
  isSelectable(): boolean {
    return false;
  }

  /**
   * Whether the toolbox item is collapsible.
   * @return True if the toolbox item is collapsible.
   */
  isCollapsible(): boolean {
    return false;
  }

  /** Dispose of this toolbox item. No-op by default. */
  dispose() {}

  /**
   * Sets whether the category is visible or not.
   * For a category to be visible its parent category must also be expanded.
   * @param _isVisible True if category should be visible.
   */
  setVisible_(_isVisible: boolean) {}
}
// nop by default
