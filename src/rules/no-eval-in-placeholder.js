"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/xiaoyunyang/eslint-plugin-react-i18n/tree/main/docs/rules/no-eval-in-placeholder.md"
        }
    },
    create: function (context) {
        const childWithEval = (node) => node.children.find(
            c => c.type === "JSXExpressionContainer" && c.expression.type !== "Identifier"
        );

        return {
            JSXElement(node) {
            if(
                 hasOpeningElementTrans(node)
              && childWithEval(node)
            ) {
              context.report({
                node: childWithEval(node),
                message: "No evaluation inside placeholder of localized string"
              });
            }
          }
        };
    }
}
