// Update checker utility
import { APP_VERSION, isNewerVersion } from './changelog';

const GITHUB_REPO = 'user/hubogo-note'; // Change this to your actual repo
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // Check every 24 hours

// Storage keys
const LAST_CHECK_KEY = 'hubogo_last_update_check';
const LAST_VERSION_KEY = 'hubogo_last_known_version';
const SKIPPED_VERSION_KEY = 'hubogo_skipped_version';

// Get stored version info
export function getLastKnownVersion() {
  return localStorage.getItem(LAST_VERSION_KEY) || '1.0.0';
}

export function setLastKnownVersion(version) {
  localStorage.setItem(LAST_VERSION_KEY, version);
}

export function getSkippedVersion() {
  return localStorage.getItem(SKIPPED_VERSION_KEY);
}

export function skipVersion(version) {
  localStorage.setItem(SKIPPED_VERSION_KEY, version);
}

// Check if we should show What's New
export function shouldShowWhatsNew() {
  const lastVersion = getLastKnownVersion();
  if (isNewerVersion(APP_VERSION, lastVersion)) {
    return true;
  }
  return false;
}

// Mark current version as seen
export function markVersionAsSeen() {
  setLastKnownVersion(APP_VERSION);
}

// Check for updates from GitHub releases
export async function checkForUpdates() {
  try {
    // Check if enough time has passed since last check
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    if (lastCheck) {
      const timeSince = Date.now() - parseInt(lastCheck);
      if (timeSince < CHECK_INTERVAL) {
        return null; // Too soon to check again
      }
    }

    // For now, we'll use a simple version check
    // In production, you would fetch from GitHub API:
    // const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    // const data = await response.json();
    // const latestVersion = data.tag_name.replace('v', '');

    // Mark that we checked
    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());

    // Simulated check - in production replace with actual API call
    // For demo purposes, we'll return null (no update)
    return null;

  } catch (error) {
    console.log('Update check failed:', error);
    return null;
  }
}

// Format for display
export function formatUpdateInfo(version, releaseUrl) {
  return {
    version,
    currentVersion: APP_VERSION,
    downloadUrl: releaseUrl || `https://github.com/${GITHUB_REPO}/releases/latest`,
    isSkipped: getSkippedVersion() === version
  };
}

// Get current app version
export function getCurrentVersion() {
  return APP_VERSION;
}
