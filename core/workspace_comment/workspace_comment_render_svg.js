/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods for rendering a workspace comment as SVG
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg.render');

goog.require('Blockly.WorkspaceCommentSvg');


/**
 * Width of the border around the text area.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.BORDER_WIDTH = 10;

/**
 * Offset from the foreignobject edge to the textarea edge.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET = 4;

Blockly.WorkspaceCommentSvg.prototype.render = function() {
  this.rendered_ = true;

  this.setPath_(this.getHeight(), this.getWidth());

  // Add text area
  // TODO: Does this need to happen every time?  Or are we orphaning foreign
  // elements in the code?
  this.createEditor_();
  this.svgGroup_.appendChild(this.foreignObject_);

  var borderWidth = Blockly.WorkspaceCommentSvg.BORDER_WIDTH;
  var textOffset = borderWidth + Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET;

  this.foreignObject_.setAttribute('width',
      this.getWidth() - doubleBorderWidth);
  this.foreignObject_.setAttribute('height',
      this.getHeight() - doubleBorderWidth);
  this.textarea_.style.width =
      (this.getWidth() - textOffset) + 'px';
  this.textarea_.style.height =
      (this.getHeight() - textOffset) + 'px';

  // Set the content
  this.textarea_.value = this.content_;
};

/**
 * Set the path of the comment outline.
 * @param {number} height Height of the container.
 * @param {number} width Width of the container.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.setPath_ = function(height, width) {
  var steps = [];
  steps.push('m 0,0');
  steps.push('H', width);
  steps.push('v', height);
  steps.push('H 0');
  steps.push('z');

  var pathString = steps.join(' ');
  this.svgPath_.setAttribute('d', pathString);
};

/**
 * Create the text area for the comment.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject x="8" y="8" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.utils.createSvgElement('foreignObject',
      {'x': Blockly.WorkspaceCommentSvg.BORDER_WIDTH / 2,
       'y': Blockly.WorkspaceCommentSvg.BORDER_WIDTH / 2},
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(
      /* eslint-disable no-unused-vars */ e
      /* eslint-enable no-unused-vars */) {
    if (this.content_ != textarea.value) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.block_, 'comment', null, this.content_, textarea.value));
      this.content_ = textarea.value;
    }
  });
  setTimeout(function() {
    textarea.focus();
  }, 0);
  return this.foreignObject_;
};
