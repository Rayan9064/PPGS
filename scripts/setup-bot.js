#!/usr/bin/env node

/**
 * Telegram Bot Setup Script
 * 
 * This script helps you configure your Telegram bot webhook and commands.
 * Run with: node scripts/setup-bot.js
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

async function setupBot() {
  console.log('🤖 NutriPal Telegram Bot Setup\n');

  // Get bot token
  const botToken = await question('Enter your bot token from @BotFather: ');
  if (!botToken) {
    console.error('❌ Bot token is required!');
    process.exit(1);
  }

  // Get webhook URL
  const webhookUrl = await question('Enter your webhook URL (e.g., https://your-app.vercel.app/api/webhook): ');
  if (!webhookUrl) {
    console.error('❌ Webhook URL is required!');
    process.exit(1);
  }

  try {
    console.log('\n📡 Setting up webhook...');
    
    // Set webhook
    const webhookResponse = await makeRequest(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      { url: webhookUrl }
    );

    if (webhookResponse.ok) {
      console.log('✅ Webhook set successfully!');
    } else {
      console.error('❌ Failed to set webhook:', webhookResponse.description);
      process.exit(1);
    }

    console.log('\n⚙️ Setting up bot commands...');

    // Set bot commands
    const commands = [
      { command: 'start', description: '🏠 Welcome to NutriPal nutrition scanner' },
      { command: 'scan', description: '📱 Open nutrition scanner' },
      { command: 'help', description: '❓ Get help and instructions' },
      { command: 'about', description: 'ℹ️ About NutriPal app' },
      { command: 'settings', description: '⚙️ Configure your preferences' }
    ];

    const commandsResponse = await makeRequest(
      `https://api.telegram.org/bot${botToken}/setMyCommands`,
      { commands }
    );

    if (commandsResponse.ok) {
      console.log('✅ Bot commands set successfully!');
    } else {
      console.error('❌ Failed to set commands:', commandsResponse.description);
    }

    console.log('\n🎉 Bot setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Add these environment variables to your .env.local:');
    console.log(`   TELEGRAM_BOT_TOKEN=${botToken}`);
    console.log(`   NEXT_PUBLIC_APP_URL=${webhookUrl.replace('/api/webhook', '')}`);
    console.log('\n2. Test your bot by sending /start');
    console.log('3. If needed, update your Web App URL in @BotFather with /setmenubutton');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }

  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Setup cancelled');
  rl.close();
  process.exit(0);
});

setupBot().catch(console.error);
