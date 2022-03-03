/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The top level namespace used to access the Blockly library.
 */
'use strict';

/**
 * The top level namespace used to access the Blockly library.
 * @namespace Blockly
 */
goog.declareModuleId('Blockly');

import * as ContextMenu from './contextmenu.js';
import * as ContextMenuItems from './contextmenu_items.js';
import * as Css from './css.js';
import * as Events from './events/events.js';
import * as Extensions from './extensions.js';
import * as Procedures from './procedures.js';
import * as ShortcutItems from './shortcut_items.js';
import * as Themes from './theme/themes.js';
import * as Tooltip from './tooltip.js';
import * as Touch from './touch.js';
import * as Variables from './variables.js';
import * as VariablesDynamic from './variables_dynamic.js';
import * as WidgetDiv from './widgetdiv.js';
import * as Xml from './xml.js';
import * as blockAnimations from './block_animations.js';
import * as blockRendering from './renderers/common/block_rendering.js';
import * as browserEvents from './browser_events.js';
import * as bumpObjects from './bump_objects.js';
import * as clipboard from './clipboard.js';
import * as colour from './utils/colour.js';
import * as common from './common.js';
import * as constants from './constants.js';
import * as deprecation from './utils/deprecation.js';
import * as dropDownDiv from './dropdowndiv.js';
import * as dialog from './dialog.js';
import * as fieldRegistry from './field_registry.js';
import * as geras from './renderers/geras/geras.js';
import * as internalConstants from './internal_constants.js';
import * as minimalist from './renderers/minimalist/minimalist.js';
import * as registry from './registry.js';
import * as serializationBlocks from './serialization/blocks.js';
import * as serializationExceptions from './serialization/exceptions.js';
import * as serializationPriorities from './serialization/priorities.js';
import * as serializationRegistry from './serialization/registry.js';
import * as serializationVariables from './serialization/variables.js';
import * as serializationWorkspaces from './serialization/workspaces.js';
import * as svgMath from './utils/svg_math.js';
import * as thrasos from './renderers/thrasos/thrasos.js';
import * as toolbox from './utils/toolbox.js';
import * as uiPosition from './positionable_helpers.js';
import * as utils from './utils.js';
import * as zelos from './renderers/zelos/zelos.js';
import {Align, Input} from './input.js';
import {ASTNode} from './keyboard_nav/ast_node.js';
import {BasicCursor} from './keyboard_nav/basic_cursor.js';
import {BlockDragSurfaceSvg} from './block_drag_surface.js';
import {BlockDragger} from './block_dragger.js';
import {BlockSvg} from './block_svg.js';
import {BlocklyOptions} from './blockly_options.js';
import {Blocks} from './blocks.js';
import {Block} from './block.js';
import {BubbleDragger} from './bubble_dragger.js';
import {Bubble} from './bubble.js';
import {CollapsibleToolboxCategory} from './toolbox/collapsible_category.js';
import {Comment} from './comment.js';
import {ComponentManager} from './component_manager.js';
import {config} from './config.js';
import {ConnectionChecker} from './connection_checker.js';
import {ConnectionDB} from './connection_db.js';
import {ConnectionType} from './connection_type.js';
import {Connection} from './connection.js';
import {ContextMenuRegistry} from './contextmenu_registry.js';
import {Cursor} from './keyboard_nav/cursor.js';
import {DeleteArea} from './delete_area.js';
import {DragTarget} from './drag_target.js';
import {DropDownDiv} from './dropdowndiv.js';
import {FieldAngle} from './field_angle.js';
import {FieldCheckbox} from './field_checkbox.js';
import {FieldColour} from './field_colour.js';
import {FieldDropdown} from './field_dropdown.js';
import {FieldImage} from './field_image.js';
import {FieldLabelSerializable} from './field_label_serializable.js';
import {FieldLabel} from './field_label.js';
import {FieldMultilineInput} from './field_multilineinput.js';
import {FieldNumber} from './field_number.js';
import {FieldTextInput} from './field_textinput.js';
import {FieldVariable} from './field_variable.js';
import {Field} from './field.js';
import {FlyoutButton} from './flyout_button.js';
import {FlyoutMetricsManager} from './flyout_metrics_manager.js';
import {Flyout} from './flyout_base.js';
import {Generator} from './generator.js';
import {Gesture} from './gesture.js';
import {Grid} from './grid.js';
import {HorizontalFlyout} from './flyout_horizontal.js';
import {IASTNodeLocationSvg} from './interfaces/i_ast_node_location_svg.js';
import {IASTNodeLocationWithBlock} from './interfaces/i_ast_node_location_with_block.js';
import {IASTNodeLocation} from './interfaces/i_ast_node_location.js';
import {IAutoHideable} from './interfaces/i_autohideable.js';
import {IBlockDragger} from './interfaces/i_block_dragger.js';
import {IBoundedElement} from './interfaces/i_bounded_element.js';
import {IBubble} from './interfaces/i_bubble.js';
import {ICollapsibleToolboxItem} from './interfaces/i_collapsible_toolbox_item.js';
import {IComponent} from './interfaces/i_component.js';
import {IConnectionChecker} from './interfaces/i_connection_checker.js';
import {IContextMenu} from './interfaces/i_contextmenu.js';
import {ICopyable} from './interfaces/i_copyable.js';
import {IDeletable} from './interfaces/i_deletable.js';
import {IDeleteArea} from './interfaces/i_delete_area.js';
import {IDragTarget} from './interfaces/i_drag_target.js';
import {IDraggable} from './interfaces/i_draggable.js';
import {IFlyout} from './interfaces/i_flyout.js';
import {IKeyboardAccessible} from './interfaces/i_keyboard_accessible.js';
import {IMetricsManager} from './interfaces/i_metrics_manager.js';
import {IMovable} from './interfaces/i_movable.js';
import {IPositionable} from './interfaces/i_positionable.js';
import {IRegistrableField} from './interfaces/i_registrable_field.js';
import {IRegistrable} from './interfaces/i_registrable.js';
import {ISelectableToolboxItem} from './interfaces/i_selectable_toolbox_item.js';
import {ISelectable} from './interfaces/i_selectable.js';
import {ISerializer} from './interfaces/i_serializer.js';
import {IStyleable} from './interfaces/i_styleable.js';
import {IToolboxItem} from './interfaces/i_toolbox_item.js';
import {IToolbox} from './interfaces/i_toolbox.js';
import {Icon} from './icon.js';
import {InsertionMarkerManager} from './insertion_marker_manager.js';
import {Marker} from './keyboard_nav/marker.js';
import {MarkerManager} from './marker_manager.js';
import {MenuItem} from './menuitem.js';
import {Menu} from './menu.js';
import {MetricsManager} from './metrics_manager.js';
import {Mutator} from './mutator.js';
import {Msg} from './msg.js';
import {Names} from './names.js';
import {Options} from './options.js';
import {RenderedConnection} from './rendered_connection.js';
import {ScrollbarPair} from './scrollbar_pair.js';
import {Scrollbar} from './scrollbar.js';
import {ShortcutRegistry} from './shortcut_registry.js';
import {TabNavigateCursor} from './keyboard_nav/tab_navigate_cursor.js';
import {ThemeManager} from './theme_manager.js';
import {Theme} from './theme.js';
import {ToolboxCategory} from './toolbox/category.js';
import {ToolboxItem} from './toolbox/toolbox_item.js';
import {ToolboxSeparator} from './toolbox/separator.js';
import {Toolbox} from './toolbox/toolbox.js';
import {TouchGesture} from './touch_gesture.js';
import {Trashcan} from './trashcan.js';
import {VariableMap} from './variable_map.js';
import {VariableModel} from './variable_model.js';
import {VerticalFlyout} from './flyout_vertical.js';
import {Warning} from './warning.js';
import {WorkspaceAudio} from './workspace_audio.js';
import {WorkspaceCommentSvg} from './workspace_comment_svg.js';
import {WorkspaceComment} from './workspace_comment.js';
import {WorkspaceDragSurfaceSvg} from './workspace_drag_surface_svg.js';
import {WorkspaceDragger} from './workspace_dragger.js';
import {WorkspaceSvg, resizeSvgContents} from './workspace_svg.js';
import {Workspace} from './workspace.js';
import {ZoomControls} from './zoom_controls.js';
import {globalThis} from './utils/global.js';
import {inject} from './inject.js';
import {inputTypes} from './input_types.js';
/** @suppress {extraRequire} */
import './events/events_block_create.js';
/** @suppress {extraRequire} */
import './events/workspace_events.js';
/** @suppress {extraRequire} */
import './events/events_ui.js';
/** @suppress {extraRequire} */
import './events/events_ui_base.js';
/** @suppress {extraRequire} */
import './events/events_var_create.js';


