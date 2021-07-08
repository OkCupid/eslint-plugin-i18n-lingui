"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");

const THREE_PERIODS_REGEX = /\.{3}/;
const ELLIPSIS_UNICODE = "…";

const REPORT_MESSAGE = `Use unicode ellipsis (${ELLIPSIS_UNICODE}) instead of three periods`;

const hasEllipsis = (s) => THREE_PERIODS_REGEX.test(s);

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/xiaoyunyang/eslint-plugin-react-i18n/tree/main/docs/rules/prefer-unicode-ellipsis.md"
        },
        fixable: "ellipsis"
    },
    create: function (context) {
        const childWithThreePeriods = (node) => node.children.find(c => hasEllipsis(c.value));

        return {
            JSXElement(node) {
              
              if(!hasOpeningElementTrans(node)) return;
              
              const offendingNode = childWithThreePeriods(node);

              if (!offendingNode) return;
              
              context.report({
                node: offendingNode,
                message: REPORT_MESSAGE,
                fix: function(fixer) {
                  const fixedText = offendingNode.raw.replace(THREE_PERIODS_REGEX, ELLIPSIS_UNICODE)
                  return fixer.replaceText(offendingNode, fixedText)
                }
              });
            },
            TaggedTemplateExpression(node) {
              // check tag has name t
              if (!node.tag || node.tag.name !== "t") return;
              if (!node.quasi || !node.quasi.quasis) return;
        
              const candidates = node.quasi.quasis;
        
              const offendingNode = candidates.find((c) => hasEllipsis(c.value.raw));
              if (!offendingNode) return;
              context.report({
                node: offendingNode,
                message: REPORT_MESSAGE,
                fix: function (fixer) {
                  const fixedText = offendingNode.value.raw.replace(THREE_PERIODS_REGEX, ELLIPSIS_UNICODE);
                  const { start, end } = offendingNode;
                  const range = [start, end];
                  return fixer.replaceTextRange(range, fixedText);
                }
              });
            }
        }
    }
}
