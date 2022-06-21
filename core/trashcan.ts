/** @fileoverview Object representing a trash can icon. */

/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Object representing a trash can icon.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './metrics_manager';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_trashcan_open';

/* eslint-disable-next-line no-unused-vars */
import {BlocklyOptions} from './blockly_options.js';
import * as browserEvents from './browser_events.js';
import {ComponentManager} from './component_manager.js';
import {DeleteArea} from './delete_area.js';
/* eslint-disable-next-line no-unused-vars */
import {Abstract} from './events/events_abstract.js';
/* eslint-disable-next-line no-unused-vars */
import {BlockDelete} from './events/events_block_delete.js';
import * as eventUtils from './events/utils.js';
/* eslint-disable-next-line no-unused-vars */
import {IAutoHideable} from './interfaces/i_autohideable.js';
/* eslint-disable-next-line no-unused-vars */
import {IDraggable} from './interfaces/i_draggable.js';
/* eslint-disable-next-line no-unused-vars */
import {IFlyout} from './interfaces/i_flyout.js';
/* eslint-disable-next-line no-unused-vars */
import {IPositionable} from './interfaces/i_positionable.js';
import {UiMetrics} from './metrics_manager.js';
import {Options} from './options.js';
import * as uiPosition from './positionable_helpers.js';
import * as registry from './registry.js';
/* eslint-disable-next-line no-unused-vars */
import * as blocks from './serialization/blocks.js';
import {SPRITE} from './sprites.js';
import * as dom from './utils/dom.js';
import {Rect} from './utils/rect.js';
import {Size} from './utils/size.js';
import {Svg} from './utils/svg.js';
import * as toolbox from './utils/toolbox.js';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceSvg} from './workspace_svg.js';


/**
 * Class for a trash can.
 * @alias Blockly.Trashcan
 */
