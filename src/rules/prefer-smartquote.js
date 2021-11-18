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

const getExcludedRanges = (node) =>  {
    let excludedRanges = [];
  
    const addToExcludedRanges = (node) => {
        if (!node.raw && !node.children) {
            excludedRanges.push(node.loc);
        }
        if (!node.children) return;
        for (let i=0; i<node.children.length; i++) {
            const child = node.children[i];
            excludedRanges = excludedRanges.concat(getExcludedRanges(child));
        }
    };
    addToExcludedRanges(node);
    
    return excludedRanges;
};

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

const getViolations = ({ context, node, excludedRanges }) => {
    const violations = [];

    const { start, end } = node.loc;

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

const getFixedNodeText = ({ node, nodeText, excludedRanges }) => {
  
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

        const shouldReplace = !shouldExclude({excludedRanges, candidateLoc});
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
    const excludedRanges = getExcludedRanges(node);
    const violations = getViolations({ context, node, excludedRanges });
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
            fix: fixer => {
                return fixer.replaceText(
                    node, getFixedNodeText({
                        node, 
                        nodeText:context.getSourceCode().getText(node),
                        excludedRanges,
                    }),
                );
            },
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
