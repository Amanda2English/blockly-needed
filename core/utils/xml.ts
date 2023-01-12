/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * XML element manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 *
 * @namespace Blockly.utils.xml
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.xml');


/**
 * Injected dependencies.  By default these are just (and have the
 * same types as) the corresponding DOM Window properties, but the
 * Node.js wrapper for Blockly (see scripts/package/node/core.js)
 * calls injectDependencies to supply implementations from the jsdom
 * package instead.
 */
let {document, DOMParser, XMLSerializer} = globalThis;

/**
 * Inject dependencies.  Used by the Node.js wrapper for Blockly (see
 * scripts/package/node/core.js) to supply implementations from the
 * jsdom package instead.  While they may be set individually, it is
 * normally the case that all three should be supplied and sourced
 * from the same JSDOM instance.
 *
 * @param dependencies Options object contianing dependencies to set.
 */
export function injectDependencies(dependencies: {
  document?: Document,
  DOMParser?: typeof DOMParser,
  XMLSerializer?: typeof XMLSerializer,
}) {
  ({
    // Default to existing value if option not supplied.
    document = document,
    DOMParser = DOMParser,
    XMLSerializer = XMLSerializer,
  } = dependencies);
}

/**
 * Namespace for Blockly's XML.
 *
 * @alias Blockly.utils.xml.NAME_SPACE
 */
export const NAME_SPACE = 'https://developers.google.com/blockly/xml';

/**
 * Get the document object to use for XML serialization.
 *
 * @returns The document object.
 * @alias Blockly.utils.xml.getDocument
 */
export function getDocument(): Document {
  return document;
}

/**
 * Get the document object to use for XML serialization.
 *
 * @param xmlDocument The document object to use.
 * @alias Blockly.utils.xml.setDocument
 */
export function setDocument(xmlDocument: Document) {
  document = xmlDocument;
}

/**
 * Create DOM element for XML.
 *
 * @param tagName Name of DOM element.
 * @returns New DOM element.
 * @alias Blockly.utils.xml.createElement
 */
export function createElement(tagName: string): Element {
  return document.createElementNS(NAME_SPACE, tagName);
}

/**
 * Create text element for XML.
 *
 * @param text Text content.
 * @returns New DOM text node.
 * @alias Blockly.utils.xml.createTextNode
 */
export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

/**
 * Converts an XML string into a DOM tree.
 *
 * @param text XML string.
 * @returns The DOM document.
 * @throws if XML doesn't parse.
 * @alias Blockly.utils.xml.textToDomDocument
 */
export function textToDomDocument(text: string): Document {
  const oParser = new DOMParser();
  return oParser.parseFromString(text, 'text/xml');
}

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 *
 * @param dom A tree of XML nodes.
 * @returns Text representation.
 * @alias Blockly.utils.xml.domToText
 */
export function domToText(dom: Node): string {
  const oSerializer = new XMLSerializer();
  return oSerializer.serializeToString(dom);
}