/**
 * Blockly core version.
 * This constant is overridden by the build script (npm run build) to the value
 * of the version in package.json. This is done by the Closure Compiler in the
 * buildCompressed gulp task.
 * For local builds, you can pass --define='Blockly.VERSION=X.Y.Z' to the
 * compiler to override this constant.
 * @define {string}
 * @alias Blockly.VERSION
 */
export var VERSION = 'uncompiled';

/*
 * Top-level functions and properties on the Blockly namespace.
 * These are used only in external code. Do not reference these
 * from internal code as importing from this file can cause circular
 * dependencies. Do not add new functions here. There is probably a better
 * namespace to put new functions on.
 */

/*
 * Aliases for input alignments used in block defintions.
 */

/**
 * @see Blockly.Input.Align.LEFT
 * @alias Blockly.ALIGN_LEFT
 */
export var ALIGN_LEFT = Align.LEFT;

/**
 * @see Blockly.Input.Align.CENTRE
 * @alias Blockly.ALIGN_CENTRE
 */
export var ALIGN_CENTRE = Align.CENTRE;

/**
 * @see Blockly.Input.Align.RIGHT
 * @alias Blockly.ALIGN_RIGHT
 */
export var ALIGN_RIGHT = Align.RIGHT;

/*
 * Aliases for constants used for connection and input types.
 */

