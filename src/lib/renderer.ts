import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

export async function renderMd(text: string) {
	const file = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkMath)
		.use(remarkRehype)
		.use(rehypeSanitize, {
			...defaultSchema,
			attributes: {
				...defaultSchema.attributes,
				div: [...(defaultSchema.attributes?.div || []), ['className', 'math', 'math-display']],
				span: [...(defaultSchema.attributes?.span || []), ['className', 'math', 'math-inline']]
			}
		})
		.use(rehypeKatex)
		.use(rehypeStringify)
		.process(text);
	return String(file);
}
