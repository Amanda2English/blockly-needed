/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a workspace rendered as SVG.
 */

/**
 * Object representing a workspace rendered as SVG.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.WorkspaceSvg');

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './procedures';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './variables';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './variables_dynamic';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './rendered_connection';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './zoom_controls';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_block_create';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_theme_change';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_viewport';
// Unused import preserved for side-effects. Remove if unneeded.
import './metrics_manager';
// Unused import preserved for side-effects. Remove if unneeded.
import './msg';

/* eslint-disable-next-line no-unused-vars */
import {Block} from './block.js';
/* eslint-disable-next-line no-unused-vars */
import {BlockDragSurfaceSvg} from './block_drag_surface.js';
import {BlockSvg} from './block_svg.js';
/* eslint-disable-next-line no-unused-vars */
import {BlocklyOptions} from './blockly_options.js';
import * as browserEvents from './browser_events.js';
import * as common from './common.js';
import {ComponentManager} from './component_manager.js';
import {config} from './config.js';
import {ConnectionDB} from './connection_db.js';
import * as ContextMenu from './contextmenu.js';
import {ContextMenuRegistry} from './contextmenu_registry.js';
import * as dropDownDiv from './dropdowndiv.js';
import * as eventUtils from './events/utils.js';
/* eslint-disable-next-line no-unused-vars */
import {FlyoutButton} from './flyout_button.js';
import {Gesture} from './gesture.js';
import {Grid} from './grid.js';
/* eslint-disable-next-line no-unused-vars */
import {IASTNodeLocationSvg} from './interfaces/i_ast_node_location_svg.js';
/* eslint-disable-next-line no-unused-vars */
import {IBoundedElement} from './interfaces/i_bounded_element.js';
/* eslint-disable-next-line no-unused-vars */
import {ICopyable} from './interfaces/i_copyable.js';
/* eslint-disable-next-line no-unused-vars */
import {IDragTarget} from './interfaces/i_drag_target.js';
/* eslint-disable-next-line no-unused-vars */
import {IFlyout} from './interfaces/i_flyout.js';
/* eslint-disable-next-line no-unused-vars */
import {IMetricsManager} from './interfaces/i_metrics_manager.js';
/* eslint-disable-next-line no-unused-vars */
import {IToolbox} from './interfaces/i_toolbox.js';
/* eslint-disable-next-line no-unused-vars */
import {Cursor} from './keyboard_nav/cursor.js';
/* eslint-disable-next-line no-unused-vars */
import {Marker} from './keyboard_nav/marker.js';
import {MarkerManager} from './marker_manager.js';
import {Options} from './options.js';
import * as Procedures from './procedures.js';
import * as registry from './registry.js';
import * as blockRendering from './renderers/common/block_rendering.js';
/* eslint-disable-next-line no-unused-vars */
import {Renderer} from './renderers/common/renderer.js';
/* eslint-disable-next-line no-unused-vars */
import {ScrollbarPair} from './scrollbar_pair.js';
import * as blocks from './serialization/blocks.js';
/* eslint-disable-next-line no-unused-vars */
import {Theme} from './theme.js';
import {Classic} from './theme/classic.js';
import {ThemeManager} from './theme_manager.js';
import * as Tooltip from './tooltip.js';
import {TouchGesture} from './touch_gesture.js';
/* eslint-disable-next-line no-unused-vars */
import {Trashcan} from './trashcan.js';
import * as utils from './utils.js';
import * as arrayUtils from './utils/array.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
/* eslint-disable-next-line no-unused-vars */
import {Metrics} from './utils/metrics.js';
import {Rect} from './utils/rect.js';
import {Size} from './utils/size.js';
import {Svg} from './utils/svg.js';
import * as svgMath from './utils/svg_math.js';
import * as toolbox from './utils/toolbox.js';
import * as userAgent from './utils/useragent.js';
/* eslint-disable-next-line no-unused-vars */
import {VariableModel} from './variable_model.js';
import * as Variables from './variables.js';
import * as VariablesDynamic from './variables_dynamic.js';
import * as WidgetDiv from './widgetdiv.js';
import {Workspace} from './workspace.js';
import {WorkspaceAudio} from './workspace_audio.js';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceComment} from './workspace_comment.js';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceCommentSvg} from './workspace_comment_svg.js';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceDragSurfaceSvg} from './workspace_drag_surface_svg.js';
import * as Xml from './xml.js';
import {ZoomControls} from './zoom_controls.js';


/** Margin around the top/bottom/left/right after a zoomToFit call. */
const ZOOM_TO_FIT_MARGIN = 20;

/**
 * Class for a workspace.  This is an onscreen area with optional trashcan,
 * scrollbars, bubbles, and dragging.
 * @alias Blockly.WorkspaceSvg
 */
export class WorkspaceSvg extends Workspace implements IASTNodeLocationSvg {
  /**
   * A wrapper function called when a resize event occurs.
   * You can pass the result to `eventHandling.unbind`.
   */
  private resizeHandlerWrapper_: browserEvents.Data|null = null;

  /**
   * The render status of an SVG workspace.
   * Returns `false` for headless workspaces and true for instances of
   * `WorkspaceSvg`.
   */
  override rendered = true;

  /**
   * Whether the workspace is visible.  False if the workspace has been hidden
   * by calling `setVisible(false)`.
   */
  private isVisible_ = true;

  /**
   * Whether this workspace has resizes enabled.
   * Disable during batch operations for a performance improvement.
   */
  private resizesEnabled_ = true;

  /**
   * Current horizontal scrolling offset in pixel units, relative to the
   * workspace origin.
   *
   * It is useful to think about a view, and a canvas moving beneath that
   * view. As the canvas moves right, this value becomes more positive, and
   * the view is now "seeing" the left side of the canvas. As the canvas moves
   * left, this value becomes more negative, and the view is now "seeing" the
   * right side of the canvas.
   *
   * The confusing thing about this value is that it does not, and must not
   * include the absoluteLeft offset. This is because it is used to calculate
   * the viewLeft value.
   *
   * The viewLeft is relative to the workspace origin (although in pixel
   * units). The workspace origin is the top-left corner of the workspace (at
   * least when it is enabled). It is shifted from the top-left of the
   * blocklyDiv so as not to be beneath the toolbox.
   *
   * When the workspace is enabled the viewLeft and workspace origin are at
   * the same X location. As the canvas slides towards the right beneath the
   * view this value (scrollX) becomes more positive, and the viewLeft becomes
   * more negative relative to the workspace origin (imagine the workspace
   * origin as a dot on the canvas sliding to the right as the canvas moves).
   *
   * So if the scrollX were to include the absoluteLeft this would in a way
   * "unshift" the workspace origin. This means that the viewLeft would be
   * representing the left edge of the blocklyDiv, rather than the left edge
   * of the workspace.
   */
  scrollX = 0;

  /**
   * Current vertical scrolling offset in pixel units, relative to the
   * workspace origin.
   *
   * It is useful to think about a view, and a canvas moving beneath that
   * view. As the canvas moves down, this value becomes more positive, and the
   * view is now "seeing" the upper part of the canvas. As the canvas moves
   * up, this value becomes more negative, and the view is "seeing" the lower
   * part of the canvas.
   *
   * This confusing thing about this value is that it does not, and must not
   * include the absoluteTop offset. This is because it is used to calculate
   * the viewTop value.
   *
   * The viewTop is relative to the workspace origin (although in pixel
   * units). The workspace origin is the top-left corner of the workspace (at
   * least when it is enabled). It is shifted from the top-left of the
   * blocklyDiv so as not to be beneath the toolbox.
   *
   * When the workspace is enabled the viewTop and workspace origin are at the
   * same Y location. As the canvas slides towards the bottom this value
   * (scrollY) becomes more positive, and the viewTop becomes more negative
   * relative to the workspace origin (image in the workspace origin as a dot
   * on the canvas sliding downwards as the canvas moves).
   *
   * So if the scrollY were to include the absoluteTop this would in a way
   * "unshift" the workspace origin. This means that the viewTop would be
   * representing the top edge of the blocklyDiv, rather than the top edge of
   * the workspace.
   */
  scrollY = 0;

  /** Horizontal scroll value when scrolling started in pixel units. */
  startScrollX = 0;

  /** Vertical scroll value when scrolling started in pixel units. */
  startScrollY = 0;

  /** Distance from mouse to object being dragged. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Coordinate'.
  private dragDeltaXY_: Coordinate = null as AnyDuringMigration;

  /** Current scale. */
  scale = 1;

  /** Cached scale value. Used to detect changes in viewport. */
  private oldScale_ = 1;

  /** Cached viewport top value. Used to detect changes in viewport. */
  private oldTop_ = 0;

  /** Cached viewport left value. Used to detect changes in viewport. */
  private oldLeft_ = 0;

  /** The workspace's trashcan (if any). */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Trashcan'.
  trashcan: Trashcan = null as AnyDuringMigration;

  /** This workspace's scrollbars, if they exist. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'ScrollbarPair'.
  scrollbar: ScrollbarPair = null as AnyDuringMigration;

  /**
   * Fixed flyout providing blocks which may be dragged into this workspace.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'IFlyout'.
  private flyout_: IFlyout = null as AnyDuringMigration;

  /**
   * Category-based toolbox providing blocks which may be dragged into this
   * workspace.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'IToolbox'.
  private toolbox_: IToolbox = null as AnyDuringMigration;

  /**
   * The current gesture in progress on this workspace, if any.
   * @internal
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'TouchGesture'.
  currentGesture_: TouchGesture = null as AnyDuringMigration;

  /** This workspace's surface for dragging blocks, if it exists. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'BlockDragSurfaceSvg'.
  private readonly blockDragSurface_: BlockDragSurfaceSvg =
      null as AnyDuringMigration;

  /** This workspace's drag surface, if it exists. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'WorkspaceDragSurfaceSvg'.
  private readonly workspaceDragSurface_: WorkspaceDragSurfaceSvg =
      null as AnyDuringMigration;

  /**
   * Whether to move workspace to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   */
  private readonly useWorkspaceDragSurface_;

  /**
   * Whether the drag surface is actively in use. When true, calls to
   * translate will translate the drag surface instead of the translating the
   * workspace directly.
   * This is set to true in setupDragSurface and to false in resetDragSurface.
   */
  private isDragSurfaceActive_ = false;

  /**
   * The first parent div with 'injectionDiv' in the name, or null if not set.
   * Access this with getInjectionDiv.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Element'.
  private injectionDiv_: Element = null as AnyDuringMigration;

  /**
   * Last known position of the page scroll.
   * This is used to determine whether we have recalculated screen coordinate
   * stuff since the page scrolled.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Coordinate'.
  private lastRecordedPageScroll_: Coordinate = null as AnyDuringMigration;

  /**
   * Developers may define this function to add custom menu options to the
   * workspace's context menu or edit the workspace-created set of menu
   * options.
   * @param options List of menu options to add to.
   * @param e The right-click event that triggered the context menu.
   */
  configureContextMenu: AnyDuringMigration;

