/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Components for creating connections between blocks.
 */

/**
 * Components for creating connections between blocks.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Connection');

// Unused import preserved for side-effects. Remove if unneeded.
import './constants';

/* eslint-disable-next-line no-unused-vars */
import {Block} from './block.js';
import {ConnectionType} from './connection_type.js';
/* eslint-disable-next-line no-unused-vars */
import {BlockMove} from './events/events_block_move.js';
import * as eventUtils from './events/utils.js';
/* eslint-disable-next-line no-unused-vars */
import {Input} from './input.js';
/* eslint-disable-next-line no-unused-vars */
import {IASTNodeLocationWithBlock} from './interfaces/i_ast_node_location_with_block.js';
/* eslint-disable-next-line no-unused-vars */
import {IConnectionChecker} from './interfaces/i_connection_checker.js';
import * as blocks from './serialization/blocks.js';
import * as Xml from './xml.js';


/**
 * Class for a connection between blocks.
 * @alias Blockly.Connection
 */
export class Connection implements IASTNodeLocationWithBlock {
  /** Constants for checking whether two connections are compatible. */
  static CAN_CONNECT = 0;
  static REASON_SELF_CONNECTION = 1;
  static REASON_WRONG_TYPE = 2;
  static REASON_TARGET_NULL = 3;
  static REASON_CHECKS_FAILED = 4;
  static REASON_DIFFERENT_WORKSPACES = 5;
  static REASON_SHADOW_PARENT = 6;
  static REASON_DRAG_CHECKS_FAILED = 7;
  static REASON_PREVIOUS_AND_OUTPUT = 8;

  /** Connection this connection connects to.  Null if not connected. */
  targetConnection: Connection|null = null;

  /**
   * Has this connection been disposed of?
   * @internal
   */
  disposed = false;

  /** List of compatible value types.  Null if all types are compatible. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type 'any[]'.
  private check_: AnyDuringMigration[] = null as AnyDuringMigration;

  /** DOM representation of a shadow block, or null if none. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Element'.
  private shadowDom_: Element = null as AnyDuringMigration;

  /**
   * Horizontal location of this connection.
   * @internal
   */
  x = 0;

  /**
   * Vertical location of this connection.
   * @internal
   */
  y = 0;

  private shadowState_: blocks.State|null = null;

  /**
   * @param source The block establishing this connection.
   * @param type The type of the connection.
   */
  constructor(private readonly source: Block, public type: number) {}

  /**
   * Connect two connections together.  This is the connection on the superior
   * block.
   * @param childConnection Connection on inferior block.
   */
  protected connect_(childConnection: Connection) {
    const INPUT = ConnectionType.INPUT_VALUE;
    const parentConnection = this;
    const parentBlock = parentConnection.getSourceBlock();
    const childBlock = childConnection.getSourceBlock();

    // Make sure the childConnection is available.
    if (childConnection.isConnected()) {
      childConnection.disconnect();
    }

    // Make sure the parentConnection is available.
    let orphan;
    if (parentConnection.isConnected()) {
      const shadowState = parentConnection.stashShadowState_();
      const target = parentConnection.targetBlock();
      if (target!.isShadow()) {
        target!.dispose(false);
      } else {
        parentConnection.disconnect();
        orphan = target;
      }
      parentConnection.applyShadowState_(shadowState);
    }

    // Connect the new connection to the parent.
    let event;
    if (eventUtils.isEnabled()) {
      event =
          new (eventUtils.get(eventUtils.BLOCK_MOVE))!(childBlock) as BlockMove;
    }
    connectReciprocally(parentConnection, childConnection);
    childBlock.setParent(parentBlock);
    if (event) {
      event.recordNew();
      eventUtils.fire(event);
    }

    // Deal with the orphan if it exists.
    if (orphan) {
      const orphanConnection = parentConnection.type === INPUT ?
          orphan.outputConnection :
          orphan.previousConnection;
      const connection = Connection.getConnectionForOrphanedConnection(
          childBlock, (orphanConnection));
      if (connection) {
        orphanConnection.connect(connection);
      } else {
        orphanConnection.onFailedConnect(parentConnection);
      }
    }
  }

