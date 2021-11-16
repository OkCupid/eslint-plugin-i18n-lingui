"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");

const DOUBLE_QUOTE = "\""
const OPEN_SMART_QUOTE = "“"
const CLOSE_SMART_QUOTE = "”"

const APOSTROPHE = "\'"
const SMART_APOSTROPHE = "\’"

const ENTITIES = new Map([
 [DOUBLE_QUOTE, [OPEN_SMART_QUOTE, CLOSE_SMART_QUOTE]],
 [APOSTROPHE, SMART_APOSTROPHE], 
]);

const getReplaceWith = ({
  node, disallowedEntity, violationCol, siblingNodes
 }) => {
  const replaceWith = ENTITIES.get(disallowedEntity)
  // apostrophe
  if(typeof replaceWith === "string") {
    return replaceWith
  }
  
  // double quote
  // TODO: optimization - pass the running list of entities to this function?
  let entities = []
  for(let i=0; i<siblingNodes.length; i+=1) {
    const raw = siblingNodes[i].raw
    if(!raw) continue
    const childStart = siblingNodes[i].loc.start
    const chars = raw.split("")
    for(let j=0; j<chars.length; j+=1) {
      if(chars[j]===DOUBLE_QUOTE) {
          entities.push({
            line: childStart.line,
            column: childStart.column+j
          })
        }
    }
  }
  
  const violationLoc = {
    line: node.loc.start.line,
    column: violationCol
  }
  
  const foundIndex = entities.findIndex(({line, column}) => 
    column === violationLoc.column
  );

  if(foundIndex === -1) return null;
  return replaceWith[foundIndex % 2];
}
// const getFix = ({ node, disallowedEntity, violationCol, siblingNodes }) => fixer => {
//   const replaceWith = getReplaceWith({
//   	node, disallowedEntity, violationCol, siblingNodes
//   })
//   if(!replaceWith) return
  
//   const fixedText = node.raw.replace(disallowedEntity, replaceWith)
//   return fixer.replaceText(node, fixedText)  
// }

const fixNode = ({ node, violations, siblingNodes }) => fixer => {
  // Fix every violation of the node all at once
  const fixedRaw = node.raw.split("")
  for(let i=0; i<violations.length; i+=1) {
    const disallowedEntity = fixedRaw[violations[i]]
    const violationCol = node.loc.start.column+violations[i]
    const replaceWith = getReplaceWith({ node, disallowedEntity, violationCol, siblingNodes})
    if(!replaceWith) continue
    fixedRaw[violations[i]] = replaceWith
  }
  
  return fixer.replaceText(node, fixedRaw.join(""))
}

const getReports = ({ context, children }) => {
  for(let i=0; i<children.length; i+=1) {
    const child = children[i]
    const childStart = child.loc.start
  	const raw = child.raw
    
    if(!raw) continue;
    
    const violations = []
    for(let j=0; j<raw.length; j+=1) {
      if(ENTITIES.has(raw[j])) {
       	violations.push(j) 
      }
    }
    
   	for(let j=0; j<violations.length; j+=1) {
      const violationCol = childStart.column+violations[j]
      const disallowedEntity = child.raw.charAt(violations[j])
      // TODO: reports at the wrong place for multi-line
    	context.report({
          node: child,
          message: "Prefer smartquote.",
          loc: {
            start: {
              line: childStart.line,
              column: violationCol
            },
            end: {
              line: childStart.line,
              column: violationCol+1
            }
          },
          // fix: getFix({
          //   node: child,
          //   violationCol,
          //   disallowedEntity,
          //   siblingNodes: children 
          // })
      })
      if(violations.length) {
        context.report({
            node: child,
            message: "fix this child.",
            loc: {
              start: {
                line: childStart.line,
                column: 0
              },
              end: {
                line: childStart.line,
                column: 0
              }
            },
            fix: fixNode({
              node: child,
              violations,
              siblingNodes: children
           }) 
          })
      }
    }  
  }
}

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/OkCupid/eslint-plugin-i18n-lingui/blob/main/docs/rules/prefer-smartquote.md"
        },
        fixable: "code"
    },
    create: function (context) {
        return {
            JSXElement(node) {
              if(hasOpeningElementTrans(node)) {
                getReports({context, children: node.children})
              }
            },
        }
    }
}