export class Trashcan extends DeleteArea implements IAutoHideable,
                                                    IPositionable {
  /**
   * The unique id for this component that is used to register with the
   * ComponentManager.
   */
  override id = 'trashcan';

  /**
   * A list of JSON (stored as strings) representing blocks in the trashcan.
   */
  private readonly contents_: string[] = [];

  /** The trashcan flyout. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'IFlyout'.
  flyout: IFlyout = null as AnyDuringMigration;

  /** Current open/close state of the lid. */
  isLidOpen = false;

  /**
   * The minimum openness of the lid. Used to indicate if the trashcan
   * contains blocks.
   */
  private minOpenness_ = 0;

  /** The SVG group containing the trash can. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGElement'.
  private svgGroup_: SVGElement = null as AnyDuringMigration;

  /** The SVG image element of the trash can lid. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGElement'.
  private svgLid_: SVGElement = null as AnyDuringMigration;

  /** Task ID of opening/closing animation. */
  private lidTask_ = 0;

  /** Current state of lid opening (0.0 = closed, 1.0 = open). */
  private lidOpen_ = 0;

  /** Left coordinate of the trash can. */
  private left_ = 0;

  /** Top coordinate of the trash can. */
  private top_ = 0;

  /** Whether this trash can has been initialized. */
  private initialized_ = false;

  /** @param workspace The workspace to sit in. */
  constructor(private workspace: WorkspaceSvg) {
    super();

    if (this.workspace.options.maxTrashcanContents <= 0) {
      return;
    }

    // Create flyout options.
    const flyoutWorkspaceOptions = new Options(({
      'scrollbars': true,
      'parentWorkspace': this.workspace,
      'rtl': this.workspace.RTL,
      'oneBasedIndex': this.workspace.options.oneBasedIndex,
      'renderer': this.workspace.options.renderer,
      'rendererOverrides': this.workspace.options.rendererOverrides,
      'move': {
        'scrollbars': true,
      },
    } as BlocklyOptions));
    // Create vertical or horizontal flyout.
    if (this.workspace.horizontalLayout) {
      flyoutWorkspaceOptions.toolboxPosition =
          this.workspace.toolboxPosition === toolbox.Position.TOP ?
          toolbox.Position.BOTTOM :
          toolbox.Position.TOP;
      const HorizontalFlyout = registry.getClassFromOptions(
          registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX, this.workspace.options,
          true);
      this.flyout = new HorizontalFlyout!(flyoutWorkspaceOptions);
    } else {
      flyoutWorkspaceOptions.toolboxPosition =
          this.workspace.toolboxPosition === toolbox.Position.RIGHT ?
          toolbox.Position.LEFT :
          toolbox.Position.RIGHT;
      const VerticalFlyout = registry.getClassFromOptions(
          registry.Type.FLYOUTS_VERTICAL_TOOLBOX, this.workspace.options, true);
      this.flyout = new VerticalFlyout!(flyoutWorkspaceOptions);
    }
    this.workspace.addChangeListener(this.onDelete_.bind(this));
  }

  /**
   * Create the trash can elements.
   * @return The trash can's SVG group.
   */
  createDom(): SVGElement {
    /* Here's the markup that will be generated:
        <g class="blocklyTrash">
          <clippath id="blocklyTrashBodyClipPath837493">
            <rect width="47" height="45" y="15"></rect>
          </clippath>
          <image width="64" height="92" y="-32" xlink:href="media/sprites.png"
              clip-path="url(#blocklyTrashBodyClipPath837493)"></image>
          <clippath id="blocklyTrashLidClipPath837493">
            <rect width="47" height="15"></rect>
          </clippath>
          <image width="84" height="92" y="-32" xlink:href="media/sprites.png"
              clip-path="url(#blocklyTrashLidClipPath837493)"></image>
        </g>
        */
    this.svgGroup_ = dom.createSvgElement(Svg.G, {'class': 'blocklyTrash'});
    let clip;
    const rnd = String(Math.random()).substring(2);
    clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyTrashBodyClipPath' + rnd}, this.svgGroup_);
    dom.createSvgElement(
        Svg.RECT, {'width': WIDTH, 'height': BODY_HEIGHT, 'y': LID_HEIGHT},
        clip);
    const body = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'x': -SPRITE_LEFT,
          'height': SPRITE.height,
          'y': -SPRITE_TOP,
          'clip-path': 'url(#blocklyTrashBodyClipPath' + rnd + ')',
        },
        this.svgGroup_);
    body.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace.options.pathToMedia + SPRITE.url);

    clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyTrashLidClipPath' + rnd}, this.svgGroup_);
    dom.createSvgElement(
        Svg.RECT, {'width': WIDTH, 'height': LID_HEIGHT}, clip);
    this.svgLid_ = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'x': -SPRITE_LEFT,
          'height': SPRITE.height,
          'y': -SPRITE_TOP,
          'clip-path': 'url(#blocklyTrashLidClipPath' + rnd + ')',
        },
        this.svgGroup_);
    this.svgLid_.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace.options.pathToMedia + SPRITE.url);

    // bindEventWithChecks_ quashes events too aggressively. See:
    // https://groups.google.com/forum/#!topic/blockly/QF4yB9Wx00s
    // Using bindEventWithChecks_ for blocking mousedown causes issue in mobile.
    // See #4303
    browserEvents.bind(
        this.svgGroup_, 'mousedown', this, this.blockMouseDownWhenOpenable_);
    browserEvents.bind(this.svgGroup_, 'mouseup', this, this.click);
    // Bind to body instead of this.svgGroup_ so that we don't get lid jitters
    browserEvents.bind(body, 'mouseover', this, this.mouseOver_);
    browserEvents.bind(body, 'mouseout', this, this.mouseOut_);
    this.animateLid_();
    return this.svgGroup_;
  }

  /** Initializes the trash can. */
  init() {
    if (this.workspace.options.maxTrashcanContents > 0) {
      dom.insertAfter(
          this.flyout.createDom(Svg.SVG), this.workspace.getParentSvg());
      this.flyout.init(this.workspace);
    }
    this.workspace.getComponentManager().addComponent({
      component: this,
      weight: 1,
      capabilities: [
        ComponentManager.Capability.AUTOHIDEABLE,
        ComponentManager.Capability.DELETE_AREA,
        ComponentManager.Capability.DRAG_TARGET,
        ComponentManager.Capability.POSITIONABLE,
      ],
    });
    this.initialized_ = true;
    this.setLidOpen(false);
  }

  /**
   * Dispose of this trash can.
   * Unlink from all DOM elements to prevent memory leaks.
   * @suppress {checkTypes}
   */
  dispose() {
    this.workspace.getComponentManager().removeComponent('trashcan');
    if (this.svgGroup_) {
      dom.removeNode(this.svgGroup_);
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'SVGElement'.
      this.svgGroup_ = null as AnyDuringMigration;
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'SVGElement'.
    this.svgLid_ = null as AnyDuringMigration;
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'WorkspaceSvg'.
    this.workspace = null as AnyDuringMigration;
    clearTimeout(this.lidTask_);
  }

  /**
   * Whether the trashcan has contents.
   * @return True if the trashcan has contents.
   */
  private hasContents_(): boolean {
    return !!this.contents_.length;
  }

  /**
   * Returns true if the trashcan contents-flyout is currently open.
   * @return True if the trashcan contents-flyout is currently open.
   */
  contentsIsOpen(): boolean {
    return !!this.flyout && this.flyout.isVisible();
  }

  /** Opens the trashcan flyout. */
  openFlyout() {
    if (this.contentsIsOpen()) {
      return;
    }
    const contents = this.contents_.map(function(string) {
      return JSON.parse(string);
    });
    this.flyout.show(contents);
    this.fireUiEvent_(true);
  }

  /** Closes the trashcan flyout. */
  closeFlyout() {
    if (!this.contentsIsOpen()) {
      return;
    }
    this.flyout.hide();
    this.fireUiEvent_(false);
    this.workspace.recordDragTargets();
  }

  /**
   * Hides the component. Called in WorkspaceSvg.hideChaff.
   * @param onlyClosePopups Whether only popups should be closed.
   *     Flyouts should not be closed if this is true.
   */
  autoHide(onlyClosePopups: boolean) {
    // For now the trashcan flyout always autocloses because it overlays the
    // trashcan UI (no trashcan to click to close it).
    if (!onlyClosePopups && this.flyout) {
      this.closeFlyout();
    }
  }

  /**
   * Empties the trashcan's contents. If the contents-flyout is currently open
   * it will be closed.
   */
  emptyContents() {
    if (!this.hasContents_()) {
      return;
    }
    this.contents_.length = 0;
    this.setMinOpenness_(0);
    this.closeFlyout();
  }

  /**
   * Positions the trashcan.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   * @param metrics The workspace metrics.
   * @param savedPositions List of rectangles that are already on the workspace.
   */
  position(metrics: UiMetrics, savedPositions: Rect[]) {
    // Not yet initialized.
    if (!this.initialized_) {
      return;
    }

    const cornerPosition =
        uiPosition.getCornerOppositeToolbox(this.workspace, metrics);

    const height = BODY_HEIGHT + LID_HEIGHT;
    const startRect = uiPosition.getStartPositionRect(
        cornerPosition, new Size(WIDTH, height), MARGIN_HORIZONTAL,
        MARGIN_VERTICAL, metrics, this.workspace);

    const verticalPosition = cornerPosition.vertical;
    const bumpDirection = verticalPosition === uiPosition.verticalPosition.TOP ?
        uiPosition.bumpDirection.DOWN :
        uiPosition.bumpDirection.UP;
    const positionRect = uiPosition.bumpPositionRect(
        startRect, MARGIN_VERTICAL, bumpDirection, savedPositions);

    this.top_ = positionRect.top;
    this.left_ = positionRect.left;
    this.svgGroup_.setAttribute(
        'transform', 'translate(' + this.left_ + ',' + this.top_ + ')');
  }

  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return The UI elements's bounding box. Null if bounding box should be
   *     ignored by other UI elements.
   */
  getBoundingRectangle(): Rect|null {
    const bottom = this.top_ + BODY_HEIGHT + LID_HEIGHT;
    const right = this.left_ + WIDTH;
    return new Rect(this.top_, bottom, this.left_, right);
  }

  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to viewport.
   * @return The component's bounding box. Null if drag target area should be
   *     ignored.
   */
  override getClientRect(): Rect|null {
    if (!this.svgGroup_) {
      return null;
    }

    const trashRect = this.svgGroup_.getBoundingClientRect();
    const top = trashRect.top + SPRITE_TOP - MARGIN_HOTSPOT;
    const bottom = top + LID_HEIGHT + BODY_HEIGHT + 2 * MARGIN_HOTSPOT;
    const left = trashRect.left + SPRITE_LEFT - MARGIN_HOTSPOT;
    const right = left + WIDTH + 2 * MARGIN_HOTSPOT;
    return new Rect(top, bottom, left, right);
  }

  /**
   * Handles when a cursor with a block or bubble is dragged over this drag
   * target.
   * @param _dragElement The block or bubble currently being dragged.
   */
  override onDragOver(_dragElement: IDraggable) {
    this.setLidOpen(this.wouldDelete_);
  }

  /**
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param _dragElement The block or bubble currently being dragged.
   */
  override onDragExit(_dragElement: IDraggable) {
    this.setLidOpen(false);
  }

  /**
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param _dragElement The block or bubble currently being dragged.
   */
  override onDrop(_dragElement: IDraggable) {
    setTimeout(this.setLidOpen.bind(this, false), 100);
  }

  /**
   * Flip the lid open or shut.
   * @param state True if open.
   * @internal
   */
  setLidOpen(state: boolean) {
    if (this.isLidOpen === state) {
      return;
    }
    clearTimeout(this.lidTask_);
    this.isLidOpen = state;
    this.animateLid_();
  }

  /** Rotate the lid open or closed by one step.  Then wait and recurse. */
  private animateLid_() {
    const frames = ANIMATION_FRAMES;

    const delta = 1 / (frames + 1);
    this.lidOpen_ += this.isLidOpen ? delta : -delta;
    this.lidOpen_ = Math.min(Math.max(this.lidOpen_, this.minOpenness_), 1);

    this.setLidAngle_(this.lidOpen_ * MAX_LID_ANGLE);

    // Linear interpolation between min and max.
    const opacity = OPACITY_MIN + this.lidOpen_ * (OPACITY_MAX - OPACITY_MIN);
    // AnyDuringMigration because:  Type 'number' is not assignable to type
    // 'string'.
    this.svgGroup_.style.opacity = opacity as AnyDuringMigration;

    if (this.lidOpen_ > this.minOpenness_ && this.lidOpen_ < 1) {
      this.lidTask_ =
          setTimeout(this.animateLid_.bind(this), ANIMATION_LENGTH / frames);
    }
  }

  /**
   * Set the angle of the trashcan's lid.
   * @param lidAngle The angle at which to set the lid.
   */
  private setLidAngle_(lidAngle: number) {
    const openAtRight =
        this.workspace.toolboxPosition === toolbox.Position.RIGHT ||
        this.workspace.horizontalLayout && this.workspace.RTL;
    this.svgLid_.setAttribute(
        'transform',
        'rotate(' + (openAtRight ? -lidAngle : lidAngle) + ',' +
            (openAtRight ? 4 : WIDTH - 4) + ',' + (LID_HEIGHT - 2) + ')');
  }

  /**
   * Sets the minimum openness of the trashcan lid. If the lid is currently
   * closed, this will update lid's position.
   * @param newMin The new minimum openness of the lid. Should be between 0
   *     and 1.
   */
  private setMinOpenness_(newMin: number) {
    this.minOpenness_ = newMin;
    if (!this.isLidOpen) {
      this.setLidAngle_(newMin * MAX_LID_ANGLE);
    }
  }

  /**
   * Flip the lid shut.
   * Called externally after a drag.
   */
  closeLid() {
    this.setLidOpen(false);
  }

  /** Inspect the contents of the trash. */
  click() {
    if (!this.hasContents_()) {
      return;
    }
    this.openFlyout();
  }

  /**
   * Fires a UI event for trashcan flyout open or close.
   * @param trashcanOpen Whether the flyout is opening.
   */
  private fireUiEvent_(trashcanOpen: boolean) {
    const uiEvent = new (eventUtils.get(eventUtils.TRASHCAN_OPEN))!
        (trashcanOpen, this.workspace.id);
    eventUtils.fire(uiEvent);
  }

  /**
   * Prevents a workspace scroll and click event if the trashcan has blocks.
   * @param e A mouse down event.
   */
  private blockMouseDownWhenOpenable_(e: Event) {
    if (!this.contentsIsOpen() && this.hasContents_()) {
      // Don't start a workspace scroll.
      e.stopPropagation();
    }
  }

  /**
   * Indicate that the trashcan can be clicked (by opening it) if it has blocks.
   */
  private mouseOver_() {
    if (this.hasContents_()) {
      this.setLidOpen(true);
    }
  }

  /**
   * Close the lid of the trashcan if it was open (Vis. it was indicating it had
   *    blocks).
   */
  private mouseOut_() {
    // No need to do a .hasBlocks check here because if it doesn't the trashcan
    // won't be open in the first place, and setOpen won't run.
    this.setLidOpen(false);
  }

  /**
   * Handle a BLOCK_DELETE event. Adds deleted blocks oldXml to the content
   * array.
   * @param event Workspace event.
   */
  private onDelete_(event: Abstract) {
    if (this.workspace.options.maxTrashcanContents <= 0 ||
        event.type !== eventUtils.BLOCK_DELETE) {
      return;
    }
    const deleteEvent = event as BlockDelete;
    if (event.type === eventUtils.BLOCK_DELETE && !deleteEvent.wasShadow) {
      const cleanedJson = this.cleanBlockJson_(deleteEvent.oldJson);
      if (this.contents_.indexOf(cleanedJson) !== -1) {
        return;
      }
      this.contents_.unshift(cleanedJson);
      while (this.contents_.length >
             this.workspace.options.maxTrashcanContents) {
        this.contents_.pop();
      }

      this.setMinOpenness_(HAS_BLOCKS_LID_ANGLE);
    }
  }

  /**
   * Converts JSON representing a block into text that can be stored in the
   * content array.
   * @param json A JSON representation of a block's state.
   * @return Text representing the JSON, cleaned of all unnecessary attributes.
   */
  private cleanBlockJson_(json: blocks.State): string {
    // Create a deep copy.
    json = JSON.parse(JSON.stringify(json)) as blocks.State;

    /**
     * Reshape JSON into a nicer format.
     * @param json The JSON to clean.
     */
    function cleanRec(json: blocks.State) {
      if (!json) {
        return;
      }

      delete json['id'];
      delete json['x'];
      delete json['y'];
      delete json['enabled'];

      if (json['icons'] && json['icons']['comment']) {
        const comment = json['icons']['comment'];
        delete comment['height'];
        delete comment['width'];
        delete comment['pinned'];
      }

      const inputs = json['inputs'];
      for (const name in inputs) {
        const input = inputs[name];
        // AnyDuringMigration because:  Argument of type 'State | undefined' is
        // not assignable to parameter of type 'State'.
        cleanRec((input as AnyDuringMigration)['block']);
        // AnyDuringMigration because:  Argument of type 'State | undefined' is
        // not assignable to parameter of type 'State'.
        cleanRec((input as AnyDuringMigration)['shadow']);
      }
      if (json['next']) {
        const next = json['next'];
        // AnyDuringMigration because:  Argument of type 'State | undefined' is
        // not assignable to parameter of type 'State'.
        cleanRec((next as AnyDuringMigration)['block']);
        // AnyDuringMigration because:  Argument of type 'State | undefined' is
        // not assignable to parameter of type 'State'.
        cleanRec((next as AnyDuringMigration)['shadow']);
      }
    }

    cleanRec(json);
    (json as AnyDuringMigration)['kind'] = 'BLOCK';
    return JSON.stringify(json);
  }
}