  /**
   * Dispose of this connection and deal with connected blocks.
   * @internal
   */
  dispose() {
    // isConnected returns true for shadows and non-shadows.
    if (this.isConnected()) {
      // Destroy the attached shadow block & its children (if it exists).
      this.setShadowStateInternal_();

      const targetBlock = this.targetBlock();
      if (targetBlock) {
        // Disconnect the attached normal block.
        targetBlock.unplug();
      }
    }

    this.disposed = true;
  }

  /**
   * Get the source block for this connection.
   * @return The source block.
   */
  getSourceBlock(): Block {
    return this.source;
  }

  /**
   * Does the connection belong to a superior block (higher in the source
   * stack)?
   * @return True if connection faces down or right.
   */
  isSuperior(): boolean {
    return this.type === ConnectionType.INPUT_VALUE ||
        this.type === ConnectionType.NEXT_STATEMENT;
  }

  /**
   * Is the connection connected?
   * @return True if connection is connected to another connection.
   */
  isConnected(): boolean {
    return !!this.targetConnection;
  }

  /**
   * Get the workspace's connection type checker object.
   * @return The connection type checker for the source block's workspace.
   * @internal
   */
  getConnectionChecker(): IConnectionChecker {
    return this.source.workspace.connectionChecker;
  }

  /**
   * Called when an attempted connection fails. NOP by default (i.e. for
   * headless workspaces).
   * @param _otherConnection Connection that this connection failed to connect
   *     to.
   * @internal
   */
  onFailedConnect(_otherConnection: Connection) {}
  // NOP

  /**
   * Connect this connection to another connection.
   * @param otherConnection Connection to connect to.
   * @return Whether the the blocks are now connected or not.
   */
  connect(otherConnection: Connection): boolean {
    if (this.targetConnection === otherConnection) {
      // Already connected together.  NOP.
      return true;
    }

    const checker = this.getConnectionChecker();
    if (checker.canConnect(this, otherConnection, false)) {
      const eventGroup = eventUtils.getGroup();
      if (!eventGroup) {
        eventUtils.setGroup(true);
      }
      // Determine which block is superior (higher in the source stack).
      if (this.isSuperior()) {
        // Superior block.
        this.connect_(otherConnection);
      } else {
        // Inferior block.
        otherConnection.connect_(this);
      }
      if (!eventGroup) {
        eventUtils.setGroup(false);
      }
    }

    return this.isConnected();
  }

  /** Disconnect this connection. */
  disconnect() {
    const otherConnection = this.targetConnection;
    if (!otherConnection) {
      throw Error('Source connection not connected.');
    }
    if (otherConnection.targetConnection !== this) {
      throw Error('Target connection not connected to source connection.');
    }
    let parentBlock;
    let childBlock;
    let parentConnection;
    if (this.isSuperior()) {
      // Superior block.
      parentBlock = this.source;
      childBlock = otherConnection.getSourceBlock();
      parentConnection = this;
    } else {
      // Inferior block.
      parentBlock = otherConnection.getSourceBlock();
      childBlock = this.source;
      parentConnection = otherConnection;
    }

    const eventGroup = eventUtils.getGroup();
    if (!eventGroup) {
      eventUtils.setGroup(true);
    }
    this.disconnectInternal_(parentBlock, childBlock);
    if (!childBlock.isShadow()) {
      // If we were disconnecting a shadow, no need to spawn a new one.
      parentConnection.respawnShadow_();
    }
    if (!eventGroup) {
      eventUtils.setGroup(false);
    }
  }

  /**
   * Disconnect two blocks that are connected by this connection.
   * @param parentBlock The superior block.
   * @param childBlock The inferior block.
   */
  protected disconnectInternal_(parentBlock: Block, childBlock: Block) {
    let event;
    if (eventUtils.isEnabled()) {
      event =
          new (eventUtils.get(eventUtils.BLOCK_MOVE))!(childBlock) as BlockMove;
    }
    const otherConnection = this.targetConnection;
    if (otherConnection) {
      otherConnection.targetConnection = null;
    }
    this.targetConnection = null;
    childBlock.setParent(null);
    if (event) {
      event.recordNew();
      eventUtils.fire(event);
    }
  }

