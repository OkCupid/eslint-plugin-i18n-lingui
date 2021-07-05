"use strict";

const hasOpeningElementTrans = require("../util/hasOpeningElementTrans");

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/xiaoyunyang/eslint-plugin-react-i18n/tree/main/docs/rules/prefer-unicode-ellipsis.md"
        }
    },
    create: function (context) {
        const childWithThreePeriods = (node) => node.children.find(
            c => /\.{3}/.test(c.value)
        )

        return {
            JSXElement(node) {
                if(hasOpeningElementTrans(node) && childWithThreePeriods(node)) {
                    context.report({
                        node: childWithThreePeriods(node),
                        message: "Use unicode ellipsis instead of three periods"
                    });
                }
            }
        }
    }
}
