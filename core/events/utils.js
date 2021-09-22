/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helpers methods for events that are fired as a result of
 * actions in Blockly's editor.
 */
'use strict';

goog.module('Blockly.Events.utils');

const Abstract = goog.requireType('Blockly.Events.Abstract');
const Block = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const Workspace = goog.requireType('Blockly.Workspace');
const deprecation = goog.require('Blockly.utils.deprecation');
const idGenerator = goog.require('Blockly.utils.idGenerator');
const registry = goog.require('Blockly.registry');
const BlockMove = goog.requireType('Blockly.Events.BlockMove');
const BlockCreate = goog.requireType('Blockly.Events.BlockMove');
const CommentCreate = goog.requireType('Blockly.Events.CommentCreate');
const CommentMove = goog.requireType('Blockly.Events.CommentMove');


/**
 * Group ID for new events.  Grouped events are indivisible.
 * @type {string}
 */
let group = '';

/**
 * Sets whether the next event should be added to the undo stack.
 * @type {boolean}
 */
let recordUndo = true;
/** @deprecated September 2021 */
exports.recordUndo = recordUndo;

/**
 * Sets whether events should be added to the undo stack.
 * @param {boolean} newValue True if events should be added to the undo stack.
 */
const setRecordUndo = function(newValue) {
  recordUndo = newValue;
};
exports.setRecordUndo = setRecordUndo;

/**
 * Returns whether or not events will be added to the undo stack.
 * @returns {boolean} True if events will be added to the undo stack.
 */
const getRecordUndo = function() {
  return recordUndo;
};
exports.getRecordUndo = getRecordUndo;

Object.defineProperties(exports, {
  recordUndo: {
    get: function() {
      deprecation.warn(
          'Blockly.Events.recordUndo', 'September 2021', 'September 2022',
          'Blockly.Events.getRecordUndo()');
      return getRecordUndo();
    },
    set: function(record) {
      deprecation.warn(
          'Blockly.Events.recordUndo', 'September 2021', 'September 2022',
          'Blockly.Events.setRecordUndo()');
      setRecordUndo(record);
    },
  }
});

/**
 * Allow change events to be created and fired.
 * @type {number}
 */
let disabled = 0;
/** @private */
exports.disabled_ = disabled;


Object.defineProperties(exports, {
  disabled_: {
    set: function(newValue) {
      disabled = newValue;
    },
  },
});

/**
 * Type of events that cause objects to be bumped back into the visible
 * portion of the workspace.
 *
 * Not to be confused with bumping so that disconnected connections do not
 * appear connected.
 * @typedef {!BlockCreate|!BlockMove|
 * !CommentCreate|!CommentMove}
 */
let BumpEvent;
exports.BumpEvent = BumpEvent;


/**
 * Name of event that creates a block. Will be deprecated for BLOCK_CREATE.
 * @const
 */
const CREATE = 'create';
exports.CREATE = CREATE;

/**
 * Name of event that creates a block.
 * @const
 */
const BLOCK_CREATE = CREATE;
exports.BLOCK_CREATE = BLOCK_CREATE;

/**
 * Name of event that deletes a block. Will be deprecated for BLOCK_DELETE.
 * @const
 */
const DELETE = 'delete';
exports.DELETE = DELETE;

/**
 * Name of event that deletes a block.
 * @const
 */
const BLOCK_DELETE = DELETE;
exports.BLOCK_DELETE = BLOCK_DELETE;

/**
 * Name of event that changes a block. Will be deprecated for BLOCK_CHANGE.
 * @const
 */
const CHANGE = 'change';
exports.CHANGE = CHANGE;

/**
 * Name of event that changes a block.
 * @const
 */
const BLOCK_CHANGE = CHANGE;
exports.BLOCK_CHANGE = BLOCK_CHANGE;

/**
 * Name of event that moves a block. Will be deprecated for BLOCK_MOVE.
 * @const
 */
