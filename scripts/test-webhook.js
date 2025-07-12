#!/usr/bin/env node

/**
 * Test Webhook Script
 * 
 * This script tests your Telegram bot webhook to make sure it's working.
 * Run with: node scripts/test-webhook.js
 */

const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testWebhook() {
  console.log('🧪 Testing Telegram Bot Webhook\n');

  const botToken = await question('Enter your bot token: ');
  if (!botToken) {
    console.error('❌ Bot token is required!');
    process.exit(1);
  }

  try {
    console.log('📡 Getting webhook info...');
    
    const webhookInfo = await makeRequest(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`
    );

    if (webhookInfo.ok) {
      const info = webhookInfo.result;
      console.log('✅ Webhook Info:');
      console.log(`   URL: ${info.url || 'Not set'}`);
      console.log(`   Pending updates: ${info.pending_update_count}`);
      console.log(`   Last error: ${info.last_error_message || 'None'}`);
      console.log(`   Last error date: ${info.last_error_date ? new Date(info.last_error_date * 1000) : 'None'}`);
      
      if (info.url) {
        console.log('\n✅ Webhook is configured!');
        
        // Test sending a message to the bot
        console.log('\n📱 To test the bot:');
        console.log('1. Open Telegram');
        console.log('2. Find your bot');
        console.log('3. Send /start');
        console.log('4. Check if you get a response');
      } else {
        console.log('\n❌ No webhook URL set!');
        console.log('Run `npm run setup-bot` to configure the webhook.');
      }
    } else {
      console.error('❌ Failed to get webhook info:', webhookInfo.description);
    }

    // Get bot info
    console.log('\n🤖 Getting bot info...');
    const botInfo = await makeRequest(`https://api.telegram.org/bot${botToken}/getMe`);
    
    if (botInfo.ok) {
      const info = botInfo.result;
      console.log('✅ Bot Info:');
      console.log(`   Username: @${info.username}`);
      console.log(`   Name: ${info.first_name}`);
      console.log(`   ID: ${info.id}`);
      console.log(`   Can join groups: ${info.can_join_groups}`);
      console.log(`   Can read messages: ${info.can_read_all_group_messages}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Test cancelled');
  rl.close();
  process.exit(0);
});

testWebhook().catch(console.error);