  /**
   * In a flyout, the target workspace where blocks should be placed after a
   * drag. Otherwise null.
   * @internal
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'WorkspaceSvg'.
  targetWorkspace: WorkspaceSvg = null as AnyDuringMigration;

  /** Inverted screen CTM, for use in mouseToSvg. */
  private inverseScreenCTM_: SVGMatrix|null = null;

  /** Inverted screen CTM is dirty, recalculate it. */
  private inverseScreenCTMDirty_ = true;
  private metricsManager_: IMetricsManager;
  /** @internal */
  getMetrics: () => Metrics;
  /** @internal */
  setMetrics: (p1: {x: number, y: number}) => void;
  private readonly componentManager_: ComponentManager;

  /**
   * List of currently highlighted blocks.  Block highlighting is often used
   * to visually mark blocks currently being executed.
   */
  private readonly highlightedBlocks_: BlockSvg[] = [];
  private audioManager_: WorkspaceAudio;
  private grid_: Grid;
  private markerManager_: MarkerManager;
  private toolboxCategoryCallbacks_:
      {[key: string]: ((p1: WorkspaceSvg) => toolbox.FlyoutDefinition)|null};
  private flyoutButtonCallbacks_:
      {[key: string]: ((p1: FlyoutButton) => AnyDuringMigration)|null};
  protected themeManager_: ThemeManager;
  private readonly renderer_: Renderer;

  /** Cached parent SVG. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGElement'.
  private cachedParentSvg_: SVGElement = null as AnyDuringMigration;

  /** True if keyboard accessibility mode is on, false otherwise. */
  keyboardAccessibilityMode = false;

  /** The list of top-level bounded elements on the workspace. */
  private topBoundedElements_: IBoundedElement[] = [];

  /** The recorded drag targets. */
  private dragTargetAreas_: Array<{component: IDragTarget, clientRect: Rect}> =
      [];
  private readonly cachedParentSvgSize_: Size;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  svgGroup_!: SVGElement;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  svgBackground_!: SVGElement;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  svgBlockCanvas_!: SVGElement;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  svgBubbleCanvas_!: SVGElement;
  zoomControls_: AnyDuringMigration;

  /**
   * @param options Dictionary of options.
   * @param opt_blockDragSurface Drag surface for blocks.
   * @param opt_wsDragSurface Drag surface for the workspace.
   */
  constructor(
      options: Options, opt_blockDragSurface?: BlockDragSurfaceSvg,
      opt_wsDragSurface?: WorkspaceDragSurfaceSvg) {
    super(options);

    const MetricsManagerClass = registry.getClassFromOptions(
        registry.Type.METRICS_MANAGER, options, true);
    /** Object in charge of calculating metrics for the workspace. */
    this.metricsManager_ = new MetricsManagerClass!(this);

    /** Method to get all the metrics that have to do with a workspace. */
    this.getMetrics = options.getMetrics ||
        this.metricsManager_.getMetrics.bind(this.metricsManager_);

    /** Translates the workspace. */
    this.setMetrics =
        options.setMetrics || WorkspaceSvg.setTopLevelWorkspaceMetrics_;

    this.componentManager_ = new ComponentManager();

    this.connectionDBList = ConnectionDB.init(this.connectionChecker);

    if (opt_blockDragSurface) {
      this.blockDragSurface_ = opt_blockDragSurface;
    }

    if (opt_wsDragSurface) {
      this.workspaceDragSurface_ = opt_wsDragSurface;
    }

    this.useWorkspaceDragSurface_ =
        !!this.workspaceDragSurface_ && svgMath.is3dSupported();

    /**
     * Object in charge of loading, storing, and playing audio for a workspace.
     */
    this.audioManager_ =
        new WorkspaceAudio((options.parentWorkspace as WorkspaceSvg));

    /** This workspace's grid object or null. */
    // AnyDuringMigration because:  Type 'Grid | null' is not assignable to type
    // 'Grid'.
    this.grid_ = (this.options.gridPattern ?
                      new Grid(this.options.gridPattern, options.gridOptions) :
                      null) as AnyDuringMigration;

    /** Manager in charge of markers and cursors. */
    this.markerManager_ = new MarkerManager(this);

    /**
     * Map from function names to callbacks, for deciding what to do when a
     * custom toolbox category is opened.
     */
    this.toolboxCategoryCallbacks_ = Object.create(null);

    /**
     * Map from function names to callbacks, for deciding what to do when a
     * button is clicked.
     */
    this.flyoutButtonCallbacks_ = Object.create(null);

    if (Variables && Variables.flyoutCategory) {
      this.registerToolboxCategoryCallback(
          Variables.CATEGORY_NAME, Variables.flyoutCategory);
    }

    if (VariablesDynamic && VariablesDynamic.flyoutCategory) {
      this.registerToolboxCategoryCallback(
          VariablesDynamic.CATEGORY_NAME, VariablesDynamic.flyoutCategory);
    }

    if (Procedures && Procedures.flyoutCategory) {
      this.registerToolboxCategoryCallback(
          Procedures.CATEGORY_NAME, Procedures.flyoutCategory);
      this.addChangeListener(Procedures.mutatorOpenListener);
    }

    /** Object in charge of storing and updating the workspace theme. */
    this.themeManager_ = this.options.parentWorkspace ?
        this.options.parentWorkspace.getThemeManager() :
        new ThemeManager(this, this.options.theme || Classic);
    // AnyDuringMigration because:  Argument of type 'this' is not assignable to
    // parameter of type 'Workspace'.
    this.themeManager_.subscribeWorkspace(this as AnyDuringMigration);

    /** The block renderer used for rendering blocks on this workspace. */
    this.renderer_ = blockRendering.init(
        this.options.renderer || 'geras', this.getTheme(),
        this.options.rendererOverrides);

    /**
     * The cached size of the parent svg element.
     * Used to compute svg metrics.
     */
    this.cachedParentSvgSize_ = new Size(0, 0);
  }

  /**
   * Get the marker manager for this workspace.
   * @return The marker manager.
   */
  getMarkerManager(): MarkerManager {
    return this.markerManager_;
  }

  /**
   * Gets the metrics manager for this workspace.
   * @return The metrics manager.
   */
  getMetricsManager(): IMetricsManager {
    return this.metricsManager_;
  }

  /**
   * Sets the metrics manager for the workspace.
   * @param metricsManager The metrics manager.
   * @internal
   */
  setMetricsManager(metricsManager: IMetricsManager) {
    this.metricsManager_ = metricsManager;
    this.getMetrics =
        this.metricsManager_.getMetrics.bind(this.metricsManager_);
  }

  /**
   * Gets the component manager for this workspace.
   * @return The component manager.
   */
  getComponentManager(): ComponentManager {
    return this.componentManager_;
  }

  /**
   * Add the cursor SVG to this workspaces SVG group.
   * @param cursorSvg The SVG root of the cursor to be added to the workspace
   *     SVG group.
   * @internal
   */
  setCursorSvg(cursorSvg: SVGElement) {
    this.markerManager_.setCursorSvg(cursorSvg);
  }

  /**
   * Add the marker SVG to this workspaces SVG group.
   * @param markerSvg The SVG root of the marker to be added to the workspace
   *     SVG group.
   * @internal
   */
  setMarkerSvg(markerSvg: SVGElement) {
    this.markerManager_.setMarkerSvg(markerSvg);
  }

  /**
   * Get the marker with the given ID.
   * @param id The ID of the marker.
   * @return The marker with the given ID or null if no marker with the given ID
   *     exists.
   * @internal
   */
  getMarker(id: string): Marker|null {
    if (this.markerManager_) {
      return this.markerManager_.getMarker(id);
    }
    return null;
  }

  /**
   * The cursor for this workspace.
   * @return The cursor for the workspace.
   */
  getCursor(): Cursor|null {
    if (this.markerManager_) {
      return this.markerManager_.getCursor();
    }
    return null;
  }

  /**
   * Get the block renderer attached to this workspace.
   * @return The renderer attached to this workspace.
   */
  getRenderer(): Renderer {
    return this.renderer_;
  }

  /**
   * Get the theme manager for this workspace.
   * @return The theme manager for this workspace.
   * @internal
   */
  getThemeManager(): ThemeManager {
    return this.themeManager_;
  }

  /**
   * Get the workspace theme object.
   * @return The workspace theme object.
   */
  getTheme(): Theme {
    return this.themeManager_.getTheme();
  }

  /**
   * Set the workspace theme object.
   * If no theme is passed, default to the `Classic` theme.
   * @param theme The workspace theme object.
   */
  setTheme(theme: Theme) {
    if (!theme) {
      theme = Classic as Theme;
    }
    this.themeManager_.setTheme(theme);
  }

  /**
   * Refresh all blocks on the workspace after a theme update.
   */
  refreshTheme() {
    if (this.svgGroup_) {
      this.renderer_.refreshDom(this.svgGroup_, this.getTheme());
    }

    // Update all blocks in workspace that have a style name.
    // AnyDuringMigration because:  Argument of type 'BlockSvg[]' is not
    // assignable to parameter of type 'Block[]'.
    this.updateBlockStyles_(this.getAllBlocks(false).filter(function(block) {
      return !!block.getStyleName();
    }) as AnyDuringMigration);

    // Update current toolbox selection.
    this.refreshToolboxSelection();
    if (this.toolbox_) {
      this.toolbox_.refreshTheme();
    }

    // Re-render if workspace is visible
    if (this.isVisible()) {
      this.setVisible(true);
    }

    const event = new (eventUtils.get(eventUtils.THEME_CHANGE))!
        (this.getTheme().name, this.id);
    eventUtils.fire(event);
  }

  /**
   * Updates all the blocks with new style.
   * @param blocks List of blocks to update the style on.
   */
  private updateBlockStyles_(blocks: Block[]) {
    for (let i = 0, block; block = blocks[i]; i++) {
      const blockStyleName = block.getStyleName();
      if (blockStyleName) {
        const blockSvg = block as BlockSvg;
        blockSvg.setStyle(blockStyleName);
        if (blockSvg.mutator) {
          blockSvg.mutator.updateBlockStyle();
        }
      }
    }
  }

  /**
   * Getter for the inverted screen CTM.
   * @return The matrix to use in mouseToSvg
   */
  getInverseScreenCTM(): SVGMatrix|null {
    // Defer getting the screen CTM until we actually need it, this should
    // avoid forced reflows from any calls to updateInverseScreenCTM.
    if (this.inverseScreenCTMDirty_) {
      const ctm = this.getParentSvg().getScreenCTM();
      if (ctm) {
        this.inverseScreenCTM_ = (ctm).inverse();
        this.inverseScreenCTMDirty_ = false;
      }
    }

    return this.inverseScreenCTM_;
  }

  /** Mark the inverse screen CTM as dirty. */
  updateInverseScreenCTM() {
    this.inverseScreenCTMDirty_ = true;
  }

