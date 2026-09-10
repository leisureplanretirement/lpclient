// Google Ads conversion: credit is due once per visitor, the first time they click Send —
// this flag stops later sends in the same session (or return visits) from re-reporting.
const SEND_CONVERSION_TRACKED_KEY = 'lp_send_conversion_tracked';
const SEND_CONVERSION_LABEL = 'AW-18436209511/-mahCITMpvIcEOf2iNdE';

export function trackSendConversionOnce() {
  try {
    if (localStorage.getItem(SEND_CONVERSION_TRACKED_KEY) === 'true') return;
    localStorage.setItem(SEND_CONVERSION_TRACKED_KEY, 'true');
  } catch {}
  window.gtag?.('event', 'conversion', { send_to: SEND_CONVERSION_LABEL });
}
