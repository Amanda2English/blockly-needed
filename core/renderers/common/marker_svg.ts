/** @fileoverview Methods for graphically rendering a marker as SVG. */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * Methods for graphically rendering a marker as SVG.
 * @class
 */

// Unused import preserved for side-effects. Remove if unneeded.
import '../../events/events_marker_move';

/* eslint-disable-next-line no-unused-vars */
import {BlockSvg} from '../../block_svg.js';
/* eslint-disable-next-line no-unused-vars */
import {Connection} from '../../connection.js';
import {ConnectionType} from '../../connection_type.js';
import * as eventUtils from '../../events/utils.js';
/* eslint-disable-next-line no-unused-vars */
import {Field} from '../../field.js';
/* eslint-disable-next-line no-unused-vars */
import {IASTNodeLocationSvg} from '../../interfaces/i_ast_node_location_svg.js';
import {ASTNode} from '../../keyboard_nav/ast_node.js';
/* eslint-disable-next-line no-unused-vars */
import {Marker} from '../../keyboard_nav/marker.js';
/* eslint-disable-next-line no-unused-vars */
import {RenderedConnection} from '../../rendered_connection.js';
import * as dom from '../../utils/dom.js';
import {Svg} from '../../utils/svg.js';
import * as svgPaths from '../../utils/svg_paths.js';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceSvg} from '../../workspace_svg.js';

/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider, Notch, PuzzleTab} from './constants.js';


/** The name of the CSS class for a cursor. */
const CURSOR_CLASS = 'blocklyCursor';

/** The name of the CSS class for a marker. */
const MARKER_CLASS = 'blocklyMarker';

/**
 * What we multiply the height by to get the height of the marker.
 * Only used for the block and block connections.
 */
const HEIGHT_MULTIPLIER = 3 / 4;

/**
 * Class for a marker.
 * @alias Blockly.blockRendering.MarkerSvg
 */
export class MarkerSvg {
  /**
   * The workspace, field, or block that the marker SVG element should be
   * attached to.
   */
  private parent_: IASTNodeLocationSvg|null = null;

  /** The current SVG element for the marker. */
  currentMarkerSvg: Element|null = null;
  colour_: string;

  /** The root SVG group containing the marker. */
  protected markerSvg_: SVGGElement|null = null;
  protected svgGroup_: SVGGElement|null = null;

  protected markerBlock_: SVGPathElement|null = null;

  protected markerInput_: SVGPathElement|null = null;
  protected markerSvgLine_: SVGRectElement|null = null;

  protected markerSvgRect_: SVGRectElement|null = null;

  /**
   * @param workspace The workspace the marker belongs to.
   * @param constants The constants for the renderer.
   * @param marker The marker to draw.
   */
  constructor(
      private readonly workspace: WorkspaceSvg,
      private constants: ConstantProvider, private readonly marker: Marker) {
    const defaultColour = this.isCursor() ? this.constants.CURSOR_COLOUR :
                                            this.constants.MARKER_COLOUR;

    /** The colour of the marker. */
    this.colour_ = marker.colour || defaultColour;
  }

  /**
   * Return the root node of the SVG or null if none exists.
   * @return The root SVG node.
   */
  getSvgRoot(): SVGElement {
    // AnyDuringMigration because:  Type 'SVGGElement | null' is not assignable
    // to type 'SVGElement'.
    return this.svgGroup_ as AnyDuringMigration;
  }

  /**
   * Get the marker.
   * @return The marker to draw for.
   */
  getMarker(): Marker {
    return this.marker;
  }

  /**
   * True if the marker should be drawn as a cursor, false otherwise.
   * A cursor is drawn as a flashing line. A marker is drawn as a solid line.
   * @return True if the marker is a cursor, false otherwise.
   */
  isCursor(): boolean {
    return this.marker.type === 'cursor';
  }

  /**
   * Create the DOM element for the marker.
   * @return The marker controls SVG group.
   */
  createDom(): SVGElement {
    const className = this.isCursor() ? CURSOR_CLASS : MARKER_CLASS;

    this.svgGroup_ = dom.createSvgElement(Svg.G, {'class': className});

    this.createDomInternal_();
    return this.svgGroup_;
  }

  /**
   * Attaches the SVG root of the marker to the SVG group of the parent.
   * @param newParent The workspace, field, or block that the marker SVG element
   *     should be attached to.
   */
  protected setParent_(newParent: IASTNodeLocationSvg) {
    if (!this.isCursor()) {
      if (this.parent_) {
        this.parent_.setMarkerSvg(null);
      }
      newParent.setMarkerSvg(this.getSvgRoot());
    } else {
      if (this.parent_) {
        this.parent_.setCursorSvg(null);
      }
      newParent.setCursorSvg(this.getSvgRoot());
    }
    this.parent_ = newParent;
  }

