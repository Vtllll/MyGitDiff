/**
 * ============================================================================
 * MyGitDiff — DEMONSTRATION FILE: VERSION 2 (MODIFIED)
 * This file contains 8 distinct test cases showcasing all Diff Viewer features.
 * ============================================================================
 */

// ============================================================================
// CASE 1: Intra-line / Word-level Diff
// Expected outcome: modified words and values are highlighted with vivid backgrounds
// ============================================================================
function configureServer(host, port = 9000, debugMode = true) {
  const connectionString = `https://${host}:${port}/api/v2`;
  const timeoutMs = 15000;
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
// Expected outcome: added security validation function highlighted in green
// ============================================================================
function getSystemStatus() {
  return "SYSTEM_ONLINE";
}

// New security validation function (pure block addition)
function validateSecurityHeaders(requestHeaders) {
  const authToken = requestHeaders['authorization'];
  if (!authToken || !authToken.startsWith('Bearer ')) {
    throw new Error('SECURITY_ALERT: Invalid authorization token format');
  }
  return true;
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
// Expected outcome: function legacyXMLHttpFallback was removed, nothing here
// ============================================================================

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
const MAX_RETRY_ATTEMPTS = 3; // Updated: added exponential backoff up to 3 attempts
const CACHE_TTL_SECONDS = 3600; // Updated: migrated storage to distributed Redis cluster

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
const AUDIT_LOG_TEMPLATE = "EVENT:USER_LOGIN | TIMESTAMP:" + Date.now() + " | STATUS:SUCCESS | CLIENT:WEB_BROWSER_DESKTOP_V2 | IP_ADDRESS:192.168.1.100 | REGION:EU-CENTRAL-1 | DATA_CENTER:FRANKFURT_DC04 | ENCRYPTION:AES_256_GCM | COMPLIANCE:GDPR_APPROVED_TIER1";

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
#define CLIENT_API_VERSION "2.5.0"
#define MAX_CONNECTIONS 500

class PaymentGateway {
  public boolean processTransaction(string accountId, double amount) {
    int attempts = 3;
    const isSuccess = amount > 10.0 && attempts <= 5;
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
  const statusMap = {
    200: 'Operation successful',
    404: 'Resource not found',
    500: 'Internal server error'
  };
  return statusMap[statusCode] ?? 'Unknown status code';
}
