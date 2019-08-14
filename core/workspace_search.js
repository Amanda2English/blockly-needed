/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Utility functions for handling searches within the Toolbox.
  * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.Search');

goog.require('goog.structs.Set');
goog.require('goog.structs.Trie');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.tree.TreeNode');

 /**
 * Initializes the search button.
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 * @param {!Blockly.Toolbox} toolbox The toolbox containing the search category.
 */
Blockly.Search = function(workspace) {
  this.workspace_ = workspace;
  var thisObj = this;

  setTimeout(function() {
    if (thisObj.workspace_.isFlyout) {
      return;
    }
    
    thisObj.searchMenu_ = document.getElementById("workspaceSearchDiv");
    
    thisObj.searchInput_ = document.getElementById("workspaceSearchInput");

    thisObj.resultsNumberHolder_ = document.getElementById("resultsCount");
    
    thisObj.buttonsHolder_ = document.getElementById("buttonsHolder");
    thisObj.prevButton_ = document.getElementById("prevWorkspaceHolder");
    thisObj.nextButton_ = document.getElementById("nextWorkspaceHolder");
    // let closeButton = document.getElementById("closeWorkspaceHolder");


    thisObj.resultsNumberHolder_.style.minWidth = "0px";
    thisObj.resultsNumberHolder_.style.maxWidth = "0px";
    thisObj.buttonsHolder_.style.maxWidth = "0px";

    // thisObj.searchInput_ = document.createElement("input");
    // thisObj.searchInput_.setAttribute("id", "workspaceSearchInput");
    // thisObj.searchInput_.setAttribute("placeholder", "Search");
    // thisObj.searchInput_.setAttribute("type", "search");

    // document.getElementById("workspaceSearchInputHolder").appendChild(thisObj.searchInput_);
    
    thisObj.blockTrie_ = new goog.structs.Trie;
    
    thisObj.workspace_.addChangeListener(function(event) {
      thisObj.onNewWorkspaceEvent(event); 
    });

    thisObj.searchInput_.addEventListener("keydown", function(event) {
      event.stopPropagation();
    });

    thisObj.searchInput_.addEventListener("click", function(event) {
      event.stopPropagation();

      thisObj.resultsNumberHolder_.style.minWidth = "50px";
      thisObj.resultsNumberHolder_.style.maxWidth = "50px";
      thisObj.buttonsHolder_.style.maxWidth = "140px";
    });

    thisObj.searchInput_.addEventListener("blur", function(event) {
      if (event.relatedTarget && 
        ((event.relatedTarget.id && event.relatedTarget.id == "workspaceSearchDiv") || 
        (event.relatedTarget.id && event.relatedTarget.id == "resultsCount") || 
        (event.relatedTarget.id && event.relatedTarget.id == "prevWorkspaceHolder") || 
        (event.relatedTarget.id && event.relatedTarget.id == "nextWorkspaceHolder") || 
        (event.relatedTarget.id && event.relatedTarget.id == "closeWorkspaceHolder"))) {
          event.stopPropagation();
          thisObj.focusSearchField();
          return;
        }
        
      thisObj.onBlur(event);
    })

    thisObj.searchInput_.addEventListener("search", function(event) {
      event.preventDefault();
      
      if (thisObj.searchInput_.value.length == 0) {
        thisObj.searchInput_.blur();
        thisObj.onBlur(event);
        return;
      }

      // thisObj.executeSearchOnKeyUp(event, thisObj);
    })

    thisObj.searchInput_.addEventListener("keyup", function(event) {
      thisObj.executeSearchOnKeyUp(event, thisObj);
    });


    thisObj.nextButton_.addEventListener("click", function(event) { 
      event.preventDefault();
      thisObj.showNextResult(true);
    });

    thisObj.prevButton_.addEventListener("click", function(event) { 
      event.preventDefault();
      thisObj.showNextResult(false);
    });

    // closeButton.addEventListener("click", function(event) { 
    //   event.preventDefault();
    //   thisObj.searchInput_.blur();
    //   thisObj.onBlur(event);
    // });
    
  }, 100);
};

Blockly.Search.prototype.onNewWorkspaceEvent = function(event) {
  // console.log(event);

  if (event.type == Blockly.Events.CREATE) {
    // console.log("CREATE");
    // console.log(event.blockId);
    // console.log(event.ids);
    for (var i = 0; i < event.ids.length; i++) {
      var id = event.ids[i];
      var block = this.workspace_.getBlockById(id);

      if (block) {
        this.onBlockAdded(block);
      }
    }
  }
  else if (event.type == Blockly.Events.DELETE) {
    // console.log("DELETE");
    // console.log(event.blockId);
    // console.log(event.oldXml);

    Blockly.Events.disable();

    // for (var i = 0; i < event.ids.length; i++) {
    var block = Blockly.Xml.domToBlockHeadless_(event.oldXml, this.workspace_);
    if (block) {
      this.onBlockRemoved(block);
      block.dispose();
    }
   // }

    Blockly.Events.enable();
  }
  // else if (event.type == Blockly.Events.CHANGE) {
    // console.log("CHANGE");
    // console.log(event.blockId);
    // console.log(event.element);
    // console.log(event.oldValue);
    // console.log(event.newValue);
  // }
};