  /**
   * Update the marker.
   * @param oldNode The previous node the marker was on or null.
   * @param curNode The node that we want to draw the marker for.
   */
  draw(oldNode: ASTNode, curNode: ASTNode) {
    if (!curNode) {
      this.hide();
      return;
    }

    this.constants = this.workspace.getRenderer().getConstants();

    const defaultColour = this.isCursor() ? this.constants.CURSOR_COLOUR :
                                            this.constants.MARKER_COLOUR;
    this.colour_ = this.marker.colour || defaultColour;
    this.applyColour_(curNode);

    this.showAtLocation_(curNode);

    this.fireMarkerEvent_(oldNode, curNode);

    // Ensures the marker will be visible immediately after the move.
    const animate = this.currentMarkerSvg!.childNodes[0];
    if (animate !== undefined) {
      animate instanceof SVGAnimationElement && animate.beginElement();
    }
  }

  /**
   * Update the marker's visible state based on the type of curNode..
   * @param curNode The node that we want to draw the marker for.
   */
  protected showAtLocation_(curNode: ASTNode) {
    const curNodeAsConnection = curNode.getLocation() as Connection;
    const connectionType = curNodeAsConnection.type;
    if (curNode.getType() === ASTNode.types.BLOCK) {
      this.showWithBlock_(curNode);
    } else if (curNode.getType() === ASTNode.types.OUTPUT) {
      this.showWithOutput_(curNode);
    } else if (connectionType === ConnectionType.INPUT_VALUE) {
      this.showWithInput_(curNode);
    } else if (connectionType === ConnectionType.NEXT_STATEMENT) {
      this.showWithNext_(curNode);
    } else if (curNode.getType() === ASTNode.types.PREVIOUS) {
      this.showWithPrevious_(curNode);
    } else if (curNode.getType() === ASTNode.types.FIELD) {
      this.showWithField_(curNode);
    } else if (curNode.getType() === ASTNode.types.WORKSPACE) {
      this.showWithCoordinates_(curNode);
    } else if (curNode.getType() === ASTNode.types.STACK) {
      this.showWithStack_(curNode);
    }
  }

  /**************************
   * Display
   **************************/