const MOVE = 'move';
exports.MOVE = MOVE;

/**
 * Name of event that moves a block.
 * @const
 */
const BLOCK_MOVE = MOVE;
exports.BLOCK_MOVE = BLOCK_MOVE;

/**
 * Name of event that creates a variable.
 * @const
 */
const VAR_CREATE = 'var_create';
exports.VAR_CREATE = VAR_CREATE;

/**
 * Name of event that deletes a variable.
 * @const
 */
const VAR_DELETE = 'var_delete';
exports.VAR_DELETE = VAR_DELETE;

/**
 * Name of event that renames a variable.
 * @const
 */
const VAR_RENAME = 'var_rename';
exports.VAR_RENAME = VAR_RENAME;

/**
 * Name of generic event that records a UI change.
 * @const
 */
const UI = 'ui';
exports.UI = UI;

/**
 * Name of event that record a block drags a block.
 * @const
 */
const BLOCK_DRAG = 'drag';
exports.BLOCK_DRAG = BLOCK_DRAG;

/**
 * Name of event that records a change in selected element.
 * @const
 */
const SELECTED = 'selected';
exports.SELECTED = SELECTED;

/**
 * Name of event that records a click.
 * @const
 */
const CLICK = 'click';
exports.CLICK = CLICK;

/**
 * Name of event that records a marker move.
 * @const
 */
const MARKER_MOVE = 'marker_move';
exports.MARKER_MOVE = MARKER_MOVE;

/**
 * Name of event that records a bubble open.
 * @const
 */
const BUBBLE_OPEN = 'bubble_open';
exports.BUBBLE_OPEN = BUBBLE_OPEN;

/**
 * Name of event that records a trashcan open.
 * @const
 */
const TRASHCAN_OPEN = 'trashcan_open';
exports.TRASHCAN_OPEN = TRASHCAN_OPEN;

/**
 * Name of event that records a toolbox item select.
 * @const
 */
const TOOLBOX_ITEM_SELECT = 'toolbox_item_select';
exports.TOOLBOX_ITEM_SELECT = TOOLBOX_ITEM_SELECT;

/**
 * Name of event that records a theme change.
 * @const
 */
const THEME_CHANGE = 'theme_change';
exports.THEME_CHANGE = THEME_CHANGE;

/**
 * Name of event that records a viewport change.
 * @const
 */
const VIEWPORT_CHANGE = 'viewport_change';
exports.VIEWPORT_CHANGE = VIEWPORT_CHANGE;

/**
 * Name of event that creates a comment.
 * @const
 */
const COMMENT_CREATE = 'comment_create';
exports.COMMENT_CREATE = COMMENT_CREATE;

/**
 * Name of event that deletes a comment.
 * @const
 */
const COMMENT_DELETE = 'comment_delete';
exports.COMMENT_DELETE = COMMENT_DELETE;

/**
 * Name of event that changes a comment.
 * @const
 */
const COMMENT_CHANGE = 'comment_change';
exports.COMMENT_CHANGE = COMMENT_CHANGE;

/**
 * Name of event that moves a comment.
 * @const
 */
const COMMENT_MOVE = 'comment_move';
exports.COMMENT_MOVE = COMMENT_MOVE;

/**
 * Name of event that records a workspace load.
 */
const FINISHED_LOADING = 'finished_loading';
exports.FINISHED_LOADING = FINISHED_LOADING;

/**
 * List of events that cause objects to be bumped back into the visible
 * portion of the workspace.
 *
 * Not to be confused with bumping so that disconnected connections do not
 * appear connected.
 * @const
 */
const BUMP_EVENTS = [BLOCK_CREATE, BLOCK_MOVE, COMMENT_CREATE, COMMENT_MOVE];
exports.BUMP_EVENTS = BUMP_EVENTS;

/**
 * List of events queued for firing.
 */
const FIRE_QUEUE = [];
/** @private */
exports.FIRE_QUEUE_ = FIRE_QUEUE;

