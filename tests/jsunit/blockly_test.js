/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
'use strict';

function test_genUid() {
  var uuids = {};
  for (var i = 0; i < 1000; i++) {
    var uuid = Blockly.genUid();
    assertFalse('UUID different: ' + uuid, uuid in uuids);
    uuids[uuid] = true;
  }
}

function test_addClass() {
  var p = document.createElement('p');
  Blockly.utils.addClass_(p, 'one');
  assertEquals('Adding "one"', 'one', p.className);
  Blockly.utils.addClass_(p, 'one');
  assertEquals('Adding duplicate "one"', 'one', p.className);
  Blockly.utils.addClass_(p, 'two');
  assertEquals('Adding "two"', 'one two', p.className);
  Blockly.utils.addClass_(p, 'two');
  assertEquals('Adding duplicate "two"', 'one two', p.className);
  Blockly.utils.addClass_(p, 'three');
  assertEquals('Adding "three"', 'one two three', p.className);
}

function test_removeClass() {
  var p = document.createElement('p');
  p.className = ' one three  two three  ';
  Blockly.utils.removeClass_(p, 'two');
  assertEquals('Removing "two"', 'one three three', p.className);
  Blockly.utils.removeClass_(p, 'four');
  assertEquals('Removing "four"', 'one three three', p.className);
  Blockly.utils.removeClass_(p, 'three');
  assertEquals('Removing "three"', 'one', p.className);
  Blockly.utils.removeClass_(p, 'ne');
  assertEquals('Removing "ne"', 'one', p.className);
  Blockly.utils.removeClass_(p, 'one');
  assertEquals('Removing "one"', '', p.className);
  Blockly.utils.removeClass_(p, 'zero');
  assertEquals('Removing "zero"', '', p.className);
}

function test_shortestStringLength() {
  var len = Blockly.utils.shortestStringLength('one,two,three,four,five'.split(','));
  assertEquals('Length of "one"', 3, len);
  len = Blockly.utils.shortestStringLength('one,two,three,four,five,'.split(','));
  assertEquals('Length of ""', 0, len);
  len = Blockly.utils.shortestStringLength(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.shortestStringLength([]);
  assertEquals('Empty list', 0, len);
}

function test_commonWordPrefix() {
  var len = Blockly.utils.commonWordPrefix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.utils.commonWordPrefix('Xone,Xtwo,Xthree,Xfour,Xfive'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.utils.commonWordPrefix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.utils.commonWordPrefix('abc deX,abc deY'.split(','));
  assertEquals('One word prefix', 4, len);
  len = Blockly.utils.commonWordPrefix('abc de,abc deY'.split(','));
  assertEquals('Overflow no', 4, len);
  len = Blockly.utils.commonWordPrefix('abc de,abc de Y'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.utils.commonWordPrefix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.commonWordPrefix([]);
  assertEquals('Empty list', 0, len);
  len = Blockly.utils.commonWordPrefix('turn&nbsp;left,turn&nbsp;right'.split(','));
  assertEquals('No prefix due to &amp;nbsp;', 0, len);
  len = Blockly.utils.commonWordPrefix('turn\u00A0left,turn\u00A0right'.split(','));
  assertEquals('No prefix due to \\u00A0', 0, len);
}

function test_commonWordSuffix() {
  var len = Blockly.utils.commonWordSuffix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.utils.commonWordSuffix('oneX,twoX,threeX,fourX,fiveX'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.utils.commonWordSuffix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.utils.commonWordSuffix('Xabc de,Yabc de'.split(','));
  assertEquals('One word prefix', 3, len);
  len = Blockly.utils.commonWordSuffix('abc de,Yabc de'.split(','));
  assertEquals('Overflow no', 3, len);
  len = Blockly.utils.commonWordSuffix('abc de,Y abc de'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.utils.commonWordSuffix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.commonWordSuffix([]);
  assertEquals('Empty list', 0, len);
}

function test_tokenizeInterpolation() {
  var tokens = Blockly.utils.tokenizeInterpolation('');
  assertArrayEquals('Null interpolation', [], tokens);
  tokens = Blockly.utils.tokenizeInterpolation('Hello');
  assertArrayEquals('No interpolation', ['Hello'], tokens);
  tokens = Blockly.utils.tokenizeInterpolation('Hello%World');
  assertArrayEquals('Unescaped %.', ['Hello%World'], tokens);
  tokens = Blockly.utils.tokenizeInterpolation('Hello%%World');
  assertArrayEquals('Escaped %.', ['Hello%World'], tokens);
  tokens = Blockly.utils.tokenizeInterpolation('Hello %1 World');
  assertArrayEquals('Interpolation.', ['Hello ', 1, ' World'], tokens);
  tokens = Blockly.utils.tokenizeInterpolation('%123Hello%456World%789');
  assertArrayEquals('Interpolations.', [123, 'Hello', 456, 'World', 789], tokens);
  tokens = Blockly.utils.tokenizeInterpolation('%%%x%%0%00%01%');
  assertArrayEquals('Torture interpolations.', ['%%x%0', 0, 1, '%'], tokens);
}
