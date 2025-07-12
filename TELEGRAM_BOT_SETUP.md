# 🤖 Telegram Bot Setup Guide

## Step 1: Configure Bot with BotFather

### 1.1 Create/Update Bot Commands

Send these messages to [@BotFather](https://t.me/BotFather):

```
/setcommands

# Select your @Nutrigrade_bot

# Then paste these commands:
start - 🏠 Welcome to NutriPal nutrition scanner
scan - 📱 Open nutrition scanner
help - ❓ Get help and instructions
about - ℹ️ About NutriPal app
settings - ⚙️ Configure your preferences
```

### 1.2 Set Bot Description

```
/setdescription

# Select your @Nutrigrade_bot

# Paste this description:
🍎 NutriPal - Smart Nutrition Scanner

Scan product barcodes to get instant nutrition analysis and health grading. Make informed dietary decisions with our A-E scoring system and AI nutrition assistant.

✨ Features:
• 📊 Instant nutrition grading
• 🔍 Barcode scanner
• 🤖 AI nutrition assistant
• 📈 Health tracking
• 🎯 Dietary preferences

Tap "Open App" to start scanning!
```

### 1.3 Set Short Description

```
/setshortdescription

# Select your @Nutrigrade_bot

# Paste this:
Smart nutrition scanner with A-E health grading system
```

### 1.4 Set Bot Picture

Upload a bot profile picture (512x512 PNG recommended):
```
/setuserpic

# Select your @Nutrigrade_bot
# Upload your bot avatar image
```

## Step 2: Configure Web App

### 2.1 Create Web App

```
/newapp

# Select your @Nutrigrade_bot

# App name:
NutriPal Scanner

# App description:
Smart nutrition scanner that analyzes product barcodes and provides A-E health grading with personalized dietary recommendations.

# Photo: Upload app icon (512x512 PNG)

# Web App URL:
https://your-domain.vercel.app
# Or for testing: https://your-ngrok-url.ngrok.io
```

### 2.2 Set Menu Button

```
/setmenubutton

# Select your @Nutrigrade_bot

# Button text:
🍎 Open NutriPal

# Web App URL:
https://your-domain.vercel.app
```

## Step 3: Test Bot Commands

Send these messages to your bot to test:

- `/start` - Should show welcome message
- `/scan` - Should open the scanner
- `/help` - Should show help information
- `/about` - Should show app information
- `/settings` - Should open preferences

## Step 4: Bot Response Setup (Optional)

If you want your bot to respond to commands, you'll need a backend. Here's a simple setup:

### 4.1 Create Webhook Handler

```typescript
// api/webhook.ts (if using Vercel)
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;
  
  if (message?.text) {
    const chatId = message.chat.id;
    const text = message.text;

    let responseText = '';
    let replyMarkup: any = null;

    switch (text) {
      case '/start':
        responseText = `🍎 Welcome to NutriPal!

Your smart nutrition scanner is ready to help you make healthier food choices.

✨ What NutriPal can do:
• 📊 Scan barcodes for instant nutrition analysis
• 🎯 Get A-E health grades for products
• 🤖 Chat with AI nutrition assistant
• 📈 Track your nutrition progress
• ⚙️ Set dietary preferences

Tap "Open App" below to start scanning!`;
        
        replyMarkup = {
          inline_keyboard: [
            [{ text: '🍎 Open NutriPal', web_app: { url: 'https://your-domain.vercel.app' } }],
            [{ text: '❓ Help', callback_data: 'help' }, { text: 'ℹ️ About', callback_data: 'about' }]
          ]
        };
        break;

      case '/scan':
        responseText = `📱 Ready to scan!

Tap "Open Scanner" to start analyzing products:`;
        
        replyMarkup = {
          inline_keyboard: [
            [{ text: '📱 Open Scanner', web_app: { url: 'https://your-domain.vercel.app' } }]
          ]
        };
        break;

      case '/help':
        responseText = `❓ How to use NutriPal:

1️⃣ Tap "Open App" to launch NutriPal
2️⃣ Point your camera at a product barcode
3️⃣ Get instant nutrition analysis
4️⃣ See A-E health grade and recommendations
5️⃣ Chat with AI for nutrition advice

🎯 Tips:
• Good lighting helps barcode scanning
• Look for products with A or B grades
• Use the AI chat for personalized advice
• Check your scan history in Results tab

Need more help? Contact @your_support_username`;
        break;

      case '/about':
        responseText = `ℹ️ About NutriPal

NutriPal is a smart nutrition scanner that helps you make informed dietary decisions by analyzing product barcodes.

🏗️ Built with:
• Next.js & TypeScript
• Open Food Facts database
• AI nutrition assistant
• Telegram Mini Apps

🎯 Our mission:
Empowering healthier decisions, one scan at a time.

📊 Grading System:
A = Excellent nutrition
B = Good choice
C = Okay in moderation
D = Less healthy
E = Avoid if possible

Version: 1.0.0
Developer: @your_username`;
        break;

      case '/settings':
        responseText = `⚙️ Settings

Tap "Open Settings" to configure:
• Dietary preferences (vegetarian, vegan, etc.)
• Health goals and targets
• Notification preferences
• Scanning settings`;
        
        replyMarkup = {
          inline_keyboard: [
            [{ text: '⚙️ Open Settings', web_app: { url: 'https://your-domain.vercel.app?tab=profile' } }]
          ]
        };
        break;

      default:
        responseText = `🤖 I didn't understand that command.

Available commands:
/start - Welcome & open app
/scan - Quick scanner access
/help - Usage instructions
/about - App information
/settings - Configure preferences

Or just tap "Open App" to start scanning!`;
        
        replyMarkup = {
          inline_keyboard: [
            [{ text: '🍎 Open NutriPal', web_app: { url: 'https://your-domain.vercel.app' } }]
          ]
        };
    }

    // Send response to Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: responseText,
        reply_markup: replyMarkup,
        parse_mode: 'HTML'
      })
    });
  }

  res.status(200).json({ ok: true });
}
```

### 4.2 Set Webhook URL

```bash
# Set webhook URL with BotFather
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.vercel.app/api/webhook"}'
```

## Step 5: Environment Variables

Add to your `.env.local`:

```env
# Get this from @BotFather
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=Nutrigrade_bot

# Your app URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Step 6: Test Everything

1. **Test Commands**: Send `/start`, `/scan`, `/help` to your bot
2. **Test Web App**: Tap "Open App" button
3. **Test Scanning**: Use the barcode scanner
4. **Test Mini App**: Verify it works within Telegram interface

## Troubleshooting

### Bot not responding to commands:
- Check if webhook is set correctly
- Verify bot token in environment variables
- Make sure webhook URL is accessible

### Web App not opening:
- Verify the URL is correct and accessible
- Check if HTTPS is enabled
- Test the URL in a regular browser first

### Commands not showing in bot menu:
- Run `/setcommands` again with @BotFather
- Make sure you selected the correct bot
- Wait a few minutes for changes to propagate

## Quick Setup Checklist

- [ ] Set bot commands with @BotFather
- [ ] Set bot description and short description
- [ ] Upload bot profile picture
- [ ] Create Web App with correct URL
- [ ] Set menu button
- [ ] Test all commands
- [ ] Verify Web App opens correctly
- [ ] Test barcode scanning functionality
