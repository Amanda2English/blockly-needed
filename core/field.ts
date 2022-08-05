/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be FieldTextInput, FieldDropdown, etc.
 */

/**
 * Field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be FieldTextInput, FieldDropdown, etc.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Field');

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
// import './shortcut_registry.js';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_block_change.js';
// Unused import preserved for side-effects. Remove if unneeded.
// import './gesture.js';

import type {Block} from './block.js';
import type {BlockSvg} from './block_svg.js';
import * as browserEvents from './browser_events.js';
import * as dropDownDiv from './dropdowndiv.js';
import * as eventUtils from './events/utils.js';
import type {Input} from './input.js';
import type {IASTNodeLocationSvg} from './interfaces/i_ast_node_location_svg.js';
import type {IASTNodeLocationWithBlock} from './interfaces/i_ast_node_location_with_block.js';
import type {IKeyboardAccessible} from './interfaces/i_keyboard_accessible.js';
import type {IRegistrable} from './interfaces/i_registrable.js';
import {MarkerManager} from './marker_manager.js';
import type {ConstantProvider} from './renderers/common/constants.js';
import type {KeyboardShortcut} from './shortcut_registry.js';
import * as Tooltip from './tooltip.js';
import type {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import * as parsing from './utils/parsing.js';
import {Rect} from './utils/rect.js';
import {Sentinel} from './utils/sentinel.js';
import {Size} from './utils/size.js';
import * as style from './utils/style.js';
import {Svg} from './utils/svg.js';
import * as userAgent from './utils/useragent.js';
import * as utilsXml from './utils/xml.js';
import * as WidgetDiv from './widgetdiv.js';
import type {WorkspaceSvg} from './workspace_svg.js';
import * as Xml from './xml.js';


/**
 * Abstract class for an editable field.
 * @alias Blockly.Field
 */
