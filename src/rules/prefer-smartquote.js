"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");

const DOUBLE_QUOTE = "\"";
const OPEN_SMART_QUOTE = "“";
const CLOSE_SMART_QUOTE = "”";

const APOSTROPHE = "'";
const SMART_APOSTROPHE = "’";

const ENTITIES = new Map([
    [DOUBLE_QUOTE, [OPEN_SMART_QUOTE, CLOSE_SMART_QUOTE]],
    [APOSTROPHE, SMART_APOSTROPHE], 
]);

const shouldExclude = ({excludedRanges, candidateLoc}) => {
    const {line, column} = candidateLoc;
    for (let i=0; i<excludedRanges.length; i+=1) {
        const {start, end} = excludedRanges[i];
        if (
            line >= start.line 
            && line <= end.line
            && column >= start.column 
            && column < end.column
        ) {
            return true;
        }
    }
    return false;
};

const getViolations = ({context, node}) => {
    const violations = [];

    const { start, end } = node.loc;
    const excludedRanges = node.children.filter(child => !child.raw).map(({loc}) => loc);

    for (let line=start.line-1; line<end.line; line++) {
        const lineText = context.getSourceCode().lines[line];
        for (let i=0; i<lineText.length; i++) {
            const candidateLoc = {line: line+1, column: i};
            if (
                ENTITIES.has(lineText[i]) 
                && !shouldExclude({excludedRanges, candidateLoc})
            ) {
                violations.push(candidateLoc);
            }
        }
    }
    return violations;
};

const getReplaceWith = ({
    nodeText, violationOffset,
}) => {
    const disallowedEntity = nodeText[violationOffset];
    const replaceWith = ENTITIES.get(disallowedEntity);
    // apostrophe
    if (typeof replaceWith === "string") {
        return replaceWith;
    }
    
    // double quote
    let numDoubleQuotes = 0;
    for (let i=0; i<nodeText.length; i+=1) {
        if (nodeText[i]===DOUBLE_QUOTE) {
            if (i === violationOffset) return replaceWith[numDoubleQuotes];
            numDoubleQuotes++;
        }
    }
    
    return null;
};
const getFixedMultilineNodeText = ({ node, nodeText, violations }) => {

    // Big assumption here is we won't have a dangling double quote.
    // All the double quote pairs are on the same line
    const nodeStart = node.loc.start;
    const lineTexts = nodeText.split("\n");
    
    const chars = [];
    for (let i=0; i<lineTexts.length; i++) {
        const row = lineTexts[i].split("");
        chars.push(row);
    }
    for (let i=0; i<violations.length; i++) {
        const violation = violations[i];
        const row = violation.line-nodeStart.line;
        const col = violation.column;
        const replaceWith = getReplaceWith({
            nodeText: lineTexts[row],
            violationOffset: col,
        });
        if (!replaceWith) continue;
        chars[row][col] = replaceWith;
    }
    
    const fixedLines = [];
    for (let i=0; i<chars.length; i++) {
        const rowText = chars[i].join("");
        fixedLines.push(rowText);
    }
    return fixedLines.join("\n");
};

const fixNode = ({ node, nodeText, violations }) => fixer => {
    const fixedNodeText = nodeText.split("");
    const nodeStart = node.loc.start;
    const nodeEnd = node.loc.end;

    if (nodeStart.line !== nodeEnd.line) {
        const fixedNodeText = getFixedMultilineNodeText({ node, nodeText, violations });
        return fixer.replaceText(node, fixedNodeText);
    }
    
    for (let i=0; i<violations.length; i+=1) {
        const violationCol = violations[i].column;
        const offset = violationCol - nodeStart.column;
        const replaceWith = getReplaceWith({ 
            nodeText,
            violationOffset: offset,
        });
        if (!replaceWith) continue;
        fixedNodeText[offset] = replaceWith;
    }
    return fixer.replaceText(node, fixedNodeText.join(""));
};
  

const getReports = ({ context, node }) => {
    const violations = getViolations({ context, node });
    for (let j=0; j<violations.length; j+=1) {
        const {line, column } = violations[j]; 
        
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
            fix: fixNode({
                node,
                nodeText: context.getSourceCode().getText(node),
                violations,
            }),
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
        };
    },
};