  /**
   * Respawn the shadow block if there was one connected to the this connection.
   */
  protected respawnShadow_() {
    // Have to keep respawnShadow_ for backwards compatibility.
    this.createShadowBlock_(true);
  }

  /**
   * Returns the block that this connection connects to.
   * @return The connected block or null if none is connected.
   */
  targetBlock(): Block|null {
    if (this.isConnected()) {
      return this.targetConnection?.getSourceBlock() ?? null;
    }
    return null;
  }

  /**
   * Function to be called when this connection's compatible types have changed.
   */
  protected onCheckChanged_() {
    // The new value type may not be compatible with the existing connection.
    if (this.isConnected() &&
        (!this.targetConnection ||
         !this.getConnectionChecker().canConnect(
             this, this.targetConnection, false))) {
      const child = this.isSuperior() ? this.targetBlock() : this.source;
      child!.unplug();
    }
  }

  /**
   * Change a connection's compatibility.
   * @param check Compatible value type or list of value types. Null if all
   *     types are compatible.
   * @return The connection being modified (to allow chaining).
   */
  setCheck(check: string|string[]|null): Connection {
    if (check) {
      // Ensure that check is in an array.
      if (!Array.isArray(check)) {
        check = [check];
      }
      this.check_ = check;
      this.onCheckChanged_();
    } else {
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'any[]'.
      this.check_ = null as AnyDuringMigration;
    }
    return this;
  }

  /**
   * Get a connection's compatibility.
   * @return List of compatible value types.
   *     Null if all types are compatible.
   */
  getCheck(): AnyDuringMigration[]|null {
    return this.check_;
  }

  /**
   * Changes the connection's shadow block.
   * @param shadowDom DOM representation of a block or null.
   */
  setShadowDom(shadowDom: Element|null) {
    this.setShadowStateInternal_({shadowDom});
  }

  /**
   * Returns the xml representation of the connection's shadow block.
   * @param returnCurrent If true, and the shadow block is currently attached to
   *     this connection, this serializes the state of that block and returns it
   *     (so that field values are correct). Otherwise the saved shadowDom is
   *     just returned.
   * @return Shadow DOM representation of a block or null.
   */
  getShadowDom(returnCurrent?: boolean): Element|null {
    return returnCurrent && this.targetBlock()!.isShadow() ?
        Xml.blockToDom((this.targetBlock() as Block)) as Element :
        this.shadowDom_;
  }

  /**
   * Changes the connection's shadow block.
   * @param shadowState An state represetation of the block or null.
   */
  setShadowState(shadowState: blocks.State|null) {
    this.setShadowStateInternal_({shadowState});
  }

  /**
   * Returns the serialized object representation of the connection's shadow
   * block.
   * @param returnCurrent If true, and the shadow block is currently attached to
   *     this connection, this serializes the state of that block and returns it
   *     (so that field values are correct). Otherwise the saved state is just
   *     returned.
   * @return Serialized object representation of the block, or null.
   */
  getShadowState(returnCurrent?: boolean): blocks.State|null {
    if (returnCurrent && this.targetBlock() && this.targetBlock()!.isShadow()) {
      return blocks.save(this.targetBlock() as Block);
    }
    return this.shadowState_;
  }

  /**
   * Find all nearby compatible connections to this connection.
   * Type checking does not apply, since this function is used for bumping.
   *
   * Headless configurations (the default) do not have neighboring connection,
   * and always return an empty list (the default).
   * {@link Blockly.RenderedConnection} overrides this behavior with a list
   * computed from the rendered positioning.
   * @param _maxLimit The maximum radius to another connection.
   * @return List of connections.
   * @internal
   */
  neighbours(_maxLimit: number): Connection[] {
    return [];
  }