  /**
   * Show the marker as a combination of the previous connection and block,
   * the output connection and block, or just the block.
   * @param curNode The node to draw the marker for.
   */
  private showWithBlockPrevOutput_(curNode: ASTNode) {
    const block = curNode.getSourceBlock() as BlockSvg;
    const width = block.width;
    const height = block.height;
    const markerHeight = height * HEIGHT_MULTIPLIER;
    const markerOffset = this.constants.CURSOR_BLOCK_PADDING;

    if (block.previousConnection) {
      const connectionShape =
          this.constants.shapeFor(block.previousConnection) as Notch |
          PuzzleTab;
      this.positionPrevious_(
          width, markerOffset, markerHeight, connectionShape);
    } else if (block.outputConnection) {
      const connectionShape =
          this.constants.shapeFor(block.outputConnection) as Notch | PuzzleTab;
      this.positionOutput_(width, height, connectionShape);
    } else {
      this.positionBlock_(width, markerOffset, markerHeight);
    }
    this.setParent_(block);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for a block.
   * @param curNode The node to draw the marker for.
   */
  protected showWithBlock_(curNode: ASTNode) {
    this.showWithBlockPrevOutput_(curNode);
  }

  /**
   * Position and display the marker for a previous connection.
   * @param curNode The node to draw the marker for.
   */
  protected showWithPrevious_(curNode: ASTNode) {
    this.showWithBlockPrevOutput_(curNode);
  }

  /**
   * Position and display the marker for an output connection.
   * @param curNode The node to draw the marker for.
   */
  protected showWithOutput_(curNode: ASTNode) {
    this.showWithBlockPrevOutput_(curNode);
  }

  /**
   * Position and display the marker for a workspace coordinate.
   * This is a horizontal line.
   * @param curNode The node to draw the marker for.
   */
  protected showWithCoordinates_(curNode: ASTNode) {
    const wsCoordinate = curNode.getWsCoordinate();
    let x = wsCoordinate.x;
    const y = wsCoordinate.y;

    if (this.workspace.RTL) {
      x -= this.constants.CURSOR_WS_WIDTH;
    }

    this.positionLine_(x, y, this.constants.CURSOR_WS_WIDTH);
    this.setParent_(this.workspace);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for a field.
   * This is a box around the field.
   * @param curNode The node to draw the marker for.
   */
  protected showWithField_(curNode: ASTNode) {
    const field = curNode.getLocation() as Field;
    const width = field.getSize().width;
    const height = field.getSize().height;

    this.positionRect_(0, 0, width, height);
    this.setParent_(field);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for an input.
   * This is a puzzle piece.
   * @param curNode The node to draw the marker for.
   */
  protected showWithInput_(curNode: ASTNode) {
    const connection = curNode.getLocation() as RenderedConnection;
    const sourceBlock = (connection.getSourceBlock());

    this.positionInput_(connection);
    this.setParent_(sourceBlock);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for a next connection.
   * This is a horizontal line.
   * @param curNode The node to draw the marker for.
   */
  protected showWithNext_(curNode: ASTNode) {
    const connection = curNode.getLocation() as RenderedConnection;
    const targetBlock = (connection.getSourceBlock());
    let x = 0;
    const y = connection.getOffsetInBlock().y;
    const width = targetBlock.getHeightWidth().width;
    if (this.workspace.RTL) {
      x = -width;
    }
    this.positionLine_(x, y, width);
    this.setParent_(targetBlock);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for a stack.
   * This is a box with extra padding around the entire stack of blocks.
   * @param curNode The node to draw the marker for.
   */
  protected showWithStack_(curNode: ASTNode) {
    const block = curNode.getLocation() as BlockSvg;

    // Gets the height and width of entire stack.
    const heightWidth = block.getHeightWidth();

    // Add padding so that being on a stack looks different than being on a
    // block.
    const width = heightWidth.width + this.constants.CURSOR_STACK_PADDING;
    const height = heightWidth.height + this.constants.CURSOR_STACK_PADDING;

    // Shift the rectangle slightly to upper left so padding is equal on all
    // sides.
    const xPadding = -this.constants.CURSOR_STACK_PADDING / 2;
    const yPadding = -this.constants.CURSOR_STACK_PADDING / 2;

    let x = xPadding;
    const y = yPadding;

    if (this.workspace.RTL) {
      x = -(width + xPadding);
    }
    this.positionRect_(x, y, width, height);
    this.setParent_(block);
    this.showCurrent_();
  }

  /** Show the current marker. */
  protected showCurrent_() {
    this.hide();
    // AnyDuringMigration because:  Property 'style' does not exist on type
    // 'Element'.
    (this.currentMarkerSvg as AnyDuringMigration)!.style.display = '';
  }

  /**************************
   * Position
   **************************/

  /**
   * Position the marker for a block.
   * Displays an outline of the top half of a rectangle around a block.
   * @param width The width of the block.
   * @param markerOffset The extra padding for around the block.
   * @param markerHeight The height of the marker.
   */
  protected positionBlock_(
      width: number, markerOffset: number, markerHeight: number) {
    const markerPath = svgPaths.moveBy(-markerOffset, markerHeight) +
        svgPaths.lineOnAxis('V', -markerOffset) +
        svgPaths.lineOnAxis('H', width + markerOffset * 2) +
        svgPaths.lineOnAxis('V', markerHeight);
    this.markerBlock_!.setAttribute('d', markerPath);
    if (this.workspace.RTL) {
      // AnyDuringMigration because:  Argument of type 'SVGPathElement | null'
      // is not assignable to parameter of type 'SVGElement'.
      this.flipRtl_(this.markerBlock_ as AnyDuringMigration);
    }
    this.currentMarkerSvg = this.markerBlock_;
  }

  /**
   * Position the marker for an input connection.
   * Displays a filled in puzzle piece.
   * @param connection The connection to position marker around.
   */
  protected positionInput_(connection: RenderedConnection) {
    const x = connection.getOffsetInBlock().x;
    const y = connection.getOffsetInBlock().y;

    const path = svgPaths.moveTo(0, 0) +
        (this.constants.shapeFor(connection) as PuzzleTab).pathDown;

    this.markerInput_!.setAttribute('d', path);
    this.markerInput_!.setAttribute(
        'transform',
        'translate(' + x + ',' + y + ')' +
            (this.workspace.RTL ? ' scale(-1 1)' : ''));
    this.currentMarkerSvg = this.markerInput_;
  }

  /**
   * Move and show the marker at the specified coordinate in workspace units.
   * Displays a horizontal line.
   * @param x The new x, in workspace units.
   * @param y The new y, in workspace units.
   * @param width The new width, in workspace units.
   */
  protected positionLine_(x: number, y: number, width: number) {
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.markerSvgLine_!.setAttribute('x', x as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.markerSvgLine_!.setAttribute('y', y as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.markerSvgLine_!.setAttribute('width', width as AnyDuringMigration);
    this.currentMarkerSvg = this.markerSvgLine_;
  }

  /**
   * Position the marker for an output connection.
   * Displays a puzzle outline and the top and bottom path.
   * @param width The width of the block.
   * @param height The height of the block.
   * @param connectionShape The shape object for the connection.
   */
  protected positionOutput_(
      width: number, height: number, connectionShape: Notch|PuzzleTab) {
    // AnyDuringMigration because:  Property 'pathDown' does not exist on type
    // 'Notch | PuzzleTab'.
    const markerPath = svgPaths.moveBy(width, 0) +
        svgPaths.lineOnAxis('h', -(width - connectionShape.width)) +
        svgPaths.lineOnAxis('v', this.constants.TAB_OFFSET_FROM_TOP) +
        (connectionShape as AnyDuringMigration).pathDown +
        svgPaths.lineOnAxis('V', height) + svgPaths.lineOnAxis('H', width);
    this.markerBlock_!.setAttribute('d', markerPath);
    if (this.workspace.RTL) {
      // AnyDuringMigration because:  Argument of type 'SVGPathElement | null'
      // is not assignable to parameter of type 'SVGElement'.
      this.flipRtl_(this.markerBlock_ as AnyDuringMigration);
    }
    this.currentMarkerSvg = this.markerBlock_;
  }

  /**
   * Position the marker for a previous connection.
   * Displays a half rectangle with a notch in the top to represent the previous
   * connection.
   * @param width The width of the block.
   * @param markerOffset The offset of the marker from around the block.
   * @param markerHeight The height of the marker.
   * @param connectionShape The shape object for the connection.
   */
  protected positionPrevious_(
      width: number, markerOffset: number, markerHeight: number,
      connectionShape: Notch|PuzzleTab) {
    // AnyDuringMigration because:  Property 'pathLeft' does not exist on type
    // 'Notch | PuzzleTab'.
    const markerPath = svgPaths.moveBy(-markerOffset, markerHeight) +
        svgPaths.lineOnAxis('V', -markerOffset) +
        svgPaths.lineOnAxis('H', this.constants.NOTCH_OFFSET_LEFT) +
        (connectionShape as AnyDuringMigration).pathLeft +
        svgPaths.lineOnAxis('H', width + markerOffset * 2) +
        svgPaths.lineOnAxis('V', markerHeight);
    this.markerBlock_!.setAttribute('d', markerPath);
    if (this.workspace.RTL) {
      // AnyDuringMigration because:  Argument of type 'SVGPathElement | null'
      // is not assignable to parameter of type 'SVGElement'.
      this.flipRtl_(this.markerBlock_ as AnyDuringMigration);
    }
    this.currentMarkerSvg = this.markerBlock_;
  }

  /**
   * Move and show the marker at the specified coordinate in workspace units.
   * Displays a filled in rectangle.
   * @param x The new x, in workspace units.
   * @param y The new y, in workspace units.
   * @param width The new width, in workspace units.
   * @param height The new height, in workspace units.
   */
  protected positionRect_(x: number, y: number, width: number, height: number) {
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.markerSvgRect_!.setAttribute('x', x as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.markerSvgRect_!.setAttribute('y', y as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.markerSvgRect_!.setAttribute('width', width as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'number' is not assignable
    // to parameter of type 'string'.
    this.markerSvgRect_!.setAttribute('height', height as AnyDuringMigration);
    this.currentMarkerSvg = this.markerSvgRect_;
  }

  /**
   * Flip the SVG paths in RTL.
   * @param markerSvg The marker that we want to flip.
   */
  private flipRtl_(markerSvg: SVGElement) {
    markerSvg.setAttribute('transform', 'scale(-1 1)');
  }

  /** Hide the marker. */
  hide() {
    this.markerSvgLine_!.style.display = 'none';
    this.markerSvgRect_!.style.display = 'none';
    this.markerInput_!.style.display = 'none';
    this.markerBlock_!.style.display = 'none';
  }

  /**
   * Fire event for the marker or marker.
   * @param oldNode The old node the marker used to be on.
   * @param curNode The new node the marker is currently on.
   */
  private fireMarkerEvent_(oldNode: ASTNode, curNode: ASTNode) {
    const curBlock = curNode.getSourceBlock();
    const event = new (eventUtils.get(eventUtils.MARKER_MOVE))!
        (curBlock, this.isCursor(), oldNode, curNode);
    eventUtils.fire(event);
  }

  /**
   * Get the properties to make a marker blink.
   * @return The object holding attributes to make the marker blink.
   */
  protected getBlinkProperties_(): AnyDuringMigration {
    return {
      'attributeType': 'XML',
      'attributeName': 'fill',
      'dur': '1s',
      'values': this.colour_ + ';transparent;transparent;',
      'repeatCount': 'indefinite',
    };
  }

  /**
   * Create the marker SVG.
   * @return The SVG node created.
   */
  protected createDomInternal_(): Element {
    /* This markup will be generated and added to the .svgGroup_:
        <g>
          <rect width="100" height="5">
            <animate attributeType="XML" attributeName="fill" dur="1s"
              values="transparent;transparent;#fff;transparent"
        repeatCount="indefinite" />
          </rect>
        </g>
        */

    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'Element | undefined'.
    this.markerSvg_ = dom.createSvgElement(
        Svg.G, {
          'width': this.constants.CURSOR_WS_WIDTH,
          'height': this.constants.WS_CURSOR_HEIGHT,
        },
        this.svgGroup_ as AnyDuringMigration);

    // A horizontal line used to represent a workspace coordinate or next
    // connection.
    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'Element | undefined'.
    this.markerSvgLine_ = dom.createSvgElement(
        Svg.RECT, {
          'width': this.constants.CURSOR_WS_WIDTH,
          'height': this.constants.WS_CURSOR_HEIGHT,
          'style': 'display: none',
        },
        this.markerSvg_ as AnyDuringMigration);

    // A filled in rectangle used to represent a stack.
    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'Element | undefined'.
    this.markerSvgRect_ = dom.createSvgElement(
        Svg.RECT, {
          'class': 'blocklyVerticalMarker',
          'rx': 10,
          'ry': 10,
          'style': 'display: none',
        },
        this.markerSvg_ as AnyDuringMigration);

    // A filled in puzzle piece used to represent an input value.
    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'Element | undefined'.
    this.markerInput_ = dom.createSvgElement(
        Svg.PATH, {'transform': '', 'style': 'display: none'},
        this.markerSvg_ as AnyDuringMigration);

    // A path used to represent a previous connection and a block, an output
    // connection and a block, or a block.
    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'Element | undefined'.
    this.markerBlock_ = dom.createSvgElement(
        Svg.PATH, {
          'transform': '',
          'style': 'display: none',
          'fill': 'none',
          'stroke-width': this.constants.CURSOR_STROKE_WIDTH,
        },
        this.markerSvg_ as AnyDuringMigration);

    // Markers and stack markers don't blink.
    if (this.isCursor()) {
      const blinkProperties = this.getBlinkProperties_();
      // AnyDuringMigration because:  Argument of type 'SVGRectElement | null'
      // is not assignable to parameter of type 'Element | undefined'.
      dom.createSvgElement(
          Svg.ANIMATE, blinkProperties,
          this.markerSvgLine_ as AnyDuringMigration);
      // AnyDuringMigration because:  Argument of type 'SVGPathElement | null'
      // is not assignable to parameter of type 'Element | undefined'.
      dom.createSvgElement(
          Svg.ANIMATE, blinkProperties,
          this.markerInput_ as AnyDuringMigration);
      blinkProperties['attributeName'] = 'stroke';
      // AnyDuringMigration because:  Argument of type 'SVGPathElement | null'
      // is not assignable to parameter of type 'Element | undefined'.
      dom.createSvgElement(
          Svg.ANIMATE, blinkProperties,
          this.markerBlock_ as AnyDuringMigration);
    }

    // AnyDuringMigration because:  Type 'SVGGElement | null' is not assignable
    // to type 'Element'.
    return this.markerSvg_ as AnyDuringMigration;
  }

  /**
   * Apply the marker's colour.
   * @param _curNode The node that we want to draw the marker for.
   */
  protected applyColour_(_curNode: ASTNode) {
    this.markerSvgLine_!.setAttribute('fill', this.colour_);
    this.markerSvgRect_!.setAttribute('stroke', this.colour_);
    this.markerInput_!.setAttribute('fill', this.colour_);
    this.markerBlock_!.setAttribute('stroke', this.colour_);

    if (this.isCursor()) {
      const values = this.colour_ + ';transparent;transparent;';
      this.markerSvgLine_!.firstElementChild!.setAttribute('values', values);
      this.markerInput_!.firstElementChild!.setAttribute('values', values);
      this.markerBlock_!.firstElementChild!.setAttribute('values', values);
    }
  }

  /** Dispose of this marker. */
  dispose() {
    if (this.svgGroup_) {
      dom.removeNode(this.svgGroup_);
    }
  }
}