/**
 * @see ConnectionType.INPUT_VALUE
 * @alias Blockly.INPUT_VALUE
 */
export var INPUT_VALUE = ConnectionType.INPUT_VALUE;

/**
 * @see ConnectionType.OUTPUT_VALUE
 * @alias Blockly.OUTPUT_VALUE
 */
export var OUTPUT_VALUE = ConnectionType.OUTPUT_VALUE;

/**
 * @see ConnectionType.NEXT_STATEMENT
 * @alias Blockly.NEXT_STATEMENT
 */
export var NEXT_STATEMENT = ConnectionType.NEXT_STATEMENT;

/**
 * @see ConnectionType.PREVIOUS_STATEMENT
 * @alias Blockly.PREVIOUS_STATEMENT
 */
export var PREVIOUS_STATEMENT = ConnectionType.PREVIOUS_STATEMENT;

/**
 * @see inputTypes.DUMMY_INPUT
 * @alias Blockly.DUMMY_INPUT
 */
export var DUMMY_INPUT = inputTypes.DUMMY;

/**
 * Aliases for toolbox positions.
 */

/**
 * @see toolbox.Position.TOP
 * @alias Blockly.TOOLBOX_AT_TOP
 */
export var TOOLBOX_AT_TOP = toolbox.Position.TOP;

/**
 * @see toolbox.Position.BOTTOM
 * @alias Blockly.TOOLBOX_AT_BOTTOM
 */
export var TOOLBOX_AT_BOTTOM = toolbox.Position.BOTTOM;

/**
 * @see toolbox.Position.LEFT
 * @alias Blockly.TOOLBOX_AT_LEFT
 */
export var TOOLBOX_AT_LEFT = toolbox.Position.LEFT;

/**
 * @see toolbox.Position.RIGHT
 * @alias Blockly.TOOLBOX_AT_RIGHT
 */
export var TOOLBOX_AT_RIGHT = toolbox.Position.RIGHT;

/*
 * Other aliased functions.
 */

/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See workspace.resizeContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!WorkspaceSvg} workspace Any workspace in the SVG.
 * @see Blockly.common.svgResize
 * @alias Blockly.svgResize
 */
export var svgResize = common.svgResize;

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_onlyClosePopups Whether only popups should be closed.
 * @see Blockly.WorkspaceSvg.hideChaff
 * @alias Blockly.hideChaff
 */
const hideChaff = function(opt_onlyClosePopups) {
  /** @type {!WorkspaceSvg} */ (common.getMainWorkspace())
      .hideChaff(opt_onlyClosePopups);
};
export {hideChaff};

/**
 * Returns the main workspace.  Returns the last used main workspace (based on
 * focus).  Try not to use this function, particularly if there are multiple
 * Blockly instances on a page.
 * @return {!Workspace} The main workspace.
 * @see Blockly.common.getMainWorkspace
 * @alias Blockly.getMainWorkspace
 */
