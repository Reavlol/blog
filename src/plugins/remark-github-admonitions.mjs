import { visit } from "unist-util-visit";

const ADMONITION_TYPES = new Set([
	"note",
	"tip",
	"important",
	"warning",
	"caution",
]);

/**
 * Converts GitHub-style callouts:
 *
 * > [!NOTE]
 * > Content
 *
 * into remark-directive container nodes:
 *
 * :::note
 * Content
 * :::
 *
 * This lets the existing rehypeComponents mapping and AdmonitionComponent
 * handle rendering/styling.
 */
export function remarkGithubAdmonitions() {
	return (tree) => {
		visit(tree, "blockquote", (node, index, parent) => {
			if (!parent || typeof index !== "number") return;

			const firstChild = node.children?.[0];
			if (!firstChild || firstChild.type !== "paragraph") return;

			const firstInline = firstChild.children?.[0];
			if (!firstInline || firstInline.type !== "text") return;

			const match = firstInline.value.match(
				/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][\t ]*(?:\n)?/i,
			);

			if (!match) return;

			const type = match[1].toLowerCase();

			if (!ADMONITION_TYPES.has(type)) return;

			firstInline.value = firstInline.value.slice(match[0].length);

			if (firstInline.value.length === 0) {
				firstChild.children.shift();
			}

			if (firstChild.children.length === 0) {
				node.children.shift();
			}

			parent.children[index] = {
				type: "containerDirective",
				name: type,
				attributes: {},
				children: node.children,
			};
		});
	};
}
