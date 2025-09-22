#!/usr/bin/env node

/**
 * Lovable Webhook Trigger Script
 * Forces synchronization with Lovable platform
 */

const PROJECT_ID = 'fbdd3d5b-9423-4ee8-90f1-fe976e495955';
const WEBHOOK_URLS = [
  'https://api.lovable.dev/webhooks/github',
  'https://webhook.lovable.dev/sync',
  'https://lovable.dev/api/sync'
];

async function triggerSync() {
  const payload = {
    project_id: PROJECT_ID,
    repository: 'AIgorrocha/visaobim-fluxo',
    action: 'force_sync',
    timestamp: new Date().toISOString(),
    source: 'manual_trigger',
    branch: 'master'
  };

  console.log('🚀 Triggering Lovable sync for project:', PROJECT_ID);

  for (const url of WEBHOOK_URLS) {
    try {
      console.log(`📡 Trying webhook: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Lovable-Sync-Trigger/1.0'
        },
        body: JSON.stringify(payload)
      });

      console.log(`Response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log('✅ Sync trigger sent successfully!');
        break;
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

if (require.main === module) {
  triggerSync();
}

module.exports = { triggerSync, PROJECT_ID };