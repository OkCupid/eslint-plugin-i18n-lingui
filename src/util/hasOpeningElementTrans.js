"use strict";

const hasOpeningElementTrans = (node) => (
    node.openingElement
    && !node.openingElement.selfClosing
    && node.openingElement.type === "JSXOpeningElement"
    && node.openingElement.name.name === "Trans"
);

module.exports = hasOpeningElementTrans;
