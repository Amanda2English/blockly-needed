/**
 * @fileoverview A database of all the rendered connections that could
 *    possibly be connected to (i.e. not collapsed, etc).
 *    Sorted by y coordinate.
 */

/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * A database of all the rendered connections that could
 *    possibly be connected to (i.e. not collapsed, etc).
 *    Sorted by y coordinate.
 * @class
 */

// Unused import preserved for side-effects. Remove if unneeded.
import './constants';

import { ConnectionType } from './connection_type';
/* eslint-disable-next-line no-unused-vars */
import { IConnectionChecker } from './interfaces/i_connection_checker';
/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from './rendered_connection';
/* eslint-disable-next-line no-unused-vars */
import { Coordinate } from './utils/coordinate';


/**
 * Database of connections.
 * Connections are stored in order of their vertical component.  This way
 * connections in an area may be looked up quickly using a binary search.
 * @alias Blockly.ConnectionDB
 */
export class ConnectionDB {
  /** Array of connections sorted by y position in workspace units. */
  private readonly connections_: RenderedConnection[] = [];

  /**
   * @param checker The workspace's connection type checker, used to decide if
   *     connections are valid during a drag.
   */
  constructor(private readonly checker: IConnectionChecker) {}

  /**
   * Add a connection to the database. Should not already exist in the database.
   * @param connection The connection to be added.
   * @param yPos The y position used to decide where to insert the connection.
   */
  addConnection(connection: RenderedConnection, yPos: number) {
    const index = this.calculateIndexForYPos_(yPos);
    this.connections_.splice(index, 0, connection);
  }

  /**
   * Finds the index of the given connection.
   *
   * Starts by doing a binary search to find the approximate location, then
   * linearly searches nearby for the exact connection.
   * @param conn The connection to find.
   * @param yPos The y position used to find the index of the connection.
   * @return The index of the connection, or -1 if the connection was not found.
   */
  private findIndexOfConnection_(conn: RenderedConnection, yPos: number):
    number {
    if (!this.connections_.length) {
      return -1;
    }

    const bestGuess = this.calculateIndexForYPos_(yPos);
    if (bestGuess >= this.connections_.length) {
      // Not in list
      return -1;
    }

    yPos = conn.y;
    // Walk forward and back on the y axis looking for the connection.
    let pointer = bestGuess;
    while (pointer >= 0 && this.connections_[pointer].y === yPos) {
      if (this.connections_[pointer] === conn) {
        return pointer;
      }
      pointer--;
    }

    pointer = bestGuess;
    while (pointer < this.connections_.length &&
      this.connections_[pointer].y === yPos) {
      if (this.connections_[pointer] === conn) {
        return pointer;
      }
      pointer++;
    }
    return -1;
  }

  /**
   * Finds the correct index for the given y position.
   * @param yPos The y position used to decide where to insert the connection.
   * @return The candidate index.
   */
  private calculateIndexForYPos_(yPos: number): number {
    if (!this.connections_.length) {
      return 0;
    }
    let pointerMin = 0;
    let pointerMax = this.connections_.length;
    while (pointerMin < pointerMax) {
      const pointerMid = Math.floor((pointerMin + pointerMax) / 2);
      if (this.connections_[pointerMid].y < yPos) {
        pointerMin = pointerMid + 1;
      } else if (this.connections_[pointerMid].y > yPos) {
        pointerMax = pointerMid;
      } else {
        pointerMin = pointerMid;
        break;
      }
    }
    return pointerMin;
  }

  /**
   * Remove a connection from the database.  Must already exist in DB.
   * @param connection The connection to be removed.
   * @param yPos The y position used to find the index of the connection.
   * @throws {Error} If the connection cannot be found in the database.
   */
  removeConnection(connection: RenderedConnection, yPos: number) {
    const index = this.findIndexOfConnection_(connection, yPos);
    if (index === -1) {
      throw Error('Unable to find connection in connectionDB.');
    }
    this.connections_.splice(index, 1);
  }

  /**
   * Find all nearby connections to the given connection.
   * Type checking does not apply, since this function is used for bumping.
   * @param connection The connection whose neighbours should be returned.
   * @param maxRadius The maximum radius to another connection.
   * @return List of connections.
   */
  getNeighbours(connection: RenderedConnection, maxRadius: number):
    RenderedConnection[] {
    const db = this.connections_;
    const currentX = connection.x;
    const currentY = connection.y;

    // Binary search to find the closest y location.
    let pointerMin = 0;
    let pointerMax = db.length - 2;
    let pointerMid = pointerMax;
    while (pointerMin < pointerMid) {
      if (db[pointerMid].y < currentY) {
        pointerMin = pointerMid;
      } else {
        pointerMax = pointerMid;
      }
      pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    }

    const neighbours: AnyDuringMigration[] = [];
    /**
     * Computes if the current connection is within the allowed radius of
     * another connection. This function is a closure and has access to outside
     * variables.
     * @param yIndex The other connection's index in the database.
     * @return True if the current connection's vertical distance from the other
     *     connection is less than the allowed radius.
     */
    function checkConnection_(yIndex: number): boolean {
      const dx = currentX - db[yIndex].x;
      const dy = currentY - db[yIndex].y;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r <= maxRadius) {
        neighbours.push(db[yIndex]);
      }
      return dy < maxRadius;
    }

