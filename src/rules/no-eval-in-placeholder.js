"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");
const isTaggedNode = require("../util/isTaggedNode");

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
        },
        schema: [],
    },
    create: function (context) {
        const getChildWithDisallowedEval = (node) => {
            for (let i=0; i<node.children.length; i+=1) {
                const c = node.children[i];
                if (
                    c.type === "JSXExpressionContainer" && disallowedExpressionTypes.includes(c.expression.type)
                ) {
                    return c;
                }
                if (c.type === "JSXElement") {
                    return getChildWithDisallowedEval(c);
                }
            }
            return null;
        };

        return {
            TaggedTemplateExpression(node) {
                if (!isTaggedNode(node)) return;
                if (!node.quasi || !node.quasi.expressions) return;
                const candidates = node.quasi.expressions;
                const offendingNode = candidates.find((c) => disallowedExpressionTypes.includes(c.type));
                if (!offendingNode) return;
                context.report({
                    node: offendingNode,
                    message: "No evaluation inside placeholder of localized string"
                });
            },
            JSXElement(node) {
                const childWithDisallowedEval = getChildWithDisallowedEval(node);
                if (
                    hasOpeningElementTrans(node)
              && childWithDisallowedEval
                ) {
                    context.report({
                        node: childWithDisallowedEval,
                        message: "No evaluation inside placeholder of localized string"
                    });
                }
            }
        };
    }
};
