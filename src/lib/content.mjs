import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// Markdown also accepts existing HTML content. Apply the same policy to previews
// and published content, including content created before this editor existed.
export function renderContent(content = '') {
  return sanitizeHtml(marked.parse(String(content)), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowProtocolRelative: false,
  });
}