    // Walk forward and back on the y axis looking for the closest x,y point.
    pointerMin = pointerMid;
    pointerMax = pointerMid;
    if (db.length) {
      while (pointerMin >= 0 && checkConnection_(pointerMin)) {
        pointerMin--;
      }
      do {
        pointerMax++;
      } while (pointerMax < db.length && checkConnection_(pointerMax));
    }

    return neighbours;
  }

  /**
   * Is the candidate connection close to the reference connection.
   * Extremely fast; only looks at Y distance.
   * @param index Index in database of candidate connection.
   * @param baseY Reference connection's Y value.
   * @param maxRadius The maximum radius to another connection.
   * @return True if connection is in range.
   */
  private isInYRange_(index: number, baseY: number, maxRadius: number):
    boolean {
    return Math.abs(this.connections_[index].y - baseY) <= maxRadius;
  }

  /**
   * Find the closest compatible connection to this connection.
   * @param conn The connection searching for a compatible mate.
   * @param maxRadius The maximum radius to another connection.
   * @param dxy Offset between this connection's location in the database and
   *     the current location (as a result of dragging).
   * @return Contains two properties: 'connection' which is either another
   *     connection or null, and 'radius' which is the distance.
   */
  searchForClosest(
    conn: RenderedConnection, maxRadius: number,
    dxy: Coordinate): { connection: RenderedConnection, radius: number } {
    if (!this.connections_.length) {
      // Don't bother.
      // AnyDuringMigration because:  Type 'null' is not assignable to type
      // 'RenderedConnection'.
      return { connection: null as AnyDuringMigration, radius: maxRadius };
    }

    // Stash the values of x and y from before the drag.
    const baseY = conn.y;
    const baseX = conn.x;

    conn.x = baseX + dxy.x;
    conn.y = baseY + dxy.y;

    // calculateIndexForYPos_ finds an index for insertion, which is always
    // after any block with the same y index.  We want to search both forward
    // and back, so search on both sides of the index.
    const closestIndex = this.calculateIndexForYPos_(conn.y);

    let bestConnection = null;
    let bestRadius = maxRadius;
    let temp;

    // Walk forward and back on the y axis looking for the closest x,y point.
    let pointerMin = closestIndex - 1;
    while (pointerMin >= 0 && this.isInYRange_(pointerMin, conn.y, maxRadius)) {
      temp = this.connections_[pointerMin];
      if (this.checker.canConnect(conn, temp, true, bestRadius)) {
        bestConnection = temp;
        // AnyDuringMigration because:  Argument of type 'RenderedConnection' is
        // not assignable to parameter of type 'Connection'.
        bestRadius = temp.distanceFrom(conn as AnyDuringMigration);
      }
      pointerMin--;
    }

    let pointerMax = closestIndex;
    while (pointerMax < this.connections_.length &&
      this.isInYRange_(pointerMax, conn.y, maxRadius)) {
      temp = this.connections_[pointerMax];
      if (this.checker.canConnect(conn, temp, true, bestRadius)) {
        bestConnection = temp;
        // AnyDuringMigration because:  Argument of type 'RenderedConnection' is
        // not assignable to parameter of type 'Connection'.
        bestRadius = temp.distanceFrom(conn as AnyDuringMigration);
      }
      pointerMax++;
    }

    // Reset the values of x and y.
    conn.x = baseX;
    conn.y = baseY;
    // If there were no valid connections, bestConnection will be null.
    // AnyDuringMigration because:  Type 'RenderedConnection | null' is not
    // assignable to type 'RenderedConnection'.
    return {
      connection: bestConnection as AnyDuringMigration,
      radius: bestRadius
    };
  }

  /**
   * Initialize a set of connection DBs for a workspace.
   * @param checker The workspace's connection checker, used to decide if
   *     connections are valid during a drag.
   * @return Array of databases.
   */
  static init(checker: IConnectionChecker): ConnectionDB[] {
    // Create four databases, one for each connection type.
    const dbList = [];
    dbList[ConnectionType.INPUT_VALUE] = new ConnectionDB(checker);
    dbList[ConnectionType.OUTPUT_VALUE] = new ConnectionDB(checker);
    dbList[ConnectionType.NEXT_STATEMENT] = new ConnectionDB(checker);
    dbList[ConnectionType.PREVIOUS_STATEMENT] = new ConnectionDB(checker);
    return dbList;
  }
}
