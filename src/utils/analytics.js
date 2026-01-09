// Google Analytics for tracking app usage
const GA_MEASUREMENT_ID = 'G-50H9HE0G4G';

// Initialize GA4 for the app
export function initAnalytics() {
  // Only run in production (not in dev mode)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Analytics disabled in development');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    // Custom parameters for app tracking
    app_name: 'HubogoNote',
    app_version: getAppVersion(),
    send_page_view: false // We'll send custom events instead
  });

  // Track app open event
  trackEvent('app_open', {
    version: getAppVersion(),
    platform: getPlatform()
  });
}

// Get app version from changelog
function getAppVersion() {
  try {
    // Import dynamically to avoid circular dependency
    return localStorage.getItem('hubogo_app_version') || '1.0.7';
  } catch {
    return '1.0.7';
  }
}

// Get platform info
function getPlatform() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('linux')) return 'linux';
  return 'unknown';
}

// Track custom events
export function trackEvent(eventName, params = {}) {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Track page views (for different views in the app)
export function trackPageView(pageName) {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: `app://hubogonote/${pageName}`
  });
}
