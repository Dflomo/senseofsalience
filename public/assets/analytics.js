/* PostHog analytics. Public project token (safe to expose, write-only). */
(function () {
  try {
    if (navigator.doNotTrack === '1') return;
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://us-assets.i.posthog.com/static/array.js';
    s.onload = function () {
      if (!window.posthog || !window.posthog.init) return;
      window.posthog.init('phc_pwJR6rj6G8xhEfgNMSs5ekyB3tNtFPrsbHNsSSS5uGrf', {
        api_host: 'https://us.i.posthog.com',
        defaults: '2025-05-24',
        person_profiles: 'identified_only',
        capture_pageview: true,
        autocapture: true
      });
    };
    document.head.appendChild(s);
  } catch (e) {}
})();