  /**
   * Get the parent input of a connection.
   * @return The input that the connection belongs to or null if no parent
   *     exists.
   * @internal
   */
  getParentInput(): Input|null {
    let parentInput = null;
    const inputs = this.source.inputList;
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].connection === this) {
        parentInput = inputs[i];
        break;
      }
    }
    return parentInput;
  }

  /**
   * This method returns a string describing this Connection in developer terms
   * (English only). Intended to on be used in console logs and errors.
   * @return The description.
   */
  toString(): string {
    const block = this.source;
    if (!block) {
      return 'Orphan Connection';
    }
    let msg;
    if (block.outputConnection === this) {
      msg = 'Output Connection of ';
    } else if (block.previousConnection === this) {
      msg = 'Previous Connection of ';
    } else if (block.nextConnection === this) {
      msg = 'Next Connection of ';
    } else {
      let parentInput = null;
      for (let i = 0, input; input = block.inputList[i]; i++) {
        if (input.connection === this) {
          parentInput = input;
          break;
        }
      }
      if (parentInput) {
        msg = 'Input "' + parentInput.name + '" connection on ';
      } else {
        console.warn('Connection not actually connected to sourceBlock_');
        return 'Orphan Connection';
      }
    }
    return msg + block.toDevString();
  }

  /**
   * Returns the state of the shadowDom_ and shadowState_ properties, then
   * temporarily sets those properties to null so no shadow respawns.
   * @return The state of both the shadowDom_ and shadowState_ properties.
   */
  private stashShadowState_():
      {shadowDom: Element|null, shadowState: blocks.State|null} {
    const shadowDom = this.getShadowDom(true);
    const shadowState = this.getShadowState(true);
    // Set to null so it doesn't respawn.
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'Element'.
    this.shadowDom_ = null as AnyDuringMigration;
    this.shadowState_ = null;
    return {shadowDom, shadowState};
  }

  /**
   * Reapplies the stashed state of the shadowDom_ and shadowState_ properties.
   * @param param0 The state to reapply to the shadowDom_ and shadowState_
   *     properties.
   */
  private applyShadowState_({shadowDom, shadowState}: {
    shadowDom: Element|null,
    shadowState: blocks.State|null
  }) {
    // AnyDuringMigration because:  Type 'Element | null' is not assignable to
    // type 'Element'.
    this.shadowDom_ = shadowDom as AnyDuringMigration;
    this.shadowState_ = shadowState;
  }

  /**
   * Sets the state of the shadow of this connection.
   * @param param0 The state to set the shadow of this connection to.
   */
  private setShadowStateInternal_({shadowDom = null, shadowState = null}: {
    shadowDom?: Element|null,
    shadowState?: blocks.State|null
  } = {}) {
    // One or both of these should always be null.
    // If neither is null, the shadowState will get priority.
    // AnyDuringMigration because:  Type 'Element | null' is not assignable to
    // type 'Element'.
    this.shadowDom_ = shadowDom as AnyDuringMigration;
    this.shadowState_ = shadowState;

    const target = this.targetBlock();
    if (!target) {
      this.respawnShadow_();
      if (this.targetBlock() && this.targetBlock()!.isShadow()) {
        this.serializeShadow_(this.targetBlock());
      }
    } else if (target.isShadow()) {
      target.dispose(false);
      this.respawnShadow_();
      if (this.targetBlock() && this.targetBlock()!.isShadow()) {
        this.serializeShadow_(this.targetBlock());
      }
    } else {
      const shadow = this.createShadowBlock_(false);
      this.serializeShadow_(shadow);
      if (shadow) {
        shadow.dispose(false);
      }
    }
  }

  /**
   * Creates a shadow block based on the current shadowState_ or shadowDom_.
   * shadowState_ gets priority.
   * @param attemptToConnect Whether to try to connect the shadow block to this
   *     connection or not.
   * @return The shadow block that was created, or null if both the shadowState_
   *     and shadowDom_ are null.
   */
  private createShadowBlock_(attemptToConnect: boolean): Block|null {
    const parentBlock = this.getSourceBlock();
    const shadowState = this.getShadowState();
    const shadowDom = this.getShadowDom();
    if (!parentBlock.workspace || !shadowState && !shadowDom) {
      return null;
    }

    let blockShadow;
    if (shadowState) {
      blockShadow = blocks.appendInternal(shadowState, parentBlock.workspace, {
        parentConnection: attemptToConnect ? this : undefined,
        isShadow: true,
        recordUndo: false,
      });
      return blockShadow;
    }

    if (shadowDom) {
      blockShadow = Xml.domToBlock(shadowDom, parentBlock.workspace);
      if (attemptToConnect) {
        if (this.type === ConnectionType.INPUT_VALUE) {
          if (!blockShadow.outputConnection) {
            throw new Error('Shadow block is missing an output connection');
          }
          if (!this.connect(blockShadow.outputConnection)) {
            throw new Error('Could not connect shadow block to connection');
          }
        } else if (this.type === ConnectionType.NEXT_STATEMENT) {
          if (!blockShadow.previousConnection) {
            throw new Error('Shadow block is missing previous connection');
          }
          if (!this.connect(blockShadow.previousConnection)) {
            throw new Error('Could not connect shadow block to connection');
          }
        } else {
          throw new Error(
              'Cannot connect a shadow block to a previous/output connection');
        }
      }
      return blockShadow;
    }
    return null;
  }

  /**
   * Saves the given shadow block to both the shadowDom_ and shadowState_
   * properties, in their respective serialized forms.
   * @param shadow The shadow to serialize, or null.
   */
  private serializeShadow_(shadow: Block|null) {
    if (!shadow) {
      return;
    }
    this.shadowDom_ = Xml.blockToDom(shadow) as Element;
    this.shadowState_ = blocks.save(shadow);
  }

  /**
   * Returns the connection (starting at the startBlock) which will accept
   * the given connection. This includes compatible connection types and
   * connection checks.
   * @param startBlock The block on which to start the search.
   * @param orphanConnection The connection that is looking for a home.
   * @return The suitable connection point on the chain of blocks, or null.
   */
  static getConnectionForOrphanedConnection(
      startBlock: Block, orphanConnection: Connection): Connection|null {
    if (orphanConnection.type === ConnectionType.OUTPUT_VALUE) {
      return getConnectionForOrphanedOutput(
          startBlock, orphanConnection.getSourceBlock());
    }
    // Otherwise we're dealing with a stack.
    const connection = startBlock.lastConnectionInStack(true);
    const checker = orphanConnection.getConnectionChecker();
    if (connection && checker.canConnect(orphanConnection, connection, false)) {
      return connection;
    }
    return null;
  }
}

