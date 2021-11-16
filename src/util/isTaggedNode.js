
"use strict";

// check tag has name t
const isTaggedNode = (node) => {
    return node.tag && node.tag.name == "t";
};

module.exports = isTaggedNode;
