"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/xiaoyunyang/eslint-plugin-react-i18n/tree/main/docs/rules/prefer-unicode-ellipsis.md"
        },
        fixable: "ellipsis"
    },
    create: function (context) {
        const childWithThreePeriods = (node) => node.children.find(
            c => /\.{3}/.test(c.value)
        )

        return {
            JSXElement(node) {
              if (hasOpeningElementTrans(node)) {
                const offendingNode = childWithThreePeriods(node)
                if (!offendingNode) return;
                context.report({
                  node: offendingNode,
                  message: "Use unicode ellipsis instead of three periods",
                  fix: function(fixer) {
                    const fixedText = offendingNode.raw.replace(/\.{3}/, "…")
                    return fixer.replaceText(offendingNode, fixedText)
                  }
                });
              }
            }
        }
    }
}
