import { marked } from "marked";
import { sanitize } from "isomorphic-dompurify";

export default (content: string, maxLength = 256): string => {
  // first remove elements we wouldn't want as a summary
  const contentBlocks = sanitize(marked.parse(content, { breaks: true }), {
    ALLOWED_TAGS: [
      "p",
      "blockquote",
      "#text",
      "strong",
      "b",
      "em",
      "i",
      "a",
      "#text",
    ],
    KEEP_CONTENT: false,
  });

  const sum = (
    sanitize(contentBlocks, {
      RETURN_DOM: true,
    }).textContent || ""
  ).replace(/^[\s\n]+|[\s\n]+$/g, "");
  if (sum.length > maxLength)
    return sum.substring(0, maxLength - 3).split("\n")[0] + "...";
  return sum;
};