Blockly.Search.prototype.addToTrie = function(key, value) {
  if (!this.blockTrie_.containsKey(key)) {
    this.blockTrie_.add(key, []);
  }

  this.blockTrie_.set(key, this.blockTrie_.get(key).concat(value));
};

Blockly.Search.prototype.removeFromTrie = function(key, value) {
  if (!this.blockTrie_.containsKey(key)) {
    return;
  }

  if (value in this.blockTrie_.get(key)) {
    this.blockTrie_.set(key, this.blockTrie_.get(key).pop(value));
  }
}

Blockly.Search.prototype.onBlockAdded = function(block) {
  var keys = block.keywordsList;

  for (var j = 0; j < keys.length; j++) {
    this.addToTrie(keys[j], block.id);
  }
};

Blockly.Search.prototype.onBlockRemoved = function(block) {
  var keys = block.keywordsList;
  
  for (var j = 0; j < keys.length; j++) {
    this.removeFromTrie(keys[j], block.id);
  }
};

Blockly.Search.prototype.blocksMatchingSearchTerm = function(term) {
  if (!this.blockTrie_) {
    return [];
  }

  var keys = this.blockTrie_.getKeys(term.toLowerCase());
  var blocks = [];

    for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var blocksForKey = this.blockTrie_.get(key);

    for (var j = 0; j < blocksForKey.length; j++) {
      blocks.push(blocksForKey[j]);
    }
  }

  return blocks;
}

Blockly.Search.prototype.blocksMatchingSearchTerms = function(terms) {
  var intersectingMatches = null;

    for (var i = 0; i < terms.length; i++) {

      if (terms[i].length == 0) {
        continue;
      }

    var matchSet = new goog.structs.Set(this.blocksMatchingSearchTerm(terms[i]));
    if (intersectingMatches) {
      intersectingMatches = intersectingMatches.intersection(matchSet);
    } else {
      intersectingMatches = matchSet;
    }
  }

    return intersectingMatches.getValues();
};

Blockly.Search.prototype.executeSearchOnKeyUp = function(e) {
  var search = this;

  //Clear the search and unfocus the search box.
  if (e.keyCode == 27) {
    search.searchInput_.blur();
    search.onBlur(e);
    return;
  }
  else if (e.keyCode == 13) {
    search.showNextResult(true);
    return;
  }

  var searchTerms = e.target.value.trim().toLowerCase().split(/\s+/);

  searchTerms = goog.array.filter(searchTerms, function (term) {
    return term.length > 0;
  });

  var matchingBlockIds = [];

  search.finalResults_ = [];

  if (searchTerms.length > 0) {
    matchingBlockIds = search.blocksMatchingSearchTerms(searchTerms);
  }

  if (matchingBlockIds.length > 0) {
    var counter = 0;

    while (counter < matchingBlockIds.length) {
        var block = search.workspace_.getBlockById(matchingBlockIds[counter]);
        
        if (block) {
          search.finalResults_.push(block);
        }

        counter++;
    }
  }

  search.currentIndex = -1;
  search.showNextResult(true);
};

Blockly.Search.prototype.showNextResult = function(direction) {
  var search = this;

  if (search.finalResults_.length == 0) {
    search.workspace_.highlightBlock("");
    if (search.currentResult) {
        search.currentResult.unselect();
    }
    search.resultsNumberHolder_.innerHTML = "0/0";
    // search.nextButton_.disabled = true;
    // search.prevButton_.disabled = true;
    return;
  }

  // search.nextButton_.disabled = false;
  // search.prevButton_.disabled = false;

  if (direction) {
    search.currentIndex++;
  }
  else {
    search.currentIndex--;
  }

  if (search.finalResults_.length <= search.currentIndex) {
    search.currentIndex = 0;
  }
  else if (search.currentIndex < 0) {
    search.currentIndex = search.finalResults_.length - 1;
  }

  search.resultsNumberHolder_.innerHTML = (search.currentIndex + 1) + "/" + (search.finalResults_.length);

  search.currentResult = search.finalResults_[search.currentIndex];
  search.currentResult.select();
  search.workspace_.centerOnBlock(search.currentResult.id);
  search.workspace_.highlightBlock(search.currentResult.id);
  return;
};

Blockly.Search.prototype.onBlur = function(e) {
  var search = this;
  search.workspace_.highlightBlock("");

  if (search.currentResult) {
      search.currentResult.unselect();
  }

  search.searchInput_.value = "";

  search.resultsNumberHolder_.innerHTML = "";

  // search.searchMenu_.style.visibility = "hidden";
  search.resultsNumberHolder_.style.minWidth = "0px";
  search.resultsNumberHolder_.style.maxWidth = "0px";
  search.buttonsHolder_.style.maxWidth = "0px";

  search.finalResults_ = [];
};

Blockly.Search.prototype.focusSearchField = function() {
  // this.searchMenu_.style.visibility = "visible";
  this.resultsNumberHolder_.style.minWidth = "50px";
  this.resultsNumberHolder_.style.maxWidth = "50px";
  this.buttonsHolder_.style.maxWidth = "140px";

  this.searchInput_.focus();
};