export var getMainWorkspace = common.getMainWorkspace;

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 * @param {!Array<!Object>} jsonArray An array of JSON block definitions.
 * @see Blockly.common.defineBlocksWithJsonArray
 * @alias Blockly.defineBlocksWithJsonArray
 */
export var defineBlocksWithJsonArray = common.defineBlocksWithJsonArray;

/**
 * Set the parent container.  This is the container element that the WidgetDiv,
 * dropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
 * is called.
 * This method is a NOP if called after the first ``Blockly.inject``.
 * @param {!Element} container The container element.
 * @see Blockly.common.setParentContainer
 * @alias Blockly.setParentContainer
 */
export var setParentContainer = common.setParentContainer;

/**
 * Returns the dimensions of the specified SVG image.
 * @param {!SVGElement} svg SVG image.
 * @return {!Size} Contains width and height properties.
 * @deprecated Use workspace.setCachedParentSvgSize. (2021 March 5)
 * @see Blockly.WorkspaceSvg.setCachedParentSvgSize
 * @alias Blockly.svgSize
 */
export var svgSize = svgMath.svgSize;

/**
 * Size the workspace when the contents change.  This also updates
 * scrollbars accordingly.
 * @param {!WorkspaceSvg} workspace The workspace to resize.
 * @deprecated Use workspace.resizeContents. (2021 December)
 * @see Blockly.WorkspaceSvg.resizeContents
 * @alias Blockly.resizeSvgContents
 */
const resizeSvgContentsLocal = function(workspace) {
  deprecation.warn(
      'Blockly.resizeSvgContents', 'December 2021', 'December 2022',
      'Blockly.WorkspaceSvg.resizeSvgContents');
  resizeSvgContents(workspace);
};
export {resizeSvgContentsLocal as resizeSvgContents};

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param {!ICopyable} toCopy Block or Workspace Comment to be copied.
 * @deprecated Use Blockly.clipboard.copy(). (2021 December)
 * @see Blockly.clipboard.copy
 * @alias Blockly.copy
 */
const copy = function(toCopy) {
  deprecation.warn(
      'Blockly.copy', 'December 2021', 'December 2022',
      'Blockly.clipboard.copy');
  clipboard.copy(toCopy);
};
export {copy};

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return {boolean} True if the paste was successful, false otherwise.
 * @deprecated Use Blockly.clipboard.paste(). (2021 December)
 * @see Blockly.clipboard.paste
 * @alias Blockly.paste
 */
const paste = function() {
  deprecation.warn(
      'Blockly.paste', 'December 2021', 'December 2022',
      'Blockly.clipboard.paste');
  return !!clipboard.paste();
};
export {paste};

/**
 * Duplicate this block and its children, or a workspace comment.
 * @param {!ICopyable} toDuplicate Block or Workspace Comment to be
 *     copied.
 * @deprecated Use Blockly.clipboard.duplicate(). (2021 December)
 * @see Blockly.clipboard.duplicate
 * @alias Blockly.duplicate
 */
const duplicate = function(toDuplicate) {
  deprecation.warn(
      'Blockly.duplicate', 'December 2021', 'December 2022',
      'Blockly.clipboard.duplicate');
  clipboard.duplicate(toDuplicate);
};
export {duplicate};

/**
 * Is the given string a number (includes negative and decimals).
 * @param {string} str Input string.
 * @return {boolean} True if number, false otherwise.
 * @deprecated Use Blockly.utils.string.isNumber(str). (2021 December)
 * @see Blockly.utils.string.isNumber
 * @alias Blockly.isNumber
 */
const isNumber = function(str) {
  deprecation.warn(
      'Blockly.isNumber', 'December 2021', 'December 2022',
      'Blockly.utils.string.isNumber');
  return utils.string.isNumber(str);
};
export {isNumber};

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 * @deprecated Use Blockly.utils.colour.hueToHex(). (2021 December)
 * @see Blockly.utils.colour.hueToHex
 * @alias Blockly.hueToHex
 */
const hueToHex = function(hue) {
  deprecation.warn(
      'Blockly.hueToHex', 'December 2021', 'December 2022',
      'Blockly.utils.colour.hueToHex');
  return colour.hueToHex(hue);
};
export {hueToHex};