  /**
   * Getter for isVisible
   * @return Whether the workspace is visible.
   *     False if the workspace has been hidden by calling `setVisible(false)`.
   */
  isVisible(): boolean {
    return this.isVisible_;
  }

  /**
   * Return the absolute coordinates of the top-left corner of this element,
   * scales that after canvas SVG element, if it's a descendant.
   * The origin (0,0) is the top-left corner of the Blockly SVG.
   * @param element SVG element to find the coordinates of.
   * @return Object with .x and .y properties.
   * @internal
   */
  getSvgXY(element: SVGElement): Coordinate {
    let x = 0;
    let y = 0;
    let scale = 1;
    if (dom.containsNode(this.getCanvas(), element) ||
        dom.containsNode(this.getBubbleCanvas(), element)) {
      // Before the SVG canvas, scale the coordinates.
      scale = this.scale;
    }
    do {
      // Loop through this block and every parent.
      const xy = svgMath.getRelativeXY(element);
      if (element === this.getCanvas() || element === this.getBubbleCanvas()) {
        // After the SVG canvas, don't scale the coordinates.
        scale = 1;
      }
      x += xy.x * scale;
      y += xy.y * scale;
      element = element.parentNode as SVGElement;
    } while (element && element !== this.getParentSvg());
    return new Coordinate(x, y);
  }

  /**
   * Gets the size of the workspace's parent SVG element.
   * @return The cached width and height of the workspace's parent SVG element.
   * @internal
   */
  getCachedParentSvgSize(): Size {
    const size = this.cachedParentSvgSize_;
    return new Size(size.width, size.height);
  }

  /**
   * Return the position of the workspace origin relative to the injection div
   * origin in pixels.
   * The workspace origin is where a block would render at position (0, 0).
   * It is not the upper left corner of the workspace SVG.
   * @return Offset in pixels.
   * @internal
   */
  getOriginOffsetInPixels(): Coordinate {
    return svgMath.getInjectionDivXY(this.getCanvas());
  }

  /**
   * Return the injection div that is a parent of this workspace.
   * Walks the DOM the first time it's called, then returns a cached value.
   * Note: We assume this is only called after the workspace has been injected
   * into the DOM.
   * @return The first parent div with 'injectionDiv' in the name.
   * @internal
   */
  getInjectionDiv(): Element {
    // NB: it would be better to pass this in at createDom, but is more likely
    // to break existing uses of Blockly.
    if (!this.injectionDiv_) {
      let element: Element = this.svgGroup_;
      while (element) {
        const classes = element.getAttribute('class') || '';
        if ((' ' + classes + ' ').indexOf(' injectionDiv ') !== -1) {
          this.injectionDiv_ = element;
          break;
        }
        element = element.parentNode as Element;
      }
    }
    return this.injectionDiv_;
  }

  /**
   * Get the SVG block canvas for the workspace.
   * @return The SVG group for the workspace.
   * @internal
   */
  getBlockCanvas(): SVGElement|null {
    return this.svgBlockCanvas_;
  }

  /**
   * Save resize handler data so we can delete it later in dispose.
   * @param handler Data that can be passed to eventHandling.unbind.
   */
  setResizeHandlerWrapper(handler: browserEvents.Data) {
    this.resizeHandlerWrapper_ = handler;
  }

  /**
   * Create the workspace DOM elements.
   * @param opt_backgroundClass Either 'blocklyMainBackground' or
   *     'blocklyMutatorBackground'.
   * @return The workspace's SVG group.
   */
  createDom(opt_backgroundClass?: string): Element {
    /**
     * <g class="blocklyWorkspace">
     *   <rect class="blocklyMainBackground" height="100%" width="100%"></rect>
     *   [Trashcan and/or flyout may go here]
     *   <g class="blocklyBlockCanvas"></g>
     *   <g class="blocklyBubbleCanvas"></g>
     * </g>
     */
    this.svgGroup_ = dom.createSvgElement(Svg.G, {'class': 'blocklyWorkspace'});

    // Note that a <g> alone does not receive mouse events--it must have a
    // valid target inside it.  If no background class is specified, as in the
    // flyout, the workspace will not receive mouse events.
    if (opt_backgroundClass) {
      this.svgBackground_ = dom.createSvgElement(
          Svg.RECT,
          {'height': '100%', 'width': '100%', 'class': opt_backgroundClass},
          this.svgGroup_);

      if (opt_backgroundClass === 'blocklyMainBackground' && this.grid_) {
        this.svgBackground_.style.fill =
            'url(#' + this.grid_.getPatternId() + ')';
      } else {
        this.themeManager_.subscribe(
            this.svgBackground_, 'workspaceBackgroundColour', 'fill');
      }
    }
    this.svgBlockCanvas_ = dom.createSvgElement(
        Svg.G, {'class': 'blocklyBlockCanvas'}, this.svgGroup_);
    this.svgBubbleCanvas_ = dom.createSvgElement(
        Svg.G, {'class': 'blocklyBubbleCanvas'}, this.svgGroup_);

    if (!this.isFlyout) {
      browserEvents.conditionalBind(
          this.svgGroup_, 'mousedown', this, this.onMouseDown_, false, true);
      // This no-op works around https://bugs.webkit.org/show_bug.cgi?id=226683,
      // which otherwise prevents zoom/scroll events from being observed in
      // Safari. Once that bug is fixed it should be removed.
      document.body.addEventListener('wheel', function() {});
      browserEvents.conditionalBind(
          this.svgGroup_, 'wheel', this, this.onMouseWheel_);
    }

    // Determine if there needs to be a category tree, or a simple list of
    // blocks.  This cannot be changed later, since the UI is very different.
    if (this.options.hasCategories) {
      const ToolboxClass = registry.getClassFromOptions(
          registry.Type.TOOLBOX, this.options, true);
      this.toolbox_ = new ToolboxClass!(this);
    }
    if (this.grid_) {
      this.grid_.update(this.scale);
    }
    this.recordDragTargets();
    const CursorClass =
        registry.getClassFromOptions(registry.Type.CURSOR, this.options);

    CursorClass && this.markerManager_.setCursor(new CursorClass());

    this.renderer_.createDom(this.svgGroup_, this.getTheme());
    return this.svgGroup_;
  }