/**
 * Update two connections to target each other.
 * @param first The first connection to update.
 * @param second The second connection to update.
 */
function connectReciprocally(first: Connection, second: Connection) {
  if (!first || !second) {
    throw Error('Cannot connect null connections.');
  }
  first.targetConnection = second;
  second.targetConnection = first;
}
/**
 * Returns the single connection on the block that will accept the orphaned
 * block, if one can be found. If the block has multiple compatible connections
 * (even if they are filled) this returns null. If the block has no compatible
 * connections, this returns null.
 * @param block The superior block.
 * @param orphanBlock The inferior block.
 * @return The suitable connection point on 'block', or null.
 */
function getSingleConnection(block: Block, orphanBlock: Block): Connection|
    null {
  let foundConnection = null;
  const output = orphanBlock.outputConnection;
  const typeChecker = output.getConnectionChecker();

  for (let i = 0, input; input = block.inputList[i]; i++) {
    const connection = input.connection;
    if (connection && typeChecker.canConnect(output, connection, false)) {
      if (foundConnection) {
        return null;
      }
      // More than one connection.
      foundConnection = connection;
    }
  }
  return foundConnection;
}

/**
 * Walks down a row a blocks, at each stage checking if there are any
 * connections that will accept the orphaned block.  If at any point there
 * are zero or multiple eligible connections, returns null.  Otherwise
 * returns the only input on the last block in the chain.
 * Terminates early for shadow blocks.
 * @param startBlock The block on which to start the search.
 * @param orphanBlock The block that is looking for a home.
 * @return The suitable connection point on the chain of blocks, or null.
 */
function getConnectionForOrphanedOutput(
    startBlock: Block, orphanBlock: Block): Connection|null {
  let newBlock = startBlock;
  let connection;
  while (connection = getSingleConnection((newBlock), orphanBlock)) {
    // AnyDuringMigration because:  Type 'Block | null' is not assignable to
    // type 'Block'.
    newBlock = connection.targetBlock() as AnyDuringMigration;
    if (!newBlock || newBlock.isShadow()) {
      return connection;
    }
  }
  return null;
}