/** Width of both the trash can and lid images. */
const WIDTH = 47;

/** Height of the trashcan image (minus lid). */
const BODY_HEIGHT = 44;

/** Height of the lid image. */
const LID_HEIGHT = 16;

/** Distance between trashcan and bottom or top edge of workspace. */
const MARGIN_VERTICAL = 20;

/** Distance between trashcan and right or left edge of workspace. */
const MARGIN_HORIZONTAL = 20;

/** Extent of hotspot on all sides beyond the size of the image. */
const MARGIN_HOTSPOT = 10;

/** Location of trashcan in sprite image. */
const SPRITE_LEFT = 0;

/** Location of trashcan in sprite image. */
const SPRITE_TOP = 32;

/**
 * The openness of the lid when the trashcan contains blocks.
 *    (0.0 = closed, 1.0 = open)
 */
const HAS_BLOCKS_LID_ANGLE = 0.1;

/** The length of the lid open/close animation in milliseconds. */
const ANIMATION_LENGTH = 80;

/** The number of frames in the animation. */
const ANIMATION_FRAMES = 4;

/** The minimum (resting) opacity of the trashcan and lid. */
const OPACITY_MIN = 0.4;

/** The maximum (hovered) opacity of the trashcan and lid. */
const OPACITY_MAX = 0.8;

/**
 * The maximum angle the trashcan lid can opens to. At the end of the open
 * animation the lid will be open to this angle.
 */
const MAX_LID_ANGLE = 45;
