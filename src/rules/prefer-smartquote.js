"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");
const isTaggedNode = require("../util/isTaggedNode");

const DOUBLE_QUOTE = "\"";
const OPEN_SMART_QUOTE = "“";
const CLOSE_SMART_QUOTE = "”";

const APOSTROPHE = "'";
const SMART_APOSTROPHE = "’";

const ENTITIES = new Map([
    [DOUBLE_QUOTE, [OPEN_SMART_QUOTE, CLOSE_SMART_QUOTE]],
    [APOSTROPHE, SMART_APOSTROPHE], 
]);

const getIncludedRanges = (node) =>  {
    let ranges = [];
  
    const addToRanges = (node) => {
        if (node.raw && !node.children) {
            ranges.push(node.loc);
        }
        if (!node.children) return;
        for (let i=0; i<node.children.length; i++) {
            const child = node.children[i];
            ranges = ranges.concat(getIncludedRanges(child));
        }
    };
    addToRanges(node);
    
    return ranges;
};

const shouldInclude = ({ includedRanges, candidateLoc}) => {
    const {line, column} = candidateLoc;
    for (let i=0; i<includedRanges.length; i+=1) {
        const {start, end} = includedRanges[i];
        if (line>start.line && line<end.line) {
            return true;
        }
        // one line
        if (start.line === end.line) {
            if (column>=start.column && column<end.column) {
                return true;  
            }
        } else {
            // multi-line
            if (line === start.line && column >= start.column) {
                return true;
            }
            if (line === end.line && column < end.column) {
                return true;
            }
        }
    }
    return false;
};

const getViolations = ({ context, node, includedRanges }) => {
    const violations = [];

    const { start, end } = node.loc;

    for (let line=start.line-1; line<end.line; line++) {
        const lineText = context.getSourceCode().lines[line];
        for (let i=0; i<lineText.length; i++) {
            const candidateLoc = {line: line+1, column: i};
            if (
                ENTITIES.has(lineText[i]) 
                && shouldInclude({includedRanges, candidateLoc})
            ) {
                violations.push(candidateLoc);
            }
        }
    }
    return violations;
};

const getFixedNodeText = ({ node, nodeText, includedRanges }) => {
  
    // initialize
    let row = node.loc.start.line;

    const startCol = node.loc.start.column;
    let col = startCol;
  
    const fixedNodeText = nodeText.split("");
    const entitiesReplaced = new Map();

    for (let i=0; i<nodeText.length; i++) {
        const char = nodeText[i];
            
        const replaceWith = ENTITIES.get(nodeText[i]);
  
        const candidateLocCol = (node.loc.start.line!==node.loc.end.line) ? col-startCol : col;
        const candidateLoc = {
            line: row,
            column: candidateLocCol,
        };

        const shouldReplace = shouldInclude({ includedRanges, candidateLoc });
  
        if (shouldReplace && replaceWith) {
            if (!entitiesReplaced.get(char)) {
                entitiesReplaced.set(char, 0);
            }
            if (typeof replaceWith === "string") {
                fixedNodeText[i] = replaceWith;
            } else {
                fixedNodeText[i] = replaceWith[entitiesReplaced.get(char) % 2];
            }
      
            entitiesReplaced.set(char, entitiesReplaced.get(char)+1);
        }
  
        if (char === "\n") {
            row++;
            col = startCol;
        } else {
            col++;
        }
    }
    return fixedNodeText.join(""); 
};

const getReports = ({ context, node }) => {
    const nodeText = context.getSourceCode().getText(node);
    const includedRanges = getIncludedRanges(node);
    const violations = getViolations({ context, node, includedRanges });
    for (let i=0; i<violations.length; i+=1) {
        const { line, column } = violations[i]; 
        
        context.report({
            node,
            message: "Prefer smartquote.",
            loc: {
                start: {
                    line,
                    column,
                },
                end: {
                    line,
                    column: column+1,
                },
            },
            fix: fixer => fixer.replaceText(
                node,
                getFixedNodeText({ node, nodeText, includedRanges }),    
            ),
        });
    }
};

const getViolationsOnTaggedNode = (node) => {
    let violations = [];
    const { quasis } = node.quasi;
    for (let i=0; i<quasis.length; i+=1) {
        const { value, loc } = quasis[i];
        for (let j=0; j<value.raw.length; j+=1) {
            if (ENTITIES.has(value.raw[j])) {
                violations.push({line: loc.start.line, column: loc.start.column+j+1 });
            }
        }
    }
    return violations;
};

const reportTaggedNode = ({context, node}) => {
    const violations = getViolationsOnTaggedNode(node);
    const nodeText = context.getSourceCode().getText(node);
    const includedRanges = node.quasi.quasis.map(({loc}) => loc);

    for (let i=0; i<violations.length; i+=1) {
        const { line, column } = violations[i];
        context.report({
            node,
            message: "Prefer smartquote.",
            loc: {
                start: {
                    line,
                    column,
                },
                end: {
                    line,
                    column: column+1,
                },
            },
            fix: fixer => fixer.replaceText(
                node,
                getFixedNodeText({ node, nodeText, includedRanges }),
            ),
        });
    }
};
module.exports = {
    meta: {
        docs: {
            url: "https://github.com/OkCupid/eslint-plugin-i18n-lingui/blob/main/docs/rules/prefer-smartquote.md",
        },
        fixable: "code",
        schema: [],
    },
    create: function (context) {
        return {
            JSXElement(node) {
                if (hasOpeningElementTrans(node)) {
                    getReports({context, node});
                }
            },
            TaggedTemplateExpression(node) {
                if (isTaggedNode(node)) {
                    reportTaggedNode({context, node});
                }
            },
        };
    },
};
