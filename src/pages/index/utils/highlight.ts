export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const withTrailingNbsp = (value: string) =>
  value.length === 0 ? "&nbsp;" : value.replace(/\n$/g, "\n&nbsp;");