export abstract class Field implements IASTNodeLocationSvg,
                                       IASTNodeLocationWithBlock,
                                       IKeyboardAccessible, IRegistrable {
  /** The default value for this field. */
  protected DEFAULT_VALUE: any = null;

  /** Non-breaking space. */
  static readonly NBSP = '\u00A0';

  /**
   * A value used to signal when a field's constructor should *not* set the
   * field's value or run configure_, and should allow a subclass to do that
   * instead.
   */
  static readonly SKIP_SETUP = new Sentinel();

  /**
   * Name of field.  Unique within each block.
   * Static labels are usually unnamed.
   */
  name?: string = undefined;
  protected value_: AnyDuringMigration;

  /** Validation function called when user edits an editable field. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Function'.
  protected validator_: Function = null as AnyDuringMigration;

  /**
   * Used to cache the field's tooltip value if setTooltip is called when the
   * field is not yet initialized. Is *not* guaranteed to be accurate.
   */
  private tooltip_: Tooltip.TipInfo|null = null;
  protected size_: Size;

  /**
   * Holds the cursors svg element when the cursor is attached to the field.
   * This is null if there is no cursor on the field.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGElement'.
  private cursorSvg_: SVGElement = null as AnyDuringMigration;

  /**
   * Holds the markers svg element when the marker is attached to the field.
   * This is null if there is no marker on the field.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGElement'.
  private markerSvg_: SVGElement = null as AnyDuringMigration;

  /** The rendered field's SVG group element. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGGElement'.
  protected fieldGroup_: SVGGElement = null as AnyDuringMigration;

  /** The rendered field's SVG border element. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGRectElement'.
  protected borderRect_: SVGRectElement = null as AnyDuringMigration;

  /** The rendered field's SVG text element. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGTextElement'.
  protected textElement_: SVGTextElement = null as AnyDuringMigration;

  /** The rendered field's text content element. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type 'Text'.
  protected textContent_: Text = null as AnyDuringMigration;

  /** Mouse down event listener data. */
  private mouseDownWrapper_: browserEvents.Data|null = null;

  /** Constants associated with the source block's renderer. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'ConstantProvider'.
  protected constants_: ConstantProvider = null as AnyDuringMigration;

  /**
   * Has this field been disposed of?
   * @internal
   */
  disposed = false;

  /** Maximum characters of text to display before adding an ellipsis. */
  maxDisplayLength = 50;

  /** Block this field is attached to.  Starts as null, then set in init. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type 'Block'.
  protected sourceBlock_: Block = null as AnyDuringMigration;

  /** Does this block need to be re-rendered? */
  protected isDirty_ = true;

  /** Is the field visible, or hidden due to the block being collapsed? */
  protected visible_ = true;

  /**
   * Can the field value be changed using the editor on an editable block?
   */
  protected enabled_ = true;

  /** The element the click handler is bound to. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Element'.
  protected clickTarget_: Element = null as AnyDuringMigration;

  /**
   * The prefix field.
   * @internal
   */
  prefixField: string|null = null;

  /**
   * The suffix field.
   * @internal
   */
  suffixField: string|null = null;

  /**
   * Editable fields usually show some sort of UI indicating they are
   * editable. They will also be saved by the serializer.
   */
  EDITABLE = true;

  /**
   * Serializable fields are saved by the serializer, non-serializable fields
   * are not. Editable fields should also be serializable. This is not the
   * case by default so that SERIALIZABLE is backwards compatible.
   */
  SERIALIZABLE = false;

  /** Mouse cursor style when over the hotspot that initiates the editor. */
  CURSOR = '';

  /**
   * @param value The initial value of the field.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   * subclasses that want to handle configuration and setting the field value
   * after their own constructors have run).
   * @param opt_validator  A function that is called to validate changes to the
   *     field's value. Takes in a value & returns a validated value, or null to
   *     abort the change.
   * @param opt_config A map of options used to configure the field.
   *    Refer to the individual field's documentation for a list of properties
   * this parameter supports.
   */
  constructor(
      value: AnyDuringMigration, opt_validator?: Function|null,
      opt_config?: FieldConfig) {
    /**
     * A generic value possessed by the field.
     * Should generally be non-null, only null when the field is created.
     */
    this.value_ = (new.target).prototype.DEFAULT_VALUE;

    /** The size of the area rendered by the field. */
    this.size_ = new Size(0, 0);

    if (value === Field.SKIP_SETUP) {
      return;
    }
    if (opt_config) {
      this.configure_(opt_config);
    }
    this.setValue(value);
    if (opt_validator) {
      this.setValidator(opt_validator);
    }
  }

  /**
   * Process the configuration map passed to the field.
   * @param config A map of options used to configure the field. See the
   *     individual field's documentation for a list of properties this
   *     parameter supports.
   */
  protected configure_(config: FieldConfig) {
    // TODO (#2884): Possibly add CSS class config option.
    // TODO (#2885): Possibly add cursor config option.
    if (config.tooltip) {
      this.setTooltip(parsing.replaceMessageReferences(config.tooltip));
    }
  }

  /**
   * Attach this field to a block.
   * @param block The block containing this field.
   */
  setSourceBlock(block: Block) {
    if (this.sourceBlock_) {
      throw Error('Field already bound to a block');
    }
    this.sourceBlock_ = block;
  }

  /**
   * Get the renderer constant provider.
   * @return The renderer constant provider.
   */
  getConstants(): ConstantProvider|null {
    if (!this.constants_ && this.sourceBlock_ && !this.sourceBlock_.disposed &&
        this.sourceBlock_.workspace.rendered) {
      this.constants_ = (this.sourceBlock_.workspace as WorkspaceSvg)
                            .getRenderer()
                            .getConstants();
    }
    return this.constants_;
  }

  /**
   * Get the block this field is attached to.
   * @return The block containing this field.
   */
  getSourceBlock(): Block {
    return this.sourceBlock_;
  }

  /**
   * Initialize everything to render this field. Override
   * methods initModel and initView rather than this method.
   * @final
   * @internal
   */
  init() {
    if (this.fieldGroup_) {
      // Field has already been initialized once.
      return;
    }
    this.fieldGroup_ = dom.createSvgElement(Svg.G, {});
    if (!this.isVisible()) {
      this.fieldGroup_.style.display = 'none';
    }
    const sourceBlockSvg = this.sourceBlock_ as BlockSvg;
    sourceBlockSvg.getSvgRoot().appendChild(this.fieldGroup_);
    this.initView();
    this.updateEditable();
    this.setTooltip(this.tooltip_);
    this.bindEvents_();
    this.initModel();
  }

  /**
   * Create the block UI for this field.
   * @internal
   */
  initView() {
    this.createBorderRect_();
    this.createTextElement_();
  }

  /**
   * Initializes the model of the field after it has been installed on a block.
   * No-op by default.
   * @internal
   */
  initModel() {}

  /**
   * Create a field border rect element. Not to be overridden by subclasses.
   * Instead modify the result of the function inside initView, or create a
   * separate function to call.
   */
  protected createBorderRect_() {
    this.borderRect_ = dom.createSvgElement(
        Svg.RECT, {
          'rx': this.getConstants()!.FIELD_BORDER_RECT_RADIUS,
          'ry': this.getConstants()!.FIELD_BORDER_RECT_RADIUS,
          'x': 0,
          'y': 0,
          'height': this.size_.height,
          'width': this.size_.width,
          'class': 'blocklyFieldRect',
        },
        this.fieldGroup_);
  }

  /**
   * Create a field text element. Not to be overridden by subclasses. Instead
   * modify the result of the function inside initView, or create a separate
   * function to call.
   */
  protected createTextElement_() {
    this.textElement_ = dom.createSvgElement(
        Svg.TEXT, {
          'class': 'blocklyText',
        },
        this.fieldGroup_);
    if (this.getConstants()!.FIELD_TEXT_BASELINE_CENTER) {
      this.textElement_.setAttribute('dominant-baseline', 'central');
    }
    this.textContent_ = document.createTextNode('');
    this.textElement_.appendChild(this.textContent_);
  }

  /**
   * Bind events to the field. Can be overridden by subclasses if they need to
   * do custom input handling.
   */
  protected bindEvents_() {
    Tooltip.bindMouseEvents(this.getClickTarget_());
    this.mouseDownWrapper_ = browserEvents.conditionalBind(
        this.getClickTarget_(), 'mousedown', this, this.onMouseDown_);
  }

  /**
   * Sets the field's value based on the given XML element. Should only be
   * called by Blockly.Xml.
   * @param fieldElement The element containing info about the field's state.
   * @internal
   */
  fromXml(fieldElement: Element) {
    this.setValue(fieldElement.textContent);
  }

  /**
   * Serializes this field's value to XML. Should only be called by Blockly.Xml.
   * @param fieldElement The element to populate with info about the field's
   *     state.
   * @return The element containing info about the field's state.
   * @internal
   */
  toXml(fieldElement: Element): Element {
    fieldElement.textContent = this.getValue();
    return fieldElement;
  }

  /**
   * Saves this fields value as something which can be serialized to JSON.
   * Should only be called by the serialization system.
   * @param _doFullSerialization If true, this signals to the field that if it
   *     normally just saves a reference to some state (eg variable fields) it
   *     should instead serialize the full state of the thing being referenced.
   * @return JSON serializable state.
   * @internal
   */
  saveState(_doFullSerialization?: boolean): AnyDuringMigration {
    const legacyState = this.saveLegacyState(Field);
    if (legacyState !== null) {
      return legacyState;
    }
    return this.getValue();
  }

  /**
   * Sets the field's state based on the given state value. Should only be
   * called by the serialization system.
   * @param state The state we want to apply to the field.
   * @internal
   */
  loadState(state: AnyDuringMigration) {
    if (this.loadLegacyState(Field, state)) {
      return;
    }
    this.setValue(state);
  }

  /**
   * Returns a stringified version of the XML state, if it should be used.
   * Otherwise this returns null, to signal the field should use its own
   * serialization.
   * @param callingClass The class calling this method.
   *     Used to see if `this` has overridden any relevant hooks.
   * @return The stringified version of the XML state, or null.
   */
  protected saveLegacyState(callingClass: AnyDuringMigration): string|null {
    if (callingClass.prototype.saveState === this.saveState &&
        callingClass.prototype.toXml !== this.toXml) {
      const elem = utilsXml.createElement('field');
      elem.setAttribute('name', this.name || '');
      const text = Xml.domToText(this.toXml(elem));
      return text.replace(
          ' xmlns="https://developers.google.com/blockly/xml"', '');
    }
    // Either they called this on purpose from their saveState, or they have
    // no implementations of either hook. Just do our thing.
    return null;
  }

  /**
   * Loads the given state using either the old XML hooks, if they should be
   * used. Returns true to indicate loading has been handled, false otherwise.
   * @param callingClass The class calling this method.
   *     Used to see if `this` has overridden any relevant hooks.
   * @param state The state to apply to the field.
   * @return Whether the state was applied or not.
   */
  loadLegacyState(callingClass: AnyDuringMigration, state: AnyDuringMigration):
      boolean {
    if (callingClass.prototype.loadState === this.loadState &&
        callingClass.prototype.fromXml !== this.fromXml) {
      this.fromXml(Xml.textToDom(state as string));
      return true;
    }
    // Either they called this on purpose from their loadState, or they have
    // no implementations of either hook. Just do our thing.
    return false;
  }

  /**
   * Dispose of all DOM objects and events belonging to this editable field.
   * @internal
   */
  dispose() {
    dropDownDiv.hideIfOwner(this);
    WidgetDiv.hideIfOwner(this);
    Tooltip.unbindMouseEvents(this.getClickTarget_());

    if (this.mouseDownWrapper_) {
      browserEvents.unbind(this.mouseDownWrapper_);
    }

    dom.removeNode(this.fieldGroup_);

    this.disposed = true;
  }

  /** Add or remove the UI indicating if this field is editable or not. */
  updateEditable() {
    const group = this.fieldGroup_;
    if (!this.EDITABLE || !group) {
      return;
    }
    if (this.enabled_ && this.sourceBlock_.isEditable()) {
      dom.addClass(group, 'blocklyEditableText');
      dom.removeClass(group, 'blocklyNonEditableText');
      group.style.cursor = this.CURSOR;
    } else {
      dom.addClass(group, 'blocklyNonEditableText');
      dom.removeClass(group, 'blocklyEditableText');
      group.style.cursor = '';
    }
  }

  /**
   * Set whether this field's value can be changed using the editor when the
   *     source block is editable.
   * @param enabled True if enabled.
   */
  setEnabled(enabled: boolean) {
    this.enabled_ = enabled;
    this.updateEditable();
  }

  /**
   * Check whether this field's value can be changed using the editor when the
   *     source block is editable.
   * @return Whether this field is enabled.
   */
  isEnabled(): boolean {
    return this.enabled_;
  }

  /**
   * Check whether this field defines the showEditor_ function.
   * @return Whether this field is clickable.
   */
  isClickable(): boolean {
    return this.enabled_ && !!this.sourceBlock_ &&
        this.sourceBlock_.isEditable() &&
        this.showEditor_ !== Field.prototype.showEditor_;
  }

  /**
   * Check whether this field is currently editable.  Some fields are never
   * EDITABLE (e.g. text labels). Other fields may be EDITABLE but may exist on
   * non-editable blocks or be currently disabled.
   * @return Whether this field is currently enabled, editable and on an
   *     editable block.
   */
  isCurrentlyEditable(): boolean {
    return this.enabled_ && this.EDITABLE && !!this.sourceBlock_ &&
        this.sourceBlock_.isEditable();
  }

  /**
   * Check whether this field should be serialized by the XML renderer.
   * Handles the logic for backwards compatibility and incongruous states.
   * @return Whether this field should be serialized or not.
   */
  isSerializable(): boolean {
    let isSerializable = false;
    if (this.name) {
      if (this.SERIALIZABLE) {
        isSerializable = true;
      } else if (this.EDITABLE) {
        console.warn(
            'Detected an editable field that was not serializable.' +
            ' Please define SERIALIZABLE property as true on all editable custom' +
            ' fields. Proceeding with serialization.');
        isSerializable = true;
      }
    }
    return isSerializable;
  }

  /**
   * Gets whether this editable field is visible or not.
   * @return True if visible.
   */
  isVisible(): boolean {
    return this.visible_;
  }

  /**
   * Sets whether this editable field is visible or not. Should only be called
   * by input.setVisible.
   * @param visible True if visible.
   * @internal
   */
  setVisible(visible: boolean) {
    if (this.visible_ === visible) {
      return;
    }
    this.visible_ = visible;
    const root = this.getSvgRoot();
    if (root) {
      root.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Sets a new validation function for editable fields, or clears a previously
   * set validator.
   *
   * The validator function takes in the new field value, and returns
   * validated value. The validated value could be the input value, a modified
   * version of the input value, or null to abort the change.
   *
   * If the function does not return anything (or returns undefined) the new
   * value is accepted as valid. This is to allow for fields using the
   * validated function as a field-level change event notification.
   *
   * @param handler The validator function or null to clear a previous
   *     validator.
   */
  setValidator(handler: Function) {
    this.validator_ = handler;
  }

  /**
   * Gets the validation function for editable fields, or null if not set.
   * @return Validation function, or null.
   */
  getValidator(): Function|null {
    return this.validator_;
  }

  /**
   * Gets the group element for this editable field.
   * Used for measuring the size and for positioning.
   * @return The group element.
   */
  getSvgRoot(): SVGGElement {
    return this.fieldGroup_;
  }

  /**
   * Updates the field to match the colour/style of the block. Should only be
   * called by BlockSvg.applyColour().
   * @internal
   */
  applyColour() {}
  // Non-abstract sub-classes may wish to implement this. See FieldDropdown.

  /**
   * Used by getSize() to move/resize any DOM elements, and get the new size.
   *
   * All rendering that has an effect on the size/shape of the block should be
   * done here, and should be triggered by getSize().
   */
  protected render_() {
    if (this.textContent_) {
      this.textContent_.nodeValue = this.getDisplayText_();
    }
    this.updateSize_();
  }

  /**
   * Calls showEditor_ when the field is clicked if the field is clickable.
   * Do not override.
   * @param opt_e Optional mouse event that triggered the field to open, or
   *     undefined if triggered programmatically.
   * @final
   * @internal
   */
  showEditor(opt_e?: Event) {
    if (this.isClickable()) {
      this.showEditor_(opt_e);
    }
  }

  /**
   * A developer hook to create an editor for the field. This is no-op by
   * default, and must be overriden to create an editor.
   * @param _e Optional mouse event that triggered the field to open, or
   *     undefined if triggered programmatically.
   */
  protected showEditor_(_e?: Event): void {}
  // NOP

  /**
   * Updates the size of the field based on the text.
   * @param opt_margin margin to use when positioning the text element.
   */
  protected updateSize_(opt_margin?: number) {
    const constants = this.getConstants();
    const xOffset = opt_margin !== undefined ? opt_margin :
        this.borderRect_ ? this.getConstants()!.FIELD_BORDER_RECT_X_PADDING :
                           0;
    let totalWidth = xOffset * 2;
    let totalHeight = constants!.FIELD_TEXT_HEIGHT;

    let contentWidth = 0;
    if (this.textElement_) {
      contentWidth = dom.getFastTextWidth(
          this.textElement_, constants!.FIELD_TEXT_FONTSIZE,
          constants!.FIELD_TEXT_FONTWEIGHT, constants!.FIELD_TEXT_FONTFAMILY);
      totalWidth += contentWidth;
    }
    if (this.borderRect_) {
      totalHeight = Math.max(totalHeight, constants!.FIELD_BORDER_RECT_HEIGHT);
    }

    this.size_.height = totalHeight;
    this.size_.width = totalWidth;

    this.positionTextElement_(xOffset, contentWidth);
    this.positionBorderRect_();
  }

  /**
   * Position a field's text element after a size change.  This handles both LTR
   * and RTL positioning.
   * @param xOffset x offset to use when positioning the text element.
   * @param contentWidth The content width.
   */
  protected positionTextElement_(xOffset: number, contentWidth: number) {
    if (!this.textElement_) {
      return;
    }
    const constants = this.getConstants();
    const halfHeight = this.size_.height / 2;

    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.textElement_.setAttribute(
        'x',
        (this.sourceBlock_.RTL ? this.size_.width - contentWidth - xOffset :
                                 xOffset) as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.textElement_.setAttribute(
        'y',
        (constants!.FIELD_TEXT_BASELINE_CENTER ?
             halfHeight :
             halfHeight - constants!.FIELD_TEXT_HEIGHT / 2 +
                 constants!.FIELD_TEXT_BASELINE) as AnyDuringMigration);
  }

  /** Position a field's border rect after a size change. */
  protected positionBorderRect_() {
    if (!this.borderRect_) {
      return;
    }
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.borderRect_.setAttribute(
        'width', this.size_.width as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.borderRect_.setAttribute(
        'height', this.size_.height as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.borderRect_.setAttribute(
        'rx',
        this.getConstants()!.FIELD_BORDER_RECT_RADIUS as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.borderRect_.setAttribute(
        'ry',
        this.getConstants()!.FIELD_BORDER_RECT_RADIUS as AnyDuringMigration);
  }

  /**
   * Returns the height and width of the field.
   *
   * This should *in general* be the only place render_ gets called from.
   * @return Height and width.
   */
  getSize(): Size {
    if (!this.isVisible()) {
      return new Size(0, 0);
    }

    if (this.isDirty_) {
      this.render_();
      this.isDirty_ = false;
    } else if (this.visible_ && this.size_.width === 0) {
      // If the field is not visible the width will be 0 as well, one of the
      // problems with the old system.
      console.warn(
          'Deprecated use of setting size_.width to 0 to rerender a' +
          ' field. Set field.isDirty_ to true instead.');
      this.render_();
    }
    return this.size_;
  }

  /**
   * Returns the bounding box of the rendered field, accounting for workspace
   * scaling.
   * @return An object with top, bottom, left, and right in pixels relative to
   *     the top left corner of the page (window coordinates).
   * @internal
   */
  getScaledBBox(): Rect {
    let scaledWidth;
    let scaledHeight;
    let xy;
    if (!this.borderRect_) {
      // Browsers are inconsistent in what they return for a bounding box.
      // - Webkit / Blink: fill-box / object bounding box
      // - Gecko / Triden / EdgeHTML: stroke-box
      const bBox = (this.sourceBlock_ as BlockSvg).getHeightWidth();
      const scale = (this.sourceBlock_.workspace as WorkspaceSvg).scale;
      xy = this.getAbsoluteXY_();
      scaledWidth = bBox.width * scale;
      scaledHeight = bBox.height * scale;

      if (userAgent.GECKO) {
        xy.x += 1.5 * scale;
        xy.y += 1.5 * scale;
        scaledWidth += 1 * scale;
        scaledHeight += 1 * scale;
      } else {
        if (!userAgent.EDGE && !userAgent.IE) {
          xy.x -= 0.5 * scale;
          xy.y -= 0.5 * scale;
        }
        scaledWidth += 1 * scale;
        scaledHeight += 1 * scale;
      }
    } else {
      const bBox = this.borderRect_.getBoundingClientRect();
      xy = style.getPageOffset(this.borderRect_);
      scaledWidth = bBox.width;
      scaledHeight = bBox.height;
    }
    return new Rect(xy.y, xy.y + scaledHeight, xy.x, xy.x + scaledWidth);
  }

  /**
   * Get the text from this field to display on the block. May differ from
   * ``getText`` due to ellipsis, and other formatting.
   * @return Text to display.
   */
  protected getDisplayText_(): string {
    let text = this.getText();
    if (!text) {
      // Prevent the field from disappearing if empty.
      return Field.NBSP;
    }
    if (text.length > this.maxDisplayLength) {
      // Truncate displayed string and add an ellipsis ('...').
      text = text.substring(0, this.maxDisplayLength - 2) + '\u2026';
    }
    // Replace whitespace with non-breaking spaces so the text doesn't collapse.
    text = text.replace(/\s/g, Field.NBSP);
    if (this.sourceBlock_ && this.sourceBlock_.RTL) {
      // The SVG is LTR, force text to be RTL.
      text += '\u200F';
    }
    return text;
  }

  /**
   * Get the text from this field.
   * Override getText_ to provide a different behavior than simply casting the
   * value to a string.
   * @return Current text.
   * @final
   */
  getText(): string {
    // this.getText_ was intended so that devs don't have to remember to call
    // super when overriding how the text of the field is generated. (#2910)
    const text = this.getText_();
    if (text !== null) {
      return String(text);
    }
    return String(this.getValue());
  }

  /**
   * A developer hook to override the returned text of this field.
   * Override if the text representation of the value of this field
   * is not just a string cast of its value.
   * Return null to resort to a string cast.
   * @return Current text or null.
   */
  protected getText_(): string|null {
    return null;
  }

  /**
   * Force a rerender of the block that this field is installed on, which will
   * rerender this field and adjust for any sizing changes.
   * Other fields on the same block will not rerender, because their sizes have
   * already been recorded.
   * @internal
   */
  markDirty() {
    this.isDirty_ = true;
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'ConstantProvider'.
    this.constants_ = null as AnyDuringMigration;
  }

  /**
   * Force a rerender of the block that this field is installed on, which will
   * rerender this field and adjust for any sizing changes.
   * Other fields on the same block will not rerender, because their sizes have
   * already been recorded.
   * @internal
   */
  forceRerender() {
    this.isDirty_ = true;
    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
      (this.sourceBlock_ as BlockSvg).render();
      (this.sourceBlock_ as BlockSvg).bumpNeighbours();
      this.updateMarkers_();
    }
  }

  /**
   * Used to change the value of the field. Handles validation and events.
   * Subclasses should override doClassValidation_ and doValueUpdate_ rather
   * than this method.
   * @param newValue New value.
   * @final
   */
  setValue(newValue: AnyDuringMigration) {
    const doLogging = false;
    if (newValue === null) {
      doLogging && console.log('null, return');
      // Not a valid value to check.
      return;
    }

    let validatedValue = this.doClassValidation_(newValue);
    // Class validators might accidentally forget to return, we'll ignore that.
    newValue = this.processValidation_(newValue, validatedValue);
    if (newValue instanceof Error) {
      doLogging && console.log('invalid class validation, return');
      return;
    }

    const localValidator = this.getValidator();
    if (localValidator) {
      validatedValue = localValidator.call(this, newValue);
      // Local validators might accidentally forget to return, we'll ignore
      // that.
      newValue = this.processValidation_(newValue, validatedValue);
      if (newValue instanceof Error) {
        doLogging && console.log('invalid local validation, return');
        return;
      }
    }
    const source = this.sourceBlock_;
    if (source && source.disposed) {
      doLogging && console.log('source disposed, return');
      return;
    }
    const oldValue = this.getValue();
    if (oldValue === newValue) {
      doLogging && console.log('same, doValueUpdate_, return');
      this.doValueUpdate_(newValue);
      return;
    }

    this.doValueUpdate_(newValue);
    if (source && eventUtils.isEnabled()) {
      eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))!
                      (source, 'field', this.name || null, oldValue, newValue));
    }
    if (this.isDirty_) {
      this.forceRerender();
    }
    doLogging && console.log(this.value_);
  }

  /**
   * Process the result of validation.
   * @param newValue New value.
   * @param validatedValue Validated value.
   * @return New value, or an Error object.
   */
  private processValidation_(
      newValue: AnyDuringMigration,
      validatedValue: AnyDuringMigration): AnyDuringMigration {
    if (validatedValue === null) {
      this.doValueInvalid_(newValue);
      if (this.isDirty_) {
        this.forceRerender();
      }
      return Error();
    }
    if (validatedValue !== undefined) {
      newValue = validatedValue;
    }
    return newValue;
  }

  /**
   * Get the current value of the field.
   * @return Current value.
   */
  getValue(): AnyDuringMigration {
    return this.value_;
  }

  /**
   * Used to validate a value. Returns input by default. Can be overridden by
   * subclasses, see FieldDropdown.
   * @param opt_newValue The value to be validated.
   * @return The validated value, same as input by default.
   */
  protected doClassValidation_(opt_newValue?: AnyDuringMigration):
      AnyDuringMigration {
    if (opt_newValue === null || opt_newValue === undefined) {
      return null;
    }
    return opt_newValue;
  }

  /**
   * Used to update the value of a field. Can be overridden by subclasses to do
   * custom storage of values/updating of external things.
   * @param newValue The value to be saved.
   */
  protected doValueUpdate_(newValue: AnyDuringMigration) {
    this.value_ = newValue;
    this.isDirty_ = true;
  }

  /**
   * Used to notify the field an invalid value was input. Can be overridden by
   * subclasses, see FieldTextInput.
   * No-op by default.
   * @param _invalidValue The input value that was determined to be invalid.
   */
  protected doValueInvalid_(_invalidValue: AnyDuringMigration) {}
  // NOP

  /**
   * Handle a mouse down event on a field.
   * @param e Mouse down event.
   */
  protected onMouseDown_(e: Event) {
    if (!this.sourceBlock_ || this.sourceBlock_.disposed) {
      return;
    }
    const gesture = (this.sourceBlock_.workspace as WorkspaceSvg).getGesture(e);
    if (gesture) {
      gesture.setStartField(this);
    }
  }

  /**
   * Sets the tooltip for this field.
   * @param newTip The text for the tooltip, a function that returns the text
   *     for the tooltip, a parent object whose tooltip will be used, or null to
   *     display the tooltip of the parent block. To not display a tooltip pass
   *     the empty string.
   */
  setTooltip(newTip: Tooltip.TipInfo|null) {
    if (!newTip && newTip !== '') {  // If null or undefined.
      newTip = this.sourceBlock_;
    }
    const clickTarget = this.getClickTarget_();
    if (clickTarget) {
      (clickTarget as AnyDuringMigration).tooltip = newTip;
    } else {
      // Field has not been initialized yet.
      this.tooltip_ = newTip;
    }
  }

  /**
   * Returns the tooltip text for this field.
   * @return The tooltip text for this field.
   */
  getTooltip(): string {
    const clickTarget = this.getClickTarget_();
    if (clickTarget) {
      return Tooltip.getTooltipOfObject(clickTarget);
    }
    // Field has not been initialized yet. Return stashed this.tooltip_ value.
    return Tooltip.getTooltipOfObject({tooltip: this.tooltip_});
  }

  /**
   * The element to bind the click handler to. If not set explicitly, defaults
   * to the SVG root of the field. When this element is
   * clicked on an editable field, the editor will open.
   * @return Element to bind click handler to.
   */
  protected getClickTarget_(): Element {
    return this.clickTarget_ || this.getSvgRoot();
  }

  /**
   * Return the absolute coordinates of the top-left corner of this field.
   * The origin (0,0) is the top-left corner of the page body.
   * @return Object with .x and .y properties.
   */
  protected getAbsoluteXY_(): Coordinate {
    return style.getPageOffset(this.getClickTarget_() as SVGRectElement);
  }

  /**
   * Whether this field references any Blockly variables.  If true it may need
   * to be handled differently during serialization and deserialization.
   * Subclasses may override this.
   * @return True if this field has any variable references.
   * @internal
   */
  referencesVariables(): boolean {
    return false;
  }

  /**
   * Refresh the variable name referenced by this field if this field references
   * variables.
   * @internal
   */
  refreshVariableName() {}
  // NOP

  /**
   * Search through the list of inputs and their fields in order to find the
   * parent input of a field.
   * @return The input that the field belongs to.
   * @internal
   */
  getParentInput(): Input {
    let parentInput = null;
    const block = this.sourceBlock_;
    const inputs = block.inputList;

    for (let idx = 0; idx < block.inputList.length; idx++) {
      const input = inputs[idx];
      const fieldRows = input.fieldRow;
      for (let j = 0; j < fieldRows.length; j++) {
        if (fieldRows[j] === this) {
          parentInput = input;
          break;
        }
      }
    }
    // AnyDuringMigration because:  Type 'Input | null' is not assignable to
    // type 'Input'.
    return parentInput as AnyDuringMigration;
  }

  /**
   * Returns whether or not we should flip the field in RTL.
   * @return True if we should flip in RTL.
   */
  getFlipRtl(): boolean {
    return false;
  }

  /**
   * Returns whether or not the field is tab navigable.
   * @return True if the field is tab navigable.
   */
  isTabNavigable(): boolean {
    return false;
  }

  /**
   * Handles the given keyboard shortcut.
   * @param _shortcut The shortcut to be handled.
   * @return True if the shortcut has been handled, false otherwise.
   */
  onShortcut(_shortcut: KeyboardShortcut): boolean {
    return false;
  }

  /**
   * Add the cursor SVG to this fields SVG group.
   * @param cursorSvg The SVG root of the cursor to be added to the field group.
   * @internal
   */
  setCursorSvg(cursorSvg: SVGElement) {
    if (!cursorSvg) {
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'SVGElement'.
      this.cursorSvg_ = null as AnyDuringMigration;
      return;
    }

    this.fieldGroup_.appendChild(cursorSvg);
    this.cursorSvg_ = cursorSvg;
  }

  /**
   * Add the marker SVG to this fields SVG group.
   * @param markerSvg The SVG root of the marker to be added to the field group.
   * @internal
   */
  setMarkerSvg(markerSvg: SVGElement) {
    if (!markerSvg) {
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'SVGElement'.
      this.markerSvg_ = null as AnyDuringMigration;
      return;
    }

    this.fieldGroup_.appendChild(markerSvg);
    this.markerSvg_ = markerSvg;
  }

  /** Redraw any attached marker or cursor svgs if needed. */
  protected updateMarkers_() {
    const workspace = this.sourceBlock_.workspace as WorkspaceSvg;
    if (workspace.keyboardAccessibilityMode && this.cursorSvg_) {
      workspace.getCursor()!.draw();
    }
    if (workspace.keyboardAccessibilityMode && this.markerSvg_) {
      // TODO(#4592): Update all markers on the field.
      workspace.getMarker(MarkerManager.LOCAL_MARKER)!.draw();
    }
  }
}

/**
 * Extra configuration options for the base field.
 */
export interface FieldConfig {
  tooltip?: string;
}
