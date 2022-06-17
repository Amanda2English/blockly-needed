/** @fileoverview The class representing a theme. */

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * The class representing a theme.
 * @class
 */

import * as registry from './registry.js';
import * as object from './utils/object.js';


/**
 * Class for a theme.
 * @alias Blockly.Theme
 */
export class Theme {
  blockStyles: {[key: string]: BlockStyle};
  categoryStyles: {[key: string]: CategoryStyle};
  componentStyles: ComponentStyle;
  fontStyle: FontStyle;

  /**
   * Whether or not to add a 'hat' on top of all blocks with no previous or
   * output connections.
   */
  startHats: boolean|null = null;

  /**
   * @param name Theme name.
   * @param opt_blockStyles A map from style names (strings) to objects with
   *     style attributes for blocks.
   * @param opt_categoryStyles A map from style names (strings) to objects with
   *     style attributes for categories.
   * @param opt_componentStyles A map of Blockly component names to style value.
   */
  constructor(
      public name: string, opt_blockStyles?: {[key: string]: BlockStyle},
      opt_categoryStyles?: {[key: string]: CategoryStyle},
      opt_componentStyles?: ComponentStyle) {
    /** The block styles map. */
    this.blockStyles = opt_blockStyles || Object.create(null);

    /** The category styles map. */
    this.categoryStyles = opt_categoryStyles || Object.create(null);

    /** The UI components styles map. */
    this.componentStyles =
        opt_componentStyles || Object.create(null) as ComponentStyle;

    /** The font style. */
    this.fontStyle = Object.create(null) as FontStyle;

    // Register the theme by name.
    registry.register(registry.Type.THEME, name, this);
  }

  /**
   * Gets the class name that identifies this theme.
   * @return The CSS class name.
   */
  getClassName(): string {
    return this.name + '-theme';
  }

  /**
   * Overrides or adds a style to the blockStyles map.
   * @param blockStyleName The name of the block style.
   * @param blockStyle The block style.
   */
  setBlockStyle(blockStyleName: string, blockStyle: BlockStyle) {
    this.blockStyles[blockStyleName] = blockStyle;
  }

  /**
   * Overrides or adds a style to the categoryStyles map.
   * @param categoryStyleName The name of the category style.
   * @param categoryStyle The category style.
   */
  setCategoryStyle(categoryStyleName: string, categoryStyle: CategoryStyle) {
    this.categoryStyles[categoryStyleName] = categoryStyle;
  }

  /**
   * Gets the style for a given Blockly UI component.  If the style value is a
   * string, we attempt to find the value of any named references.
   * @param componentName The name of the component.
   * @return The style value.
   */
  getComponentStyle(componentName: string): string|null {
    const style = (this.componentStyles as AnyDuringMigration)[componentName];
    if (style && typeof style === 'string' && this.getComponentStyle((style))) {
      return this.getComponentStyle((style));
    }
    return style ? String(style) : null;
  }

  /**
   * Configure a specific Blockly UI component with a style value.
   * @param componentName The name of the component.
   * @param styleValue The style value.
   */
  setComponentStyle(componentName: string, styleValue: AnyDuringMigration) {
    (this.componentStyles as AnyDuringMigration)[componentName] = styleValue;
  }

  /**
   * Configure a theme's font style.
   * @param fontStyle The font style.
   */
  setFontStyle(fontStyle: FontStyle) {
    this.fontStyle = fontStyle;
  }

  /**
   * Configure a theme's start hats.
   * @param startHats True if the theme enables start hats, false otherwise.
   */
  setStartHats(startHats: boolean) {
    this.startHats = startHats;
  }

  /**
   * Define a new Blockly theme.
   * @param name The name of the theme.
   * @param themeObj An object containing theme properties.
   * @return A new Blockly theme.
   */
  static defineTheme(name: string, themeObj: AnyDuringMigration): Theme {
    const theme = new Theme(name);
    let base = themeObj['base'];
    if (base) {
      if (typeof base === 'string') {
        base = registry.getObject(registry.Type.THEME, base);
      }
      if (base instanceof Theme) {
        object.deepMerge(theme, base);
        theme.name = name;
      }
    }

    object.deepMerge(theme.blockStyles, themeObj['blockStyles']);
    object.deepMerge(theme.categoryStyles, themeObj['categoryStyles']);
    object.deepMerge(theme.componentStyles, themeObj['componentStyles']);
    object.deepMerge(theme.fontStyle, themeObj['fontStyle']);
    if (themeObj['startHats'] !== null) {
      theme.startHats = themeObj['startHats'];
    }

    return theme;
  }
}
export interface BlockStyle {
  colourPrimary: string;
  colourSecondary: string;
  colourTertiary: string;
  hat?: string;
}
export interface CategoryStyle {
  colour: string;
}
export interface ComponentStyle {
  workspaceBackgroundColour: string|null;
  toolboxBackgroundColour: string|null;
  toolboxForegroundColour: string|null;
  flyoutBackgroundColour: string|null;
  flyoutForegroundColour: string|null;
  flyoutOpacity: number|null;
  scrollbarColour: string|null;
  scrollbarOpacity: number|null;
  insertionMarkerColour: string|null;
  insertionMarkerOpacity: number|null;
  markerColour: string|null;
  cursorColour: string|null;
  selectedGlowColour: string|null;
  selectedGlowOpacity: number|null;
  replacementGlowColour: string|null;
  replacementGlowOpacity: number|null;
}
export interface FontStyle {
  family: string|null;
  weight: string|null;
  size: number|null;
}