/**
 * Bind an event handler that should be called regardless of whether it is part
 * of the active touch stream.
 * Use this for events that are not part of a multi-part gesture (e.g.
 * mouseover for tooltips).
 * @param {!EventTarget} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {?Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @return {!browserEvents.Data} Opaque data that can be passed to
 *     unbindEvent_.
 * @deprecated Use Blockly.browserEvents.bind(). (December 2021)
 * @see Blockly.browserEvents.bind
 * @alias Blockly.bindEvent_
 */
const bindEvent_ = function(node, name, thisObject, func) {
  deprecation.warn(
      'Blockly.bindEvent_', 'December 2021', 'December 2022',
      'Blockly.browserEvents.bind');
  return browserEvents.bind(node, name, thisObject, func);
};
export {bindEvent_};

/**
 * Unbind one or more events event from a function call.
 * @param {!browserEvents.Data} bindData Opaque data from bindEvent_.
 *     This list is emptied during the course of calling this function.
 * @return {!Function} The function call.
 * @deprecated Use Blockly.browserEvents.unbind(). (December 2021)
 * @see browserEvents.unbind
 * @alias Blockly.unbindEvent_
 */
const unbindEvent_ = function(bindData) {
  deprecation.warn(
      'Blockly.unbindEvent_', 'December 2021', 'December 2022',
      'Blockly.browserEvents.unbind');
  return browserEvents.unbind(bindData);
};
export {unbindEvent_};

/**
 * Bind an event handler that can be ignored if it is not part of the active
 * touch stream.
 * Use this for events that either start or continue a multi-part gesture (e.g.
 * mousedown or mousemove, which may be part of a drag or click).
 * @param {!EventTarget} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {?Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @param {boolean=} opt_noCaptureIdentifier True if triggering on this event
 *     should not block execution of other event handlers on this touch or
 *     other simultaneous touches.  False by default.
 * @param {boolean=} opt_noPreventDefault True if triggering on this event
 *     should prevent the default handler.  False by default.  If
 *     opt_noPreventDefault is provided, opt_noCaptureIdentifier must also be
 *     provided.
 * @return {!browserEvents.Data} Opaque data that can be passed to
 *     unbindEvent_.
 * @deprecated Use Blockly.browserEvents.conditionalBind(). (December 2021)
 * @see browserEvents.conditionalBind
 * @alias Blockly.bindEventWithChecks_
 */
const bindEventWithChecks_ = function(
    node, name, thisObject, func, opt_noCaptureIdentifier,
    opt_noPreventDefault) {
  deprecation.warn(
      'Blockly.bindEventWithChecks_', 'December 2021', 'December 2022',
      'Blockly.browserEvents.conditionalBind');
  return browserEvents.conditionalBind(
      node, name, thisObject, func, opt_noCaptureIdentifier,
      opt_noPreventDefault);
};
export {bindEventWithChecks_};

// Aliases to allow external code to access these values for legacy reasons.
export var COLLAPSE_CHARS = internalConstants.COLLAPSE_CHARS;

export var DRAG_STACK = internalConstants.DRAG_STACK;
export var OPPOSITE_TYPE = internalConstants.OPPOSITE_TYPE;
export var RENAME_VARIABLE_ID = internalConstants.RENAME_VARIABLE_ID;
export var DELETE_VARIABLE_ID = internalConstants.DELETE_VARIABLE_ID;
export var COLLAPSED_INPUT_NAME = constants.COLLAPSED_INPUT_NAME;
export var COLLAPSED_FIELD_NAME = constants.COLLAPSED_FIELD_NAME;

/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * @const {string}
 * @alias Blockly.VARIABLE_CATEGORY_NAME
 */
export var VARIABLE_CATEGORY_NAME = Variables.CATEGORY_NAME;

/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * @const {string}
 * @alias Blockly.VARIABLE_DYNAMIC_CATEGORY_NAME
 */
export var VARIABLE_DYNAMIC_CATEGORY_NAME = VariablesDynamic.CATEGORY_NAME;

/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * procedure blocks.
 * @const {string}
 * @alias Blockly.PROCEDURE_CATEGORY_NAME
 */
export var PROCEDURE_CATEGORY_NAME = Procedures.CATEGORY_NAME;