/**
 * Create a custom event and fire it.
 * @param {!Abstract} event Custom data for event.
 */
const fire = function(event) {
  if (!isEnabled()) {
    return;
  }
  if (!FIRE_QUEUE.length) {
    // First event added; schedule a firing of the event queue.
    setTimeout(fireNow, 0);
  }
  FIRE_QUEUE.push(event);
};
exports.fire = fire;

/**
 * Fire all queued events.
 */
const fireNow = function() {
  const queue = filter(FIRE_QUEUE, true);
  FIRE_QUEUE.length = 0;
  for (let i = 0, event; (event = queue[i]); i++) {
    if (!event.workspaceId) {
      continue;
    }
    const Workspace = goog.module.get('Blockly.Workspace');
    const eventWorkspace = Workspace.getById(event.workspaceId);
    if (eventWorkspace) {
      eventWorkspace.fireChangeListener(event);
    }
  }
};
/** @private */
exports.fireNow_ = fireNow;

/**
 * Filter the queued events and merge duplicates.
 * @param {!Array<!Abstract>} queueIn Array of events.
 * @param {boolean} forward True if forward (redo), false if backward (undo).
 * @return {!Array<!Abstract>} Array of filtered events.
 */
const filter = function(queueIn, forward) {
  let queue = queueIn.slice();  // Shallow copy of queue.
  if (!forward) {
    // Undo is merged in reverse order.
    queue.reverse();
  }
  const mergedQueue = [];
  const hash = Object.create(null);
  // Merge duplicates.
  for (let i = 0, event; (event = queue[i]); i++) {
    if (!event.isNull()) {
      // Treat all UI events as the same type in hash table.
      const eventType = event.isUiEvent ? UI : event.type;
      const key = [eventType, event.blockId, event.workspaceId].join(' ');

      const lastEntry = hash[key];
      const lastEvent = lastEntry ? lastEntry.event : null;
      if (!lastEntry) {
        // Each item in the hash table has the event and the index of that event
        // in the input array.  This lets us make sure we only merge adjacent
        // move events.
        hash[key] = {event: event, index: i};
        mergedQueue.push(event);
      } else if (event.type == MOVE && lastEntry.index == i - 1) {
        // Merge move events.
        lastEvent.newParentId = event.newParentId;
        lastEvent.newInputName = event.newInputName;
        lastEvent.newCoordinate = event.newCoordinate;
        lastEntry.index = i;
      } else if (
          event.type == CHANGE && event.element == lastEvent.element &&
          event.name == lastEvent.name) {
        // Merge change events.
        lastEvent.newValue = event.newValue;
      } else if (event.type == VIEWPORT_CHANGE) {
        // Merge viewport change events.
        lastEvent.viewTop = event.viewTop;
        lastEvent.viewLeft = event.viewLeft;
        lastEvent.scale = event.scale;
        lastEvent.oldScale = event.oldScale;
      } else if (event.type == CLICK && lastEvent.type == BUBBLE_OPEN) {
        // Drop click events caused by opening/closing bubbles.
      } else {
        // Collision: newer events should merge into this event to maintain
        // order.
        hash[key] = {event: event, index: i};
        mergedQueue.push(event);
      }
    }
  }
  // Filter out any events that have become null due to merging.
  queue = mergedQueue.filter(function(e) {
    return !e.isNull();
  });
  if (!forward) {
    // Restore undo order.
    queue.reverse();
  }
  // Move mutation events to the top of the queue.
  // Intentionally skip first event.
  for (let i = 1, event; (event = queue[i]); i++) {
    if (event.type == CHANGE && event.element == 'mutation') {
      queue.unshift(queue.splice(i, 1)[0]);
    }
  }
  return queue;
};
exports.filter = filter;

/**
 * Modify pending undo events so that when they are fired they don't land
 * in the undo stack.  Called by Workspace.clearUndo.
 */