  /**
   * Dispose of this workspace.
   * Unlink from all DOM elements to prevent memory leaks.
   * @suppress {checkTypes}
   */
  override dispose() {
    // Stop rerendering.
    this.rendered = false;
    if (this.currentGesture_) {
      this.currentGesture_.cancel();
    }
    if (this.svgGroup_) {
      dom.removeNode(this.svgGroup_);
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'SVGElement'.
      this.svgGroup_ = null as AnyDuringMigration;
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'SVGElement'.
    this.svgBlockCanvas_ = null as AnyDuringMigration;
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'SVGElement'.
    this.svgBubbleCanvas_ = null as AnyDuringMigration;
    if (this.toolbox_) {
      this.toolbox_.dispose();
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'IToolbox'.
      this.toolbox_ = null as AnyDuringMigration;
    }
    if (this.flyout_) {
      this.flyout_.dispose();
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'IFlyout'.
      this.flyout_ = null as AnyDuringMigration;
    }
    if (this.trashcan) {
      this.trashcan.dispose();
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'Trashcan'.
      this.trashcan = null as AnyDuringMigration;
    }
    if (this.scrollbar) {
      this.scrollbar.dispose();
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'ScrollbarPair'.
      this.scrollbar = null as AnyDuringMigration;
    }
    if (this.zoomControls_) {
      this.zoomControls_.dispose();
      this.zoomControls_ = null;
    }

    if (this.audioManager_) {
      this.audioManager_.dispose();
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'WorkspaceAudio'.
      this.audioManager_ = null as AnyDuringMigration;
    }

    if (this.grid_) {
      this.grid_.dispose();
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'Grid'.
      this.grid_ = null as AnyDuringMigration;
    }

    this.renderer_.dispose();

    if (this.markerManager_) {
      this.markerManager_.dispose();
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'MarkerManager'.
      this.markerManager_ = null as AnyDuringMigration;
    }

    super.dispose();

    // Dispose of theme manager after all blocks and mutators are disposed of.
    if (this.themeManager_) {
      // AnyDuringMigration because:  Argument of type 'this' is not assignable
      // to parameter of type 'Workspace'.
      this.themeManager_.unsubscribeWorkspace(this as AnyDuringMigration);
      this.themeManager_.unsubscribe(this.svgBackground_);
      if (!this.options.parentWorkspace) {
        this.themeManager_.dispose();
        // AnyDuringMigration because:  Type 'null' is not assignable to type
        // 'ThemeManager'.
        this.themeManager_ = null as AnyDuringMigration;
      }
    }

    this.connectionDBList.length = 0;

    // AnyDuringMigration because:  Type 'null' is not assignable to type '{
    // [key: string]: ((p1: WorkspaceSvg) => FlyoutDefinition) | null; }'.
    this.toolboxCategoryCallbacks_ = null as AnyDuringMigration;
    // AnyDuringMigration because:  Type 'null' is not assignable to type '{
    // [key: string]: ((p1: FlyoutButton) => any) | null; }'.
    this.flyoutButtonCallbacks_ = null as AnyDuringMigration;

    if (!this.options.parentWorkspace) {
      // Top-most workspace.  Dispose of the div that the
      // SVG is injected into (i.e. injectionDiv).
      const parentSvg = this.getParentSvg();
      if (parentSvg && parentSvg.parentNode) {
        dom.removeNode(parentSvg.parentNode);
      }
    }
    if (this.resizeHandlerWrapper_) {
      browserEvents.unbind(this.resizeHandlerWrapper_);
      this.resizeHandlerWrapper_ = null;
    }
  }

  /**
   * Add a trashcan.
   * @internal
   */
  addTrashcan() {
    this.trashcan = new Trashcan(this);
    const svgTrashcan = this.trashcan.createDom();
    this.svgGroup_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
  }

  /**
   * Add zoom controls.
   * @internal
   */
  addZoomControls() {
    this.zoomControls_ = new ZoomControls(this);
    const svgZoomControls = this.zoomControls_.createDom();
    this.svgGroup_.appendChild(svgZoomControls);
  }

  /**
   * Add a flyout element in an element with the given tag name.
   * @param tagName What type of tag the flyout belongs in.
   * @return The element containing the flyout DOM.
   * @internal
   */
  addFlyout(tagName: string|Svg<SVGSVGElement>|Svg<SVGGElement>): Element {
    const workspaceOptions = new Options(({
      'parentWorkspace': this,
      'rtl': this.RTL,
      'oneBasedIndex': this.options.oneBasedIndex,
      'horizontalLayout': this.horizontalLayout,
      'renderer': this.options.renderer,
      'rendererOverrides': this.options.rendererOverrides,
      'move': {
        'scrollbars': true,
      },
    } as BlocklyOptions));
    workspaceOptions.toolboxPosition = this.options.toolboxPosition;
    if (this.horizontalLayout) {
      const HorizontalFlyout = registry.getClassFromOptions(
          registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX, this.options, true);
      this.flyout_ = new HorizontalFlyout!(workspaceOptions);
    } else {
      const VerticalFlyout = registry.getClassFromOptions(
          registry.Type.FLYOUTS_VERTICAL_TOOLBOX, this.options, true);
      this.flyout_ = new VerticalFlyout!(workspaceOptions);
    }
    this.flyout_.autoClose = false;
    this.flyout_.getWorkspace().setVisible(true);

    // Return the element so that callers can place it in their desired
    // spot in the DOM.  For example, mutator flyouts do not go in the same
    // place as main workspace flyouts.
    return this.flyout_.createDom(tagName);
  }

  /**
   * Getter for the flyout associated with this workspace.  This flyout may be
   * owned by either the toolbox or the workspace, depending on toolbox
   * configuration.  It will be null if there is no flyout.
   * @param opt_own Whether to only return the workspace's own flyout.
   * @return The flyout on this workspace.
   * @internal
   */
  getFlyout(opt_own?: boolean): IFlyout|null {
    if (this.flyout_ || opt_own) {
      return this.flyout_;
    }
    if (this.toolbox_) {
      return this.toolbox_.getFlyout();
    }
    return null;
  }

  /**
   * Getter for the toolbox associated with this workspace, if one exists.
   * @return The toolbox on this workspace.
   * @internal
   */
  getToolbox(): IToolbox|null {
    return this.toolbox_;
  }

  /**
   * Update items that use screen coordinate calculations
   * because something has changed (e.g. scroll position, window size).
   */
  private updateScreenCalculations_() {
    this.updateInverseScreenCTM();
    this.recordDragTargets();
  }

  /**
   * If enabled, resize the parts of the workspace that change when the
   * workspace contents (e.g. block positions) change.  This will also scroll
   * the workspace contents if needed.
   * @internal
   */
  resizeContents() {
    if (!this.resizesEnabled_ || !this.rendered) {
      return;
    }
    if (this.scrollbar) {
      this.scrollbar.resize();
    }
    this.updateInverseScreenCTM();
  }

  /**
   * Resize and reposition all of the workspace chrome (toolbox,
   * trash, scrollbars etc.)
   * This should be called when something changes that
   * requires recalculating dimensions and positions of the
   * trash, zoom, toolbox, etc. (e.g. window resize).
   */
  resize() {
    if (this.toolbox_) {
      this.toolbox_.position();
    }
    if (this.flyout_) {
      this.flyout_.position();
    }

    const positionables = this.componentManager_.getComponents(
        ComponentManager.Capability.POSITIONABLE, true);
    const metrics = this.getMetricsManager().getUiMetrics();
    const savedPositions = [];
    for (let i = 0, positionable; positionable = positionables[i]; i++) {
      positionable.position(metrics, savedPositions);
      const boundingRect = positionable.getBoundingRectangle();
      if (boundingRect) {
        savedPositions.push(boundingRect);
      }
    }

    if (this.scrollbar) {
      this.scrollbar.resize();
    }
    this.updateScreenCalculations_();
  }

  /**
   * Resizes and repositions workspace chrome if the page has a new
   * scroll position.
   * @internal
   */
  updateScreenCalculationsIfScrolled() {
    /* eslint-disable indent */
    const currScroll = svgMath.getDocumentScroll();
    if (!Coordinate.equals(this.lastRecordedPageScroll_, currScroll)) {
      this.lastRecordedPageScroll_ = currScroll;
      this.updateScreenCalculations_();
    }
  }
  /* eslint-enable indent */

  /**
   * Get the SVG element that forms the drawing surface.
   * @return SVG group element.
   */
  getCanvas(): SVGGElement {
    return this.svgBlockCanvas_ as SVGGElement;
  }

  /**
   * Caches the width and height of the workspace's parent SVG element for use
   * with getSvgMetrics.
   * @param width The width of the parent SVG element.
   * @param height The height of the parent SVG element
   * @internal
   */
  setCachedParentSvgSize(width: number|null, height: number|null) {
    const svg = this.getParentSvg();
    if (width != null) {
      this.cachedParentSvgSize_.width = width;
      // This is set to support the public (but deprecated) Blockly.svgSize
      // method.
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      svg.setAttribute('data-cached-width', width as AnyDuringMigration);
    }
    if (height != null) {
      this.cachedParentSvgSize_.height = height;
      // This is set to support the public (but deprecated) Blockly.svgSize
      // method.
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      svg.setAttribute('data-cached-height', height as AnyDuringMigration);
    }
  }

  /**
   * Get the SVG element that forms the bubble surface.
   * @return SVG group element.
   */
  getBubbleCanvas(): SVGGElement {
    return this.svgBubbleCanvas_ as SVGGElement;
  }

  /**
   * Get the SVG element that contains this workspace.
   * Note: We assume this is only called after the workspace has been injected
   * into the DOM.
   * @return SVG element.
   */
  getParentSvg(): SVGSVGElement {
    if (!this.cachedParentSvg_) {
      let element = this.svgGroup_;
      while (element) {
        if (element.tagName === 'svg') {
          this.cachedParentSvg_ = element;
          break;
        }
        element = element.parentNode as SVGSVGElement;
      }
    }
    return this.cachedParentSvg_ as SVGSVGElement;
  }

  /**
   * Fires a viewport event if events are enabled and there is a change in
   * viewport values.
   * @internal
   */
  maybeFireViewportChangeEvent() {
    if (!eventUtils.isEnabled()) {
      return;
    }
    const scale = this.scale;
    const top = -this.scrollY;
    const left = -this.scrollX;
    if (scale === this.oldScale_ && Math.abs(top - this.oldTop_) < 1 &&
        Math.abs(left - this.oldLeft_) < 1) {
      // Ignore sub-pixel changes in top and left. Due to #4192 there are a lot
      // of negligible changes in viewport top/left.
      return;
    }
    const event = new (eventUtils.get(eventUtils.VIEWPORT_CHANGE))!
        (top, left, scale, this.id, this.oldScale_);
    this.oldScale_ = scale;
    this.oldTop_ = top;
    this.oldLeft_ = left;
    eventUtils.fire(event);
  }

  /**
   * Translate this workspace to new coordinates.
   * @param x Horizontal translation, in pixel units relative to the top left of
   *     the Blockly div.
   * @param y Vertical translation, in pixel units relative to the top left of
   *     the Blockly div.
   */
  translate(x: number, y: number) {
    if (this.useWorkspaceDragSurface_ && this.isDragSurfaceActive_) {
      this.workspaceDragSurface_.translateSurface(x, y);
    } else {
      const translation = 'translate(' + x + ',' + y + ') ' +
          'scale(' + this.scale + ')';
      this.svgBlockCanvas_.setAttribute('transform', translation);
      this.svgBubbleCanvas_.setAttribute('transform', translation);
    }
    // Now update the block drag surface if we're using one.
    if (this.blockDragSurface_) {
      this.blockDragSurface_.translateAndScaleGroup(x, y, this.scale);
    }
    // And update the grid if we're using one.
    if (this.grid_) {
      this.grid_.moveTo(x, y);
    }

    this.maybeFireViewportChangeEvent();
  }

  /**
   * Called at the end of a workspace drag to take the contents
   * out of the drag surface and put them back into the workspace SVG.
   * Does nothing if the workspace drag surface is not enabled.
   * @internal
   */
  resetDragSurface() {
    // Don't do anything if we aren't using a drag surface.
    if (!this.useWorkspaceDragSurface_) {
      return;
    }

    this.isDragSurfaceActive_ = false;

    const trans = this.workspaceDragSurface_.getSurfaceTranslation();
    this.workspaceDragSurface_.clearAndHide(this.svgGroup_);
    const translation = 'translate(' + trans.x + ',' + trans.y + ') ' +
        'scale(' + this.scale + ')';
    this.svgBlockCanvas_.setAttribute('transform', translation);
    this.svgBubbleCanvas_.setAttribute('transform', translation);
  }

  /**
   * Called at the beginning of a workspace drag to move contents of
   * the workspace to the drag surface.
   * Does nothing if the drag surface is not enabled.
   * @internal
   */
  setupDragSurface() {
    // Don't do anything if we aren't using a drag surface.
    if (!this.useWorkspaceDragSurface_) {
      return;
    }

    // This can happen if the user starts a drag, mouses up outside of the
    // document where the mouseup listener is registered (e.g. outside of an
    // iframe) and then moves the mouse back in the workspace.  On mobile and
    // ff, we get the mouseup outside the frame. On chrome and safari desktop we
    // do not.
    if (this.isDragSurfaceActive_) {
      return;
    }

    this.isDragSurfaceActive_ = true;

    // Figure out where we want to put the canvas back.  The order
    // in the is important because things are layered.
    const previousElement = this.svgBlockCanvas_.previousSibling as Element;
    // AnyDuringMigration because:  Argument of type 'string | null' is not
    // assignable to parameter of type 'string'.
    const width = parseInt(
        this.getParentSvg().getAttribute('width') as AnyDuringMigration, 10);
    // AnyDuringMigration because:  Argument of type 'string | null' is not
    // assignable to parameter of type 'string'.
    const height = parseInt(
        this.getParentSvg().getAttribute('height') as AnyDuringMigration, 10);
    const coord = svgMath.getRelativeXY(this.getCanvas());
    this.workspaceDragSurface_.setContentsAndShow(
        this.getCanvas(), this.getBubbleCanvas(), previousElement, width,
        height, this.scale);
    this.workspaceDragSurface_.translateSurface(coord.x, coord.y);
  }

  /**
   * Gets the drag surface blocks are moved to when a drag is started.
   * @return This workspace's block drag surface, if one is in use.
   * @internal
   */
  getBlockDragSurface(): BlockDragSurfaceSvg|null {
    return this.blockDragSurface_;
  }

  /**
   * Returns the horizontal offset of the workspace.
   * Intended for LTR/RTL compatibility in XML.
   * @return Width.
   */
  override getWidth(): number {
    const metrics = this.getMetrics();
    return metrics ? metrics.viewWidth / this.scale : 0;
  }

  /**
   * Toggles the visibility of the workspace.
   * Currently only intended for main workspace.
   * @param isVisible True if workspace should be visible.
   */
  setVisible(isVisible: boolean) {
    this.isVisible_ = isVisible;
    if (!this.svgGroup_) {
      return;
    }

    // Tell the scrollbar whether its container is visible so it can
    // tell when to hide itself.
    if (this.scrollbar) {
      this.scrollbar.setContainerVisible(isVisible);
    }

    // Tell the flyout whether its container is visible so it can
    // tell when to hide itself.
    if (this.getFlyout()) {
      this.getFlyout()!.setContainerVisible(isVisible);
    }

    this.getParentSvg().style.display = isVisible ? 'block' : 'none';
    if (this.toolbox_) {
      // Currently does not support toolboxes in mutators.
      this.toolbox_.setVisible(isVisible);
    }
    if (isVisible) {
      const blocks = this.getAllBlocks(false);
      // Tell each block on the workspace to mark its fields as dirty.
      for (let i = blocks.length - 1; i >= 0; i--) {
        blocks[i].markDirty();
      }

      this.render();
      if (this.toolbox_) {
        this.toolbox_.position();
      }
    } else {
      this.hideChaff(true);
    }
  }

  /** Render all blocks in workspace. */
  render() {
    // Generate list of all blocks.
    const blocks = this.getAllBlocks(false);
    // Render each block.
    for (let i = blocks.length - 1; i >= 0; i--) {
      blocks[i].render(false);
    }

    if (this.currentGesture_) {
      const imList = this.currentGesture_.getInsertionMarkers();
      for (let i = 0; i < imList.length; i++) {
        imList[i].render(false);
      }
    }

    this.markerManager_.updateMarkers();
  }

  /**
   * Highlight or unhighlight a block in the workspace.  Block highlighting is
   * often used to visually mark blocks currently being executed.
   * @param id ID of block to highlight/unhighlight, or null for no block (used
   *     to unhighlight all blocks).
   * @param opt_state If undefined, highlight specified block and automatically
   *     unhighlight all others.  If true or false, manually
   *     highlight/unhighlight the specified block.
   */
  highlightBlock(id: string|null, opt_state?: boolean) {
    if (opt_state === undefined) {
      // Unhighlight all blocks.
      for (let i = 0, block; block = this.highlightedBlocks_[i]; i++) {
        block.setHighlighted(false);
      }
      this.highlightedBlocks_.length = 0;
    }
    // Highlight/unhighlight the specified block.
    const block = id ? this.getBlockById(id) : null;
    if (block) {
      const state = opt_state === undefined || opt_state;
      // Using Set here would be great, but at the cost of IE10 support.
      if (!state) {
        arrayUtils.removeElem(this.highlightedBlocks_, block);
      } else if (this.highlightedBlocks_.indexOf(block) === -1) {
        this.highlightedBlocks_.push(block);
      }
      block.setHighlighted(state);
    }
  }

  /**
   * Pastes the provided block or workspace comment onto the workspace.
   * Does not check whether there is remaining capacity for the object, that
   * should be done before calling this method.
   * @param state The representation of the thing to paste.
   * @return The pasted thing, or null if the paste was not successful.
   */
  paste(state: AnyDuringMigration|Element|DocumentFragment): ICopyable|null {
    if (!this.rendered || !state['type'] && !state['tagName']) {
      return null;
    }
    if (this.currentGesture_) {
      // Dragging while pasting?  No.
      this.currentGesture_.cancel();
    }

    const existingGroup = eventUtils.getGroup();
    if (!existingGroup) {
      eventUtils.setGroup(true);
    }

    let pastedThing;
    // Checks if this is JSON. JSON has a type property, while elements don't.
    if (state['type']) {
      pastedThing = this.pasteBlock_(null, state as blocks.State);
    } else {
      const xmlBlock = state as Element;
      if (xmlBlock.tagName.toLowerCase() === 'comment') {
        pastedThing = this.pasteWorkspaceComment_(xmlBlock);
      } else {
        pastedThing = this.pasteBlock_(xmlBlock, null);
      }
    }

    eventUtils.setGroup(existingGroup);
    return pastedThing;
  }

  /**
   * Paste the provided block onto the workspace.
   * @param xmlBlock XML block element.
   * @param jsonBlock JSON block representation.
   * @return The pasted block.
   */
  private pasteBlock_(xmlBlock: Element|null, jsonBlock: blocks.State|null):
      BlockSvg {
    eventUtils.disable();
    let block: BlockSvg;
    try {
      let blockX = 0;
      let blockY = 0;
      if (xmlBlock) {
        // AnyDuringMigration because:  Argument of type 'this' is not
        // assignable to parameter of type 'Workspace'.
        block =
            Xml.domToBlock(xmlBlock, this as AnyDuringMigration) as BlockSvg;
        // AnyDuringMigration because:  Argument of type 'string | null' is not
        // assignable to parameter of type 'string'.
        blockX = parseInt(xmlBlock.getAttribute('x') as AnyDuringMigration, 10);
        if (this.RTL) {
          blockX = -blockX;
        }
        // AnyDuringMigration because:  Argument of type 'string | null' is not
        // assignable to parameter of type 'string'.
        blockY = parseInt(xmlBlock.getAttribute('y') as AnyDuringMigration, 10);
      } else if (jsonBlock) {
        // AnyDuringMigration because:  Argument of type 'this' is not
        // assignable to parameter of type 'Workspace'.
        block =
            blocks.append(jsonBlock, this as AnyDuringMigration) as BlockSvg;
        blockX = jsonBlock['x'] || 10;
        if (this.RTL) {
          blockX = this.getWidth() - blockX;
        }
        blockY = jsonBlock['y'] || 10;
      }

      // Move the duplicate to original position.
      if (!isNaN(blockX) && !isNaN(blockY)) {
        // Offset block until not clobbering another block and not in connection
        // distance with neighbouring blocks.
        let collide;
        do {
          collide = false;
          const allBlocks = this.getAllBlocks(false);
          for (let i = 0, otherBlock; otherBlock = allBlocks[i]; i++) {
            const otherXY = otherBlock.getRelativeToSurfaceXY();
            if (Math.abs(blockX - otherXY.x) <= 1 &&
                Math.abs(blockY - otherXY.y) <= 1) {
              collide = true;
              break;
            }
          }
          if (!collide) {
            // Check for blocks in snap range to any of its connections.
            const connections = block!.getConnections_(false);
            for (let i = 0, connection; connection = connections[i]; i++) {
              const neighbour =
                  (connection)
                      .closest(
                          config.snapRadius, new Coordinate(blockX, blockY));
              if (neighbour.connection) {
                collide = true;
                break;
              }
            }
          }
          if (collide) {
            if (this.RTL) {
              blockX -= config.snapRadius;
            } else {
              blockX += config.snapRadius;
            }
            blockY += config.snapRadius * 2;
          }
        } while (collide);
        block!.moveTo(new Coordinate(blockX, blockY));
      }
    } finally {
      eventUtils.enable();
    }
    if (eventUtils.isEnabled() && !block!.isShadow()) {
      eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CREATE))!(block!));
    }
    block!.select();
    return block!;
  }

  /**
   * Paste the provided comment onto the workspace.
   * @param xmlComment XML workspace comment element.
   * @return The pasted workspace comment.
   * @suppress {checkTypes} Suppress checks while workspace comments are not
   * bundled in.
   */
  private pasteWorkspaceComment_(xmlComment: Element): WorkspaceCommentSvg {
    eventUtils.disable();
    let comment;
    try {
      // AnyDuringMigration because:  Property 'get' does not exist on type
      // '(name: string) => void'.
      comment = WorkspaceCommentSvg.fromXml(xmlComment, this);
      // Move the duplicate to original position.
      // AnyDuringMigration because:  Argument of type 'string | null' is not
      // assignable to parameter of type 'string'.
      let commentX =
          parseInt(xmlComment.getAttribute('x') as AnyDuringMigration, 10);
      // AnyDuringMigration because:  Argument of type 'string | null' is not
      // assignable to parameter of type 'string'.
      let commentY =
          parseInt(xmlComment.getAttribute('y') as AnyDuringMigration, 10);
      if (!isNaN(commentX) && !isNaN(commentY)) {
        if (this.RTL) {
          commentX = -commentX;
        }
        // Offset workspace comment.
        // TODO (#1719): Properly offset comment such that it's not interfering
        // with any blocks.
        commentX += 50;
        commentY += 50;
        comment.moveBy(commentX, commentY);
      }
    } finally {
      eventUtils.enable();
    }
    if (eventUtils.isEnabled()) {
      // AnyDuringMigration because:  Property 'get' does not exist on type
      // '(name: string) => void'.
      WorkspaceComment.fireCreateEvent(comment);
    }
    comment.select();
    return comment;
  }

  /**
   * Refresh the toolbox unless there's a drag in progress.
   * @internal
   */
  refreshToolboxSelection() {
    const ws = this.isFlyout ? this.targetWorkspace : this;
    if (ws && !ws.currentGesture_ && ws.toolbox_ && ws.toolbox_.getFlyout()) {
      ws.toolbox_.refreshSelection();
    }
  }

  /**
   * Rename a variable by updating its name in the variable map.  Update the
   *     flyout to show the renamed variable immediately.
   * @param id ID of the variable to rename.
   * @param newName New variable name.
   */
  override renameVariableById(id: string, newName: string) {
    super.renameVariableById(id, newName);
    this.refreshToolboxSelection();
  }

  /**
   * Delete a variable by the passed in ID.   Update the flyout to show
   *     immediately that the variable is deleted.
   * @param id ID of variable to delete.
   */
  override deleteVariableById(id: string) {
    super.deleteVariableById(id);
    this.refreshToolboxSelection();
  }

  /**
   * Create a new variable with the given name.  Update the flyout to show the
   *     new variable immediately.
   * @param name The new variable's name.
   * @param opt_type The type of the variable like 'int' or 'string'.
   *     Does not need to be unique. Field_variable can filter variables based
   * on their type. This will default to '' which is a specific type.
   * @param opt_id The unique ID of the variable. This will default to a UUID.
   * @return The newly created variable.
   */
  override createVariable(
      name: string, opt_type?: string|null,
      opt_id?: string|null): VariableModel {
    const newVar = super.createVariable(name, opt_type, opt_id);
    this.refreshToolboxSelection();
    return newVar;
  }

  /**
   * Make a list of all the delete areas for this workspace.
   * @deprecated Use workspace.recordDragTargets. (2021 June)
   */
  recordDeleteAreas() {
    // AnyDuringMigration because:  Property 'warn' does not exist on type
    // 'void'.
    (utils.deprecation as AnyDuringMigration)
        .warn(
            'WorkspaceSvg.prototype.recordDeleteAreas', 'June 2021',
            'June 2022', 'WorkspaceSvg.prototype.recordDragTargets');
    this.recordDragTargets();
  }

  /** Make a list of all the delete areas for this workspace. */
  recordDragTargets() {
    const dragTargets = this.componentManager_.getComponents(
        ComponentManager.Capability.DRAG_TARGET, true);

    this.dragTargetAreas_ = [];
    for (let i = 0, targetArea; targetArea = dragTargets[i]; i++) {
      const rect = targetArea.getClientRect();
      if (rect) {
        this.dragTargetAreas_.push({
          component: targetArea,
          clientRect: rect,
        });
      }
    }
  }

  /**
   * Obtain a newly created block.
   * @param prototypeName Name of the language object containing type-specific
   *     functions for this block.
   * @param opt_id Optional ID.  Use this ID if provided, otherwise create a new
   *     ID.
   * @return The created block.
   */
  override newBlock(prototypeName: string, opt_id?: string): BlockSvg {
    return new BlockSvg(this, prototypeName, opt_id);
  }

  /**
   * Returns the drag target the mouse event is over.
   * @param e Mouse move event.
   * @return Null if not over a drag target, or the drag target the event is
   *     over.
   */
  getDragTarget(e: Event): IDragTarget|null {
    for (let i = 0, targetArea; targetArea = this.dragTargetAreas_[i]; i++) {
      // AnyDuringMigration because:  Property 'clientY' does not exist on
      // type 'Event'. AnyDuringMigration because:  Property 'clientX' does
      // not exist on type 'Event'.
      if (targetArea.clientRect.contains(
              (e as AnyDuringMigration).clientX,
              (e as AnyDuringMigration).clientY)) {
        return targetArea.component;
      }
    }
    return null;
  }

  /**
   * Handle a mouse-down on SVG drawing surface.
   * @param e Mouse down event.
   */
  private onMouseDown_(e: Event) {
    const gesture = this.getGesture(e);
    if (gesture) {
      gesture.handleWsStart(e, this);
    }
  }

  /**
   * Start tracking a drag of an object on this workspace.
   * @param e Mouse down event.
   * @param xy Starting location of object.
   */
  startDrag(e: Event, xy: Coordinate) {
    // Record the starting offset between the bubble's location and the mouse.
    const point = browserEvents.mouseToSvg(
        e, this.getParentSvg(), this.getInverseScreenCTM());
    // Fix scale of mouse event.
    point.x /= this.scale;
    point.y /= this.scale;
    this.dragDeltaXY_ = Coordinate.difference(xy, point);
  }

  /**
   * Track a drag of an object on this workspace.
   * @param e Mouse move event.
   * @return New location of object.
   */
  moveDrag(e: Event): Coordinate {
    const point = browserEvents.mouseToSvg(
        e, this.getParentSvg(), this.getInverseScreenCTM());
    // Fix scale of mouse event.
    point.x /= this.scale;
    point.y /= this.scale;
    return Coordinate.sum((this.dragDeltaXY_), point);
  }

  /**
   * Is the user currently dragging a block or scrolling the flyout/workspace?
   * @return True if currently dragging or scrolling.
   */
  isDragging(): boolean {
    return this.currentGesture_ !== null && this.currentGesture_.isDragging();
  }

  /**
   * Is this workspace draggable?
   * @return True if this workspace may be dragged.
   */
  isDraggable(): boolean {
    return this.options.moveOptions && this.options.moveOptions.drag;
  }

  /**
   * Is this workspace movable?
   *
   * This means the user can reposition the X Y coordinates of the workspace
   * through input. This can be through scrollbars, scroll wheel, dragging, or
   * through zooming with the scroll wheel or pinch (since the zoom is centered
   * on the mouse position). This does not include zooming with the zoom
   * controls since the X Y coordinates are decided programmatically.
   * @return True if the workspace is movable, false otherwise.
   */
  isMovable(): boolean {
    return this.options.moveOptions && !!this.options.moveOptions.scrollbars ||
        this.options.moveOptions && this.options.moveOptions.wheel ||
        this.options.moveOptions && this.options.moveOptions.drag ||
        this.options.zoomOptions && this.options.zoomOptions.wheel ||
        this.options.zoomOptions && this.options.zoomOptions.pinch;
  }

  /**
   * Is this workspace movable horizontally?
   * @return True if the workspace is movable horizontally, false otherwise.
   */
  isMovableHorizontally(): boolean {
    const hasScrollbars = !!this.scrollbar;
    return this.isMovable() &&
        (!hasScrollbars ||
         hasScrollbars && this.scrollbar.canScrollHorizontally());
  }

  /**
   * Is this workspace movable vertically?
   * @return True if the workspace is movable vertically, false otherwise.
   */
  isMovableVertically(): boolean {
    const hasScrollbars = !!this.scrollbar;
    return this.isMovable() &&
        (!hasScrollbars ||
         hasScrollbars && this.scrollbar.canScrollVertically());
  }

  /**
   * Handle a mouse-wheel on SVG drawing surface.
   * @param e Mouse wheel event.
   */
  private onMouseWheel_(e: WheelEvent) {
    // Don't scroll or zoom anything if drag is in progress.
    if (Gesture.inProgress()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const canWheelZoom =
        this.options.zoomOptions && this.options.zoomOptions.wheel;
    const canWheelMove =
        this.options.moveOptions && this.options.moveOptions.wheel;
    if (!canWheelZoom && !canWheelMove) {
      return;
    }

    const scrollDelta = browserEvents.getScrollDeltaPixels(e);

    // Zoom should also be enabled by the command key on Mac devices,
    // but not super on Unix.
    let commandKey;
    if (userAgent.MAC) {
      commandKey = e.metaKey;
    }

    if (canWheelZoom && (e.ctrlKey || commandKey || !canWheelMove)) {
      // Zoom.
      // The vertical scroll distance that corresponds to a click of a zoom
      // button.
      const PIXELS_PER_ZOOM_STEP = 50;
      const delta = -scrollDelta.y / PIXELS_PER_ZOOM_STEP;
      const position = browserEvents.mouseToSvg(
          e, this.getParentSvg(), this.getInverseScreenCTM());
      this.zoom(position.x, position.y, delta);
    } else {
      // Scroll.
      let x = this.scrollX - scrollDelta.x;
      let y = this.scrollY - scrollDelta.y;

      if (e.shiftKey && !scrollDelta.x) {
        // Scroll horizontally (based on vertical scroll delta).
        // This is needed as for some browser/system combinations which do not
        // set deltaX.
        x = this.scrollX - scrollDelta.y;
        y = this.scrollY;
      }
      // Don't scroll vertically.
      this.scroll(x, y);
    }
    e.preventDefault();
  }

  /**
   * Calculate the bounding box for the blocks on the workspace.
   * Coordinate system: workspace coordinates.
   *
   * @return Contains the position and size of the bounding box containing the
   *     blocks on the workspace.
   */
  getBlocksBoundingBox(): Rect {
    const topElements = this.getTopBoundedElements();
    // There are no blocks, return empty rectangle.
    if (!topElements.length) {
      return new Rect(0, 0, 0, 0);
    }

    // Initialize boundary using the first block.
    const boundary = topElements[0].getBoundingRectangle();

    // Start at 1 since the 0th block was used for initialization.
    for (let i = 1; i < topElements.length; i++) {
      const topElement = topElements[i];
      if (topElement instanceof BlockSvg && topElement.isInsertionMarker()) {
        continue;
      }
      const blockBoundary = topElement.getBoundingRectangle();
      if (blockBoundary.top < boundary.top) {
        boundary.top = blockBoundary.top;
      }
      if (blockBoundary.bottom > boundary.bottom) {
        boundary.bottom = blockBoundary.bottom;
      }
      if (blockBoundary.left < boundary.left) {
        boundary.left = blockBoundary.left;
      }
      if (blockBoundary.right > boundary.right) {
        boundary.right = blockBoundary.right;
      }
    }
    return boundary;
  }

  /** Clean up the workspace by ordering all the blocks in a column. */
  cleanUp() {
    this.setResizesEnabled(false);
    eventUtils.setGroup(true);
    const topBlocks = this.getTopBlocks(true);
    let cursorY = 0;
    for (let i = 0, block; block = topBlocks[i]; i++) {
      if (!block.isMovable()) {
        continue;
      }
      const xy = block.getRelativeToSurfaceXY();
      block.moveBy(-xy.x, cursorY - xy.y);
      block.snapToGrid();
      cursorY = block.getRelativeToSurfaceXY().y +
          block.getHeightWidth().height +
          this.renderer_.getConstants().MIN_BLOCK_HEIGHT;
    }
    eventUtils.setGroup(false);
    this.setResizesEnabled(true);
  }

  /**
   * Show the context menu for the workspace.
   * @param e Mouse event.
   * @internal
   */
  showContextMenu(e: Event) {
    if (this.options.readOnly || this.isFlyout) {
      return;
    }
    // AnyDuringMigration because:  Argument of type '{ workspace: this; }' is
    // not assignable to parameter of type 'Scope'.
    const menuOptions = ContextMenuRegistry.registry.getContextMenuOptions(
        ContextMenuRegistry.ScopeType.WORKSPACE,
        {workspace: this} as AnyDuringMigration);

    // Allow the developer to add or modify menuOptions.
    if (this.configureContextMenu) {
      this.configureContextMenu(menuOptions, e);
    }

    ContextMenu.show(e, menuOptions, this.RTL);
  }

  /**
   * Modify the block tree on the existing toolbox.
   * @param toolboxDef DOM tree of toolbox contents, string of toolbox contents,
   *     or JSON representing toolbox definition.
   */
  updateToolbox(toolboxDef: toolbox.ToolboxDefinition|null) {
    const parsedToolboxDef = toolbox.convertToolboxDefToJson(toolboxDef);

    if (!parsedToolboxDef) {
      if (this.options.languageTree) {
        throw Error('Can\'t nullify an existing toolbox.');
      }
      return;
    }
    // No change (null to null).
    if (!this.options.languageTree) {
      throw Error('Existing toolbox is null.  Can\'t create new toolbox.');
    }

    if (toolbox.hasCategories(parsedToolboxDef)) {
      if (!this.toolbox_) {
        throw Error('Existing toolbox has no categories.  Can\'t change mode.');
      }
      this.options.languageTree = parsedToolboxDef;
      this.toolbox_.render(parsedToolboxDef);
    } else {
      if (!this.flyout_) {
        throw Error('Existing toolbox has categories.  Can\'t change mode.');
      }
      this.options.languageTree = parsedToolboxDef;
      this.flyout_.show(parsedToolboxDef);
    }
  }

  /** Mark this workspace as the currently focused main workspace. */
  markFocused() {
    if (this.options.parentWorkspace) {
      this.options.parentWorkspace.markFocused();
    } else {
      // AnyDuringMigration because:  Argument of type 'this' is not assignable
      // to parameter of type 'Workspace'.
      common.setMainWorkspace(this as AnyDuringMigration);
      // We call e.preventDefault in many event handlers which means we
      // need to explicitly grab focus (e.g from a textarea) because
      // the browser will not do it for us.  How to do this is browser
      // dependent.
      this.setBrowserFocus();
    }
  }

  /** Set the workspace to have focus in the browser. */
  private setBrowserFocus() {
    // Blur whatever was focused since explicitly grabbing focus below does not
    // work in Edge.
    // In IE, SVGs can't be blurred or focused. Check to make sure the current
    // focus can be blurred before doing so.
    // See https://github.com/google/blockly/issues/4440
    // AnyDuringMigration because:  Property 'blur' does not exist on type
    // 'Element'.
    if (document.activeElement &&
        (document.activeElement as AnyDuringMigration).blur) {
      // AnyDuringMigration because:  Property 'blur' does not exist on type
      // 'Element'.
      (document.activeElement as AnyDuringMigration).blur();
    }
    try {
      // Focus the workspace SVG - this is for Chrome and Firefox.
      this.getParentSvg().focus({preventScroll: true});
    } catch (e) {
      // IE and Edge do not support focus on SVG elements. When that fails
      // above, get the injectionDiv (the workspace's parent) and focus that
      // instead.  This doesn't work in Chrome.
      try {
        // In IE11, use setActive (which is IE only) so the page doesn't scroll
        // to the workspace gaining focus.
        (this.getParentSvg().parentElement as AnyDuringMigration).setActive();
      } catch (e) {
        // setActive support was discontinued in Edge so when that fails, call
        // focus instead.
        this.getParentSvg().parentElement!.focus({preventScroll: true});
      }
    }
  }

  /**
   * Zooms the workspace in or out relative to/centered on the given (x, y)
   * coordinate.
   * @param x X coordinate of center, in pixel units relative to the top-left
   *     corner of the parentSVG.
   * @param y Y coordinate of center, in pixel units relative to the top-left
   *     corner of the parentSVG.
   * @param amount Amount of zooming. The formula for the new scale is newScale
   *     = currentScale * (scaleSpeed^amount). scaleSpeed is set in the
   *     workspace options. Negative amount values zoom out, and positive amount
   *     values zoom in.
   */
  zoom(x: number, y: number, amount: number) {
    // Scale factor.
    const speed = this.options.zoomOptions.scaleSpeed;
    let scaleChange = Math.pow(speed, amount);
    const newScale = this.scale * scaleChange;
    if (this.scale === newScale) {
      return;
    }
    // No change in zoom.

    // Clamp scale within valid range.
    if (newScale > this.options.zoomOptions.maxScale) {
      scaleChange = this.options.zoomOptions.maxScale / this.scale;
    } else if (newScale < this.options.zoomOptions.minScale) {
      scaleChange = this.options.zoomOptions.minScale / this.scale;
    }

    // Transform the x/y coordinates from the parentSVG's space into the
    // canvas' space, so that they are in workspace units relative to the top
    // left of the visible portion of the workspace.
    let matrix = this.getCanvas().getCTM();
    let center = (this.getParentSvg()).createSVGPoint();
    center.x = x;
    center.y = y;
    center = center.matrixTransform(matrix!.inverse());
    x = center.x;
    y = center.y;

    // Find the new scrollX/scrollY so that the center remains in the same
    // position (relative to the center) after we zoom.
    // newScale and matrix.a should be identical (within a rounding error).
    matrix = matrix!.translate(x * (1 - scaleChange), y * (1 - scaleChange))
                 .scale(scaleChange);
    // scrollX and scrollY are in pixels.
    // The scrollX and scrollY still need to have absoluteLeft and absoluteTop
    // subtracted from them, but we'll leave that for setScale so that they're
    // correctly updated for the new flyout size if we have a simple toolbox.
    this.scrollX = matrix.e;
    this.scrollY = matrix.f;
    this.setScale(newScale);
  }

  /**
   * Zooming the blocks centered in the center of view with zooming in or out.
   * @param type Type of zooming (-1 zooming out and 1 zooming in).
   */
  zoomCenter(type: number) {
    const metrics = this.getMetrics();
    let x;
    let y;
    if (this.flyout_) {
      // If you want blocks in the center of the view (visible portion of the
      // workspace) to stay centered when the size of the view decreases (i.e.
      // when the size of the flyout increases) you need the center of the
      // *blockly div* to stay in the same pixel-position.
      // Note: This only works because of how scrollCenter positions blocks.
      x = metrics.svgWidth ? metrics.svgWidth / 2 : 0;
      y = metrics.svgHeight ? metrics.svgHeight / 2 : 0;
    } else {
      x = metrics.viewWidth / 2 + metrics.absoluteLeft;
      y = metrics.viewHeight / 2 + metrics.absoluteTop;
    }
    this.zoom(x, y, type);
  }

  /** Zoom the blocks to fit in the workspace if possible. */
  zoomToFit() {
    if (!this.isMovable()) {
      console.warn(
          'Tried to move a non-movable workspace. This could result' +
          ' in blocks becoming inaccessible.');
      return;
    }

    const metrics = this.getMetrics();
    let workspaceWidth = metrics.viewWidth;
    let workspaceHeight = metrics.viewHeight;
    const blocksBox = this.getBlocksBoundingBox();
    const doubleMargin = ZOOM_TO_FIT_MARGIN * 2;
    let blocksWidth = blocksBox.right - blocksBox.left + doubleMargin;
    let blocksHeight = blocksBox.bottom - blocksBox.top + doubleMargin;
    if (!blocksWidth) {
      return;
    }
    // Prevents zooming to infinity.
    if (this.flyout_) {
      // We have to add the flyout size to both the workspace size and the
      // block size because the blocks we want to resize include the blocks in
      // the flyout, and the area we want to fit them includes the portion of
      // the workspace that is behind the flyout.
      if (this.horizontalLayout) {
        workspaceHeight += this.flyout_.getHeight();
        // Convert from pixels to workspace coordinates.
        blocksHeight += this.flyout_.getHeight() / this.scale;
      } else {
        workspaceWidth += this.flyout_.getWidth();
        // Convert from pixels to workspace coordinates.
        blocksWidth += this.flyout_.getWidth() / this.scale;
      }
    }

    // Scale Units: (pixels / workspaceUnit)
    const ratioX = workspaceWidth / blocksWidth;
    const ratioY = workspaceHeight / blocksHeight;
    eventUtils.disable();
    try {
      this.setScale(Math.min(ratioX, ratioY));
      this.scrollCenter();
    } finally {
      eventUtils.enable();
    }
    this.maybeFireViewportChangeEvent();
  }

  /**
   * Add a transition class to the block and bubble canvas, to animate any
   * transform changes.
   * @internal
   */
  beginCanvasTransition() {
    dom.addClass((this.svgBlockCanvas_), 'blocklyCanvasTransitioning');
    dom.addClass((this.svgBubbleCanvas_), 'blocklyCanvasTransitioning');
  }

  /**
   * Remove transition class from the block and bubble canvas.
   * @internal
   */
  endCanvasTransition() {
    dom.removeClass((this.svgBlockCanvas_), 'blocklyCanvasTransitioning');
    dom.removeClass((this.svgBubbleCanvas_), 'blocklyCanvasTransitioning');
  }

  /** Center the workspace. */
  scrollCenter() {
    if (!this.isMovable()) {
      console.warn(
          'Tried to move a non-movable workspace. This could result' +
          ' in blocks becoming inaccessible.');
      return;
    }

    const metrics = this.getMetrics();
    let x = (metrics.scrollWidth - metrics.viewWidth) / 2;
    let y = (metrics.scrollHeight - metrics.viewHeight) / 2;

    // Convert from workspace directions to canvas directions.
    x = -x - metrics.scrollLeft;
    y = -y - metrics.scrollTop;
    this.scroll(x, y);
  }

  /**
   * Scroll the workspace to center on the given block. If the block has other
   * blocks stacked below it, the workspace will be centered on the stack.
   * @param id ID of block center on.
   */
  centerOnBlock(id: string|null) {
    if (!this.isMovable()) {
      console.warn(
          'Tried to move a non-movable workspace. This could result' +
          ' in blocks becoming inaccessible.');
      return;
    }

    const block = id ? this.getBlockById(id) : null;
    if (!block) {
      return;
    }

    // XY is in workspace coordinates.
    const xy = block.getRelativeToSurfaceXY();
    // Height/width is in workspace units.
    const heightWidth = block.getHeightWidth();

    // Find the enter of the block in workspace units.
    const blockCenterY = xy.y + heightWidth.height / 2;

    // In RTL the block's position is the top right of the block, not top left.
    const multiplier = this.RTL ? -1 : 1;
    const blockCenterX = xy.x + multiplier * heightWidth.width / 2;

    // Workspace scale, used to convert from workspace coordinates to pixels.
    const scale = this.scale;

    // Center of block in pixels, relative to workspace origin (center 0,0).
    // Scrolling to here would put the block in the top-left corner of the
    // visible workspace.
    const pixelX = blockCenterX * scale;
    const pixelY = blockCenterY * scale;

    const metrics = this.getMetrics();

    // viewHeight and viewWidth are in pixels.
    const halfViewWidth = metrics.viewWidth / 2;
    const halfViewHeight = metrics.viewHeight / 2;

    // Put the block in the center of the visible workspace instead.
    const scrollToCenterX = pixelX - halfViewWidth;
    const scrollToCenterY = pixelY - halfViewHeight;

    // Convert from workspace directions to canvas directions.
    const x = -scrollToCenterX;
    const y = -scrollToCenterY;

    this.scroll(x, y);
  }

  /**
   * Set the workspace's zoom factor.
   * @param newScale Zoom factor. Units: (pixels / workspaceUnit).
   */
  setScale(newScale: number) {
    if (this.options.zoomOptions.maxScale &&
        newScale > this.options.zoomOptions.maxScale) {
      newScale = this.options.zoomOptions.maxScale;
    } else if (
        this.options.zoomOptions.minScale &&
        newScale < this.options.zoomOptions.minScale) {
      newScale = this.options.zoomOptions.minScale;
    }
    this.scale = newScale;

    this.hideChaff(false);
    // Get the flyout, if any, whether our own or owned by the toolbox.
    const flyout = this.getFlyout(false);
    if (flyout && flyout.isVisible()) {
      flyout.reflow();
      this.recordDragTargets();
    }
    if (this.grid_) {
      this.grid_.update(this.scale);
    }

    // We call scroll instead of scrollbar.resize() so that we can center the
    // zoom correctly without scrollbars, but scroll does not resize the
    // scrollbars so we have to call resizeView/resizeContent as well.
    const metrics = this.getMetrics();

    this.scrollX -= metrics.absoluteLeft;
    this.scrollY -= metrics.absoluteTop;
    // The scroll values and the view values are additive inverses of
    // each other, so when we subtract from one we have to add to the other.
    metrics.viewLeft += metrics.absoluteLeft;
    metrics.viewTop += metrics.absoluteTop;

    this.scroll(this.scrollX, this.scrollY);
    if (this.scrollbar) {
      if (this.flyout_) {
        this.scrollbar.resizeView(metrics);
      } else {
        this.scrollbar.resizeContent(metrics);
      }
    }
  }

  /**
   * Get the workspace's zoom factor.  If the workspace has a parent, we call
   * into the parent to get the workspace scale.
   * @return The workspace zoom factor. Units: (pixels / workspaceUnit).
   */
  getScale(): number {
    if (this.options.parentWorkspace) {
      return this.options.parentWorkspace.getScale();
    }
    return this.scale;
  }

  /**
   * Scroll the workspace to a specified offset (in pixels), keeping in the
   * workspace bounds. See comment on workspaceSvg.scrollX for more detail on
   * the meaning of these values.
   * @param x Target X to scroll to.
   * @param y Target Y to scroll to.
   * @internal
   */
  scroll(x: number, y: number) {
    this.hideChaff(/* opt_onlyClosePopups= */
                   true);

    // Keep scrolling within the bounds of the content.
    const metrics = this.getMetrics();
    // Canvas coordinates (aka scroll coordinates) have inverse directionality
    // to workspace coordinates so we have to inverse them.
    x = Math.min(x, -metrics.scrollLeft);
    y = Math.min(y, -metrics.scrollTop);
    const maxXDisplacement =
        Math.max(0, metrics.scrollWidth - metrics.viewWidth);
    const maxXScroll = metrics.scrollLeft + maxXDisplacement;
    const maxYDisplacement =
        Math.max(0, metrics.scrollHeight - metrics.viewHeight);
    const maxYScroll = metrics.scrollTop + maxYDisplacement;
    x = Math.max(x, -maxXScroll);
    y = Math.max(y, -maxYScroll);
    this.scrollX = x;
    this.scrollY = y;

    if (this.scrollbar) {
      // The content position (displacement from the content's top-left to the
      // origin) plus the scroll position (displacement from the view's top-left
      // to the origin) gives us the distance from the view's top-left to the
      // content's top-left. Then we negate this so we get the displacement from
      // the content's top-left to the view's top-left, matching the
      // directionality of the scrollbars.
      this.scrollbar.set(
          -(x + metrics.scrollLeft), -(y + metrics.scrollTop), false);
    }
    // We have to shift the translation so that when the canvas is at 0, 0 the
    // workspace origin is not underneath the toolbox.
    x += metrics.absoluteLeft;
    y += metrics.absoluteTop;
    this.translate(x, y);
  }

  /**
   * Find the block on this workspace with the specified ID.
   * @param id ID of block to find.
   * @return The sought after block, or null if not found.
   */
  override getBlockById(id: string): BlockSvg|null {
    return super.getBlockById(id) as BlockSvg;
  }

  /**
   * Find all blocks in workspace.  Blocks are optionally sorted
   * by position; top to bottom (with slight LTR or RTL bias).
   * @param ordered Sort the list if true.
   * @return Array of blocks.
   */
  override getAllBlocks(ordered: boolean): BlockSvg[] {
    return super.getAllBlocks(ordered) as BlockSvg[];
  }

  /**
   * Finds the top-level blocks and returns them.  Blocks are optionally sorted
   * by position; top to bottom (with slight LTR or RTL bias).
   * @param ordered Sort the list if true.
   * @return The top-level block objects.
   */
  override getTopBlocks(ordered: boolean): BlockSvg[] {
    return super.getTopBlocks(ordered) as BlockSvg[];
  }

  /**
   * Adds a block to the list of top blocks.
   * @param block Block to add.
   */
  override addTopBlock(block: Block) {
    this.addTopBoundedElement(block as BlockSvg);
    super.addTopBlock(block);
  }

  /**
   * Removes a block from the list of top blocks.
   * @param block Block to remove.
   */
  override removeTopBlock(block: Block) {
    this.removeTopBoundedElement(block as BlockSvg);
    super.removeTopBlock(block);
  }

  /**
   * Adds a comment to the list of top comments.
   * @param comment comment to add.
   */
  override addTopComment(comment: WorkspaceComment) {
    this.addTopBoundedElement(comment as WorkspaceCommentSvg);
    super.addTopComment(comment);
  }

  /**
   * Removes a comment from the list of top comments.
   * @param comment comment to remove.
   */
  override removeTopComment(comment: WorkspaceComment) {
    this.removeTopBoundedElement(comment as WorkspaceCommentSvg);
    super.removeTopComment(comment);
  }

  /**
   * Adds a bounded element to the list of top bounded elements.
   * @param element Bounded element to add.
   */
  addTopBoundedElement(element: IBoundedElement) {
    this.topBoundedElements_.push(element);
  }

  /**
   * Removes a bounded element from the list of top bounded elements.
   * @param element Bounded element to remove.
   */
  removeTopBoundedElement(element: IBoundedElement) {
    arrayUtils.removeElem(this.topBoundedElements_, element);
  }

  /**
   * Finds the top-level bounded elements and returns them.
   * @return The top-level bounded elements.
   */
  getTopBoundedElements(): IBoundedElement[] {
    return (new Array<IBoundedElement>()).concat(this.topBoundedElements_);
  }

  /**
   * Update whether this workspace has resizes enabled.
   * If enabled, workspace will resize when appropriate.
   * If disabled, workspace will not resize until re-enabled.
   * Use to avoid resizing during a batch operation, for performance.
   * @param enabled Whether resizes should be enabled.
   */
  setResizesEnabled(enabled: boolean) {
    const reenabled = !this.resizesEnabled_ && enabled;
    this.resizesEnabled_ = enabled;
    if (reenabled) {
      // Newly enabled.  Trigger a resize.
      this.resizeContents();
    }
  }

  /**
   * Dispose of all blocks in workspace, with an optimization to prevent
   * resizes.
   */
  override clear() {
    this.setResizesEnabled(false);
    super.clear();
    this.topBoundedElements_ = [];
    this.setResizesEnabled(true);
  }

  /**
   * Register a callback function associated with a given key, for clicks on
   * buttons and labels in the flyout.
   * For instance, a button specified by the XML
   * <button text="create variable" callbackKey="CREATE_VARIABLE"></button>
   * should be matched by a call to
   * registerButtonCallback("CREATE_VARIABLE", yourCallbackFunction).
   * @param key The name to use to look up this function.
   * @param func The function to call when the given button is clicked.
   */
  registerButtonCallback(
      key: string, func: (p1: FlyoutButton) => AnyDuringMigration) {
    if (typeof func !== 'function') {
      throw TypeError('Button callbacks must be functions.');
    }
    this.flyoutButtonCallbacks_[key] = func;
  }

  /**
   * Get the callback function associated with a given key, for clicks on
   * buttons and labels in the flyout.
   * @param key The name to use to look up the function.
   * @return The function corresponding to the given key for this workspace;
   *     null if no callback is registered.
   */
  getButtonCallback(key: string):
      ((p1: FlyoutButton) => AnyDuringMigration)|null {
    const result = this.flyoutButtonCallbacks_[key];
    return result ? result : null;
  }

  /**
   * Remove a callback for a click on a button in the flyout.
   * @param key The name associated with the callback function.
   */
  removeButtonCallback(key: string) {
    this.flyoutButtonCallbacks_[key] = null;
  }

  /**
   * Register a callback function associated with a given key, for populating
   * custom toolbox categories in this workspace.  See the variable and
   * procedure categories as an example.
   * @param key The name to use to look up this function.
   * @param func The function to call when the given toolbox category is opened.
   */
  registerToolboxCategoryCallback(
      key: string, func: (p1: WorkspaceSvg) => toolbox.FlyoutDefinition) {
    if (typeof func !== 'function') {
      throw TypeError('Toolbox category callbacks must be functions.');
    }
    this.toolboxCategoryCallbacks_[key] = func;
  }

  /**
   * Get the callback function associated with a given key, for populating
   * custom toolbox categories in this workspace.
   * @param key The name to use to look up the function.
   * @return The function corresponding to the given key for this workspace, or
   *     null if no function is registered.
   */
  getToolboxCategoryCallback(key: string):
      ((p1: WorkspaceSvg) => toolbox.FlyoutDefinition)|null {
    return this.toolboxCategoryCallbacks_[key] || null;
  }

  /**
   * Remove a callback for a click on a custom category's name in the toolbox.
   * @param key The name associated with the callback function.
   */
  removeToolboxCategoryCallback(key: string) {
    this.toolboxCategoryCallbacks_[key] = null;
  }

  /**
   * Look up the gesture that is tracking this touch stream on this workspace.
   * May create a new gesture.
   * @param e Mouse event or touch event.
   * @return The gesture that is tracking this touch stream, or null if no valid
   *     gesture exists.
   * @internal
   */
  getGesture(e: Event): TouchGesture|null {
    const isStart = e.type === 'mousedown' || e.type === 'touchstart' ||
        e.type === 'pointerdown';

    const gesture = this.currentGesture_;
    if (gesture) {
      if (isStart && gesture.hasStarted()) {
        console.warn('Tried to start the same gesture twice.');
        // That's funny.  We must have missed a mouse up.
        // Cancel it, rather than try to retrieve all of the state we need.
        gesture.cancel();
        return null;
      }
      return gesture;
    }

    // No gesture existed on this workspace, but this looks like the start of a
    // new gesture.
    if (isStart) {
      this.currentGesture_ = new TouchGesture(e, this);
      return this.currentGesture_;
    }
    // No gesture existed and this event couldn't be the start of a new gesture.
    return null;
  }

  /**
   * Clear the reference to the current gesture.
   * @internal
   */
  clearGesture() {
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'TouchGesture'.
    this.currentGesture_ = null as AnyDuringMigration;
  }

  /**
   * Cancel the current gesture, if one exists.
   * @internal
   */
  cancelCurrentGesture() {
    if (this.currentGesture_) {
      this.currentGesture_.cancel();
    }
  }

  /**
   * Get the audio manager for this workspace.
   * @return The audio manager for this workspace.
   */
  getAudioManager(): WorkspaceAudio {
    return this.audioManager_;
  }

  /**
   * Get the grid object for this workspace, or null if there is none.
   * @return The grid object for this workspace.
   * @internal
   */
  getGrid(): Grid|null {
    return this.grid_;
  }

  /**
   * Close tooltips, context menus, dropdown selections, etc.
   * @param opt_onlyClosePopups Whether only popups should be closed.
   */
  hideChaff(opt_onlyClosePopups?: boolean) {
    Tooltip.hide();
    WidgetDiv.hide();
    dropDownDiv.hideWithoutAnimation();

    const onlyClosePopups = !!opt_onlyClosePopups;
    const autoHideables = this.getComponentManager().getComponents(
        ComponentManager.Capability.AUTOHIDEABLE, true);
    autoHideables.forEach(
        (autoHideable) => autoHideable.autoHide(onlyClosePopups));
  }

  /**
   * Sets the X/Y translations of a top level workspace.
   * @param xyRatio Contains an x and/or y property which is a float between 0
   *     and 1 specifying the degree of scrolling.
   */
  private static setTopLevelWorkspaceMetrics_(
      this: WorkspaceSvg, xyRatio: AnyDuringMigration) {
    const metrics = this.getMetrics();

    if (typeof xyRatio.x === 'number') {
      this.scrollX =
          -(metrics.scrollLeft +
            (metrics.scrollWidth - metrics.viewWidth) * xyRatio.x);
    }
    if (typeof xyRatio.y === 'number') {
      this.scrollY =
          -(metrics.scrollTop +
            (metrics.scrollHeight - metrics.viewHeight) * xyRatio.y);
    }
    // We have to shift the translation so that when the canvas is at 0, 0 the
    // workspace origin is not underneath the toolbox.
    const x = this.scrollX + metrics.absoluteLeft;
    const y = this.scrollY + metrics.absoluteTop;
    // We could call scroll here, but that has extra checks we don't need to do.
    this.translate(x, y);
  }
}

/**
 * Size the workspace when the contents change.  This also updates
 * scrollbars accordingly.
 * @param workspace The workspace to resize.
 * @alias Blockly.WorkspaceSvg.resizeSvgContents
 * @internal
 */
export function resizeSvgContents(workspace: WorkspaceSvg) {
  workspace.resizeContents();
}
