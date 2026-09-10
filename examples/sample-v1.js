/**
 * ============================================================================
 * MyGitDiff — DEMONSTRATION FILE: VERSION 1 (ORIGINAL)
 * This file contains 8 distinct test cases showcasing all Diff Viewer features.
 * ============================================================================
 */

// ============================================================================
// CASE 1: Intra-line / Word-level Diff
// Expected outcome: modified words and values are highlighted with vivid backgrounds
// ============================================================================
function configureServer(host, port = 8080, debugMode = false) {
  const connectionString = `http://${host}:${port}/api/v1`;
  const timeoutMs = 5000;
  return { host, port, connectionString, debug: debugMode, timeout: timeoutMs };
}

// ----------------------------------------------------------------------------
// [Unchanged context block separating hunks]
function syncHeartbeatA() {
  const pingTime = 1000;
  const isHealthy = true;
  return { pingTime, isHealthy };
}
// ----------------------------------------------------------------------------

// ============================================================================
// CASE 2: Pure addition of new functionality (Added Lines Only)
// Expected outcome: v2 will introduce a new security validation block here
// ============================================================================
function getSystemStatus() {
  return "SYSTEM_ONLINE";
}

// ----------------------------------------------------------------------------
// [Unchanged context block separating hunks]
function syncHeartbeatB() {
  const pingTime = 2000;
  const isHealthy = true;
  return { pingTime, isHealthy };
}
// ----------------------------------------------------------------------------

// ============================================================================
// CASE 3: Pure deletion of legacy code (Deleted Lines Only)
// Expected outcome: the entire block below is highlighted in red; removed in v2
// ============================================================================
function legacyXMLHttpFallback(endpoint, payload) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', endpoint, false);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send(payload);
  return xhr.responseText;
}

// ----------------------------------------------------------------------------
// [Unchanged context block separating hunks]
function syncHeartbeatC() {
  const pingTime = 3000;
  const isHealthy = true;
  return { pingTime, isHealthy };
}
// ----------------------------------------------------------------------------

// ============================================================================
// CASE 4: Indentation and whitespace formatting differences
// Expected outcome: toggling "Ignore Whitespace" makes this hunk disappear!
// ============================================================================
function calculateDiscount(userTier, amount) {
if (userTier === 'VIP') {
return amount * 0.20;
}
return 0;
}

// ----------------------------------------------------------------------------
// [Unchanged context block separating hunks]
function syncHeartbeatD() {
  const pingTime = 4000;
  const isHealthy = true;
  return { pingTime, isHealthy };
}
// ----------------------------------------------------------------------------

// ============================================================================
// CASE 5: Comment text modification only (Comment Diff & Shadow effect)
// Expected outcome: code remains identical, but comment on the right highlights changes
// ============================================================================
const MAX_RETRY_ATTEMPTS = 3; // Initial retry attempts upon network disconnection
const CACHE_TTL_SECONDS = 3600; // Cache time-to-live: exactly 1 hour in memory

// ----------------------------------------------------------------------------
// [Unchanged context block separating hunks]
function syncHeartbeatE() {
  const pingTime = 5000;
  const isHealthy = true;
  return { pingTime, isHealthy };
}
// ----------------------------------------------------------------------------

// ============================================================================
// CASE 6: Super long line of code (Word Wrap Test)
// Expected outcome: test the "Word Wrap" checkbox (Alt+R) to inspect line wrapping
// ============================================================================
const AUDIT_LOG_TEMPLATE = "EVENT:USER_LOGIN | TIMESTAMP:" + Date.now() + " | STATUS:SUCCESS | REGION:EU-CENTRAL-1";

// ----------------------------------------------------------------------------
// [Unchanged context block separating hunks]
function syncHeartbeatF() {
  const pingTime = 6000;
  const isHealthy = true;
  return { pingTime, isHealthy };
}
// ----------------------------------------------------------------------------

// ============================================================================
// CASE 7: Directives, keywords, types, numbers, and strings (Syntax Highlighting)
// ============================================================================
#define CLIENT_API_VERSION "1.0.0"
#define MAX_CONNECTIONS 100

class PaymentGateway {
  public boolean processTransaction(string accountId, double amount) {
    int attempts = 1;
    const isSuccess = amount > 0 && attempts <= 3;
    return isSuccess;
  }
}

// ----------------------------------------------------------------------------
// [Unchanged context block separating hunks]
function syncHeartbeatG() {
  const pingTime = 7000;
  const isHealthy = true;
  return { pingTime, isHealthy };
}
// ----------------------------------------------------------------------------

// ============================================================================
// CASE 8: Logic refactoring (Replacing if/else chain with dictionary map)
// ============================================================================
function getStatusMessage(statusCode) {
  if (statusCode === 200) {
    return 'Operation successful';
  } else if (statusCode === 404) {
    return 'Resource not found';
  } else if (statusCode === 500) {
    return 'Internal server error';
  } else {
    return 'Unknown status code';
  }
}