const clearPendingUndo = function() {
  for (let i = 0, event; (event = FIRE_QUEUE[i]); i++) {
    event.recordUndo = false;
  }
};
exports.clearPendingUndo = clearPendingUndo;

/**
 * Stop sending events.  Every call to this function MUST also call enable.
 */
const disable = function() {
  disabled++;
};
exports.disable = disable;

/**
 * Start sending events.  Unless events were already disabled when the
 * corresponding call to disable was made.
 */
const enable = function() {
  disabled--;
};
exports.enable = enable;

/**
 * Returns whether events may be fired or not.
 * @return {boolean} True if enabled.
 */
const isEnabled = function() {
  return disabled == 0;
};
exports.isEnabled = isEnabled;

/**
 * Current group.
 * @return {string} ID string.
 */
const getGroup = function() {
  return group;
};
exports.getGroup = getGroup;

/**
 * Start or stop a group.
 * @param {boolean|string} state True to start new group, false to end group.
 *   String to set group explicitly.
 */
const setGroup = function(state) {
  if (typeof state == 'boolean') {
    group = state ? idGenerator.genUid() : '';
  } else {
    group = state;
  }
};
exports.setGroup = setGroup;

/**
 * Compute a list of the IDs of the specified block and all its descendants.
 * @param {!Block} block The root block.
 * @return {!Array<string>} List of block IDs.
 */
const getDescendantIds = function(block) {
  const ids = [];
  const descendants = block.getDescendants(false);
  for (let i = 0, descendant; (descendant = descendants[i]); i++) {
    ids[i] = descendant.id;
  }
  return ids;
};
/** @package */
exports.getDescendantIds = getDescendantIds;

/**
 * Decode the JSON into an event.
 * @param {!Object} json JSON representation.
 * @param {!Workspace} workspace Target workspace for event.
 * @return {!Abstract} The event represented by the JSON.
 * @throws {Error} if an event type is not found in the registry.
 */
const fromJson = function(json, workspace) {
  const eventClass = get(json.type);
  if (!eventClass) {
    throw Error('Unknown event type.');
  }
  const event = new eventClass();
  event.fromJson(json);
  event.workspaceId = workspace.id;
  return event;
};
exports.fromJson = fromJson;

/**
 * Gets the class for a specific event type from the registry.
 * @param {string} eventType The type of the event to get.
 * @return {?function(new:Abstract, ...?)} The event class with
 *     the given type or null if none exists.
 */
const get = function(eventType) {
  return registry.getClass(registry.Type.EVENT, eventType);
};
exports.get = get;

/**
 * Enable/disable a block depending on whether it is properly connected.
 * Use this on applications where all blocks should be connected to a top block.
 * Recommend setting the 'disable' option to 'false' in the config so that
 * users don't try to re-enable disabled orphan blocks.
 * @param {!Abstract} event Custom data for event.
 */
const disableOrphans = function(event) {
  if (event.type == MOVE || event.type == CREATE) {
    if (!event.workspaceId) {
      return;
    }
    const Workspace = goog.module.get('Blockly.Workspace');
    const eventWorkspace = Workspace.getById(event.workspaceId);
    let block = eventWorkspace.getBlockById(event.blockId);
    if (block) {
      // Changing blocks as part of this event shouldn't be undoable.
      const initialUndoFlag = recordUndo;
      try {
        recordUndo = false;
        const parent = block.getParent();
        if (parent && parent.isEnabled()) {
          const children = block.getDescendants(false);
          for (let i = 0, child; (child = children[i]); i++) {
            child.setEnabled(true);
          }
        } else if (
            (block.outputConnection || block.previousConnection) &&
            !eventWorkspace.isDragging()) {
          do {
            block.setEnabled(false);
            block = block.getNextBlock();
          } while (block);
        }
      } finally {
        recordUndo = initialUndoFlag;
      }
    }
  }
};
exports.disableOrphans = disableOrphans;

exports.TEST_ONLY = {FIRE_QUEUE, fireNow};

