/**
 * Universal error message extractor for RTK Query & API errors.
 * Automatically parses raw JSON error strings, Zod validation errors, or API error objects
 * into clean, user-friendly text messages.
 */
export function getErrorMessage(err: any, fallbackMessage: string = 'An error occurred'): string {
  if (!err) return fallbackMessage;

  // Extract raw error message string if available
  let rawMessage =
    err?.data?.message ||
    err?.message ||
    (typeof err?.data === 'string' ? err.data : null);

  // If message is missing, check err?.data?.errors array (Zod/express-validator)
  if (!rawMessage && Array.isArray(err?.data?.errors)) {
    const msgs = err.data.errors
      .map((e: any) => {
        if (e.message) {
          const field = e.field ? e.field.charAt(0).toUpperCase() + e.field.slice(1) : '';
          return field ? `${field}: ${e.message}` : e.message;
        }
        return e.msg || null;
      })
      .filter(Boolean);
    if (msgs.length > 0) return msgs.join('. ');
  }

  if (typeof rawMessage !== 'string') {
    return fallbackMessage;
  }

  // Check if rawMessage is a JSON string of Zod or array of issues
  if (rawMessage.trim().startsWith('[') || rawMessage.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawMessage);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const msgs = parsed
          .map((item: any) => {
            if (item?.message) {
              const field = Array.isArray(item?.path)
                ? item.path.filter((p: any) => p !== 'body' && p !== 'query' && p !== 'params').join('.')
                : '';
              const fieldName = field ? field.charAt(0).toUpperCase() + field.slice(1) : '';
              return fieldName ? `${fieldName}: ${item.message}` : item.message;
            }
            return null;
          })
          .filter(Boolean);

        if (msgs.length > 0) {
          return msgs.join('. ');
        }
      } else if (parsed && typeof parsed === 'object' && parsed.message) {
        return parsed.message;
      }
    } catch {
      // Not JSON, fallback to rawMessage
    }
  }

  return rawMessage || fallbackMessage;
}
