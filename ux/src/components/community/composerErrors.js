import { ModerationError } from '../../api';

// Turns a failed submit into { notice } (gentle moderation message) or { error } (anything else).
export default function describeSubmitError(err) {
  if (err instanceof ModerationError || err?.name === 'ModerationError') {
    return { notice: err.message || 'Please rephrase and try again.' };
  }
  return { error: 'We couldn’t send that just now. Your draft is safe — please try again in a moment.' };
}
