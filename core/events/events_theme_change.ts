/** @fileoverview Events fired as a result of a theme update. */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Events fired as a result of a theme update.
 * @class
 */

import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a theme change event.
 * @alias Blockly.Events.ThemeChange
 */
export class ThemeChange extends UiBase {
  themeName?: string;
  override type: string;

  /**
   * @param opt_themeName The theme name. Undefined for a blank event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    event. Undefined for a blank event.
   */
  constructor(opt_themeName?: string, opt_workspaceId?: string) {
    super(opt_workspaceId);

    /** The theme name. */
    this.themeName = opt_themeName;

    /** Type of this event. */
    this.type = eventUtils.THEME_CHANGE;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['themeName'] = this.themeName;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.themeName = json['themeName'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.THEME_CHANGE, ThemeChange);
