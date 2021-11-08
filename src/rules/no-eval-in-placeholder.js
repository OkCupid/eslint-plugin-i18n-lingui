"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");

const disallowedExpressionTypes = [
  "BinaryExpression",
  "UnaryExpression",
  "CallExpression",
  "MemberExpression",
  "ChainExpression"
];

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/OkCupid/eslint-plugin-i18n-lingui/blob/main/docs/rules/no-eval-in-placeholder.md"
        }
    },
    create: function (context) {
        const childWithDisallowedEval = (node) => node.children.find(
          c => c.type === "JSXExpressionContainer" && disallowedExpressionTypes.includes(c.expression.type)
        );

        return {
          TaggedTemplateExpression(node) {
            // check tag has name t
              if (!node.tag || node.tag.name !== "t") return;
              if (!node.quasi || !node.quasi.expressions) return;
              const candidates = node.quasi.expressions
              const offendingNode = candidates.find((c) => disallowedExpressionTypes.includes(c.type))
              if(!offendingNode) return;
              context.report({
                node: offendingNode,
                message: "No evaluation inside placeholder of localized string"
              })
          },
          JSXElement(node) {
            if(
                 hasOpeningElementTrans(node)
              && childWithDisallowedEval(node)
            ) {
              context.report({
                node: childWithDisallowedEval(node),
                message: "No evaluation inside placeholder of localized string"
              });
            }
          }
        };
    }
}
