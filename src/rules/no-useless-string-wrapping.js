"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");
const isTaggedNode = require("../util/isTaggedNode");

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/OkCupid/eslint-plugin-i18n-lingui/blob/main/docs/rules/no-useless-string-wrapping.md"
        }
    },
    create: function (context) {
        return {
            TaggedTemplateExpression(node) {
                if (!isTaggedNode(node)) return;
                if(
                    node.quasi.expressions.length !== 1 ||
                    node.quasi.quasis.filter(q => q.value.raw !== "").length > 0              
                ) {
                    return;
                }

                context.report({
                    node,
                    message: "No useless wrapped strings."
                });
            },
            JSXElement(node) {
                if(hasOpeningElementTrans(node)) {
                    const isUseless = node.children.length === 1 && node.children[0].type === "JSXExpressionContainer";
                    if(!isUseless) return;
                    context.report({
                        node,
                        message: "No useless wrapped strings"
                    });
                }
            }
        }
    }
}