export {ASTNode};
export {BasicCursor};
export {Block};
export {BlocklyOptions};
export {BlockDragger};
export {BlockDragSurfaceSvg};
export {BlockSvg};
export {Blocks};
export {Bubble};
export {BubbleDragger};
export {CollapsibleToolboxCategory};
export {Comment};
export {ComponentManager};
export {Connection};
export {ConnectionType};
export {ConnectionChecker};
export {ConnectionDB};
export {ContextMenu};
export {ContextMenuItems};
export {ContextMenuRegistry};
export {Css};
export {Cursor};
export {DeleteArea};
export {DragTarget};
export {dropDownDiv as DropDownDiv};
export {Events};
export {Extensions};
export {Field};
export {FieldAngle};
export {FieldCheckbox};
export {FieldColour};
export {FieldDropdown};
export {FieldImage};
export {FieldLabel};
export {FieldLabelSerializable};
export {FieldMultilineInput};
export {FieldNumber};
export {FieldTextInput};
export {FieldVariable};
export {Flyout};
export {FlyoutButton};
export {FlyoutMetricsManager};
export {Generator};
export {Gesture};
export {Grid};
export {HorizontalFlyout};
export {IASTNodeLocation};
export {IASTNodeLocationSvg};
export {IASTNodeLocationWithBlock};
export {IAutoHideable};
export {IBlockDragger};
export {IBoundedElement};
export {IBubble};
export {ICollapsibleToolboxItem};
export {IComponent};
export {IConnectionChecker};
export {IContextMenu};
export {Icon};
export {ICopyable};
export {IDeletable};
export {IDeleteArea};
export {IDragTarget};
export {IDraggable};
export {IFlyout};
export {IKeyboardAccessible};
export {IMetricsManager};
export {IMovable};
export {Input};
export {InsertionMarkerManager};
export {IPositionable};
export {IRegistrable};
export {IRegistrableField};
export {ISelectable};
export {ISelectableToolboxItem};
export {IStyleable};
export {IToolbox};
export {IToolboxItem};
export {Marker};
export {MarkerManager};
export {Menu};
export {MenuItem};
export {MetricsManager};
export {Mutator};
export {Msg};
export {Names};
export {Options};
export {Procedures};
export {RenderedConnection};
export {Scrollbar};
export {ScrollbarPair};
export {ShortcutItems};
export {ShortcutRegistry};
export {TabNavigateCursor};
export {Theme};
export {Themes};
export {ThemeManager};
export {Toolbox};
export {ToolboxCategory};
export {ToolboxItem};
export {ToolboxSeparator};
export {Tooltip};
export {Touch};
export {TouchGesture};
export {Trashcan};
export {VariableMap};
export {VariableModel};
export {Variables};
export {VariablesDynamic};
export {VerticalFlyout};
export {Warning};
export {WidgetDiv};
export {Workspace};
export {WorkspaceAudio};
export {WorkspaceComment};
export {WorkspaceCommentSvg};
export {WorkspaceDragSurfaceSvg};
export {WorkspaceDragger};
export {WorkspaceSvg};
export {Xml};
export {ZoomControls};
export {blockAnimations};
export {blockRendering};
export {browserEvents};
export {bumpObjects};
export {clipboard};
export {common};
export {config};
/** @deprecated Use Blockly.ConnectionType instead. */
export {ConnectionType as connectionTypes};
export {constants};
export {dialog};
export {fieldRegistry};
export {geras};
export {inject};
export {inputTypes};
export {minimalist};
export {registry};

export var serialization = {
  blocks: serializationBlocks,
  exceptions: serializationExceptions,
  priorities: serializationPriorities,
  registry: serializationRegistry,
  variables: serializationVariables,
  workspaces: serializationWorkspaces,
  ISerializer: ISerializer,
};

export {thrasos};
export {uiPosition};
export {utils};
export {zelos};

// If Blockly is compiled with ADVANCED_COMPILATION and/or loaded as a
// CJS or ES module there will not be a Blockly global variable
// created.  This can cause problems because a very common way of
// loading translations is to use a <script> tag to load one of
// msg/js/*.js, which consists of lines like:
//
// Blockly.Msg["ADD_COMMENT"] = "Add Comment";
// Blockly.Msg["CLEAN_UP"] = "Clean up Blocks";
//
// This obviously only works if Blockly.Msg is the Msg export from the
// Blockly.Msg module - so make sure it is, but only if there is not
// yet a Blockly global variable.
if (!('Blockly' in globalThis)) {
  globalThis['Blockly'] = {'Msg': Msg};
}