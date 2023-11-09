/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {RenderedConnection} from '../rendered_connection';

/**
 * Visually highlights connections, usually to preview where a block will be
 * connected if it is dropped.
 *
 * Often implemented by IPathObject classes.
 */
export interface IConnectionHighlighter {
  /** Visually highlights the given connection. */
  highlightConnection(conn: RenderedConnection): void;

  /** Visually unhighlights the given connnection (if it was highlighted). */
  unhighlightConnection(conn: RenderedConnection): void;
}
