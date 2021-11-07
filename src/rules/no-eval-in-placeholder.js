"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");

const disallowedExpressionTypes = [
  "BinaryExpression",
  "UnaryExpression",
  "CallExpression"
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
