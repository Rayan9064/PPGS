import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received webhook:', JSON.stringify(body, null, 2));
    
    const { message } = body;

    if (!message) {
      console.log('No message in webhook body');
      return NextResponse.json({ ok: true });
    }

    if (!message.text) {
      console.log('No text in message:', message);
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    console.log(`Processing message: "${text}" from chat: ${chatId}`);

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not found');
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    let responseText = '';
    let replyMarkup: any = null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutripal.vercel.app';

    switch (text) {
      case '/start':
        responseText = `🍎 <b>Welcome to NutriPal!</b>

Your smart nutrition scanner is ready to help you make healthier food choices.

✨ <b>What NutriPal can do:</b>
• 📊 Scan barcodes for instant nutrition analysis
• 🎯 Get A-E health grades for products
• 🤖 Chat with AI nutrition assistant
• 📈 Track your nutrition progress
• ⚙️ Set dietary preferences

Tap "<b>Open NutriPal</b>" below to start scanning!`;
        
        replyMarkup = {
          inline_keyboard: [
            [{ text: '🍎 Open NutriPal', web_app: { url: appUrl } }],
            [
              { text: '❓ Help', callback_data: 'help' }, 
              { text: 'ℹ️ About', callback_data: 'about' }
            ]
          ]
        };
        break;

      case '/scan':
        responseText = `📱 <b>Ready to scan!</b>

Point your camera at any product barcode to get:
• Instant nutrition analysis
• A-E health grade
• Ingredient breakdown
• Health recommendations

Tap "<b>Open Scanner</b>" to start:`;
        
        replyMarkup = {
          inline_keyboard: [
            [{ text: '📱 Open Scanner', web_app: { url: appUrl } }]
          ]
        };
        break;

      case '/help':
        responseText = `❓ <b>How to use NutriPal:</b>

<b>1️⃣ Scan Products:</b>
• Tap "Open App" to launch NutriPal
• Point camera at product barcode
• Get instant nutrition analysis

<b>2️⃣ Understand Grades:</b>
🟢 A = Excellent nutrition
🟡 B = Good choice  
🟡 C = Okay in moderation
🟠 D = Less healthy
🔴 E = Avoid if possible

<b>3️⃣ Get AI Help:</b>
• Use the chat tab for nutrition advice
• Ask about specific products
• Get personalized recommendations

<b>🎯 Pro Tips:</b>
• Good lighting helps scanning
• Look for A/B grade products
• Check scan history in Results tab`;
        break;

      case '/about':
        responseText = `ℹ️ <b>About NutriPal</b>

<b>🎯 Mission:</b>
Empowering healthier decisions, one scan at a time.

<b>🏗️ Features:</b>
• Real-time barcode scanning
• A-E nutrition grading system
• AI nutrition assistant
• Personal health tracking
• Dietary preference filters

<b>📊 Data Source:</b>
Open Food Facts - World's largest food database

<b>🔧 Technology:</b>
Built with Next.js, TypeScript & Telegram Mini Apps

<b>📱 Version:</b> 1.0.0`;
        break;

      case '/settings':
        responseText = `⚙️ <b>Customize NutriPal</b>

Configure your preferences:
• 🥗 Dietary restrictions (vegan, gluten-free, etc.)
• 🎯 Health goals and targets
• 🔔 Notification settings
• 📱 Scanner preferences

Tap "<b>Open Settings</b>" to customize:`;
        
        replyMarkup = {
          inline_keyboard: [
            [{ text: '⚙️ Open Settings', web_app: { url: `${appUrl}?tab=profile` } }]
          ]
        };
        break;

      default:
        responseText = `🤖 <b>I didn't understand that command.</b>

<b>Available commands:</b>
/start - Welcome & open app
/scan - Quick scanner access  
/help - Usage instructions
/about - App information
/settings - Configure preferences

Or just tap "<b>Open App</b>" to start scanning!`;
        
        replyMarkup = {
          inline_keyboard: [
            [{ text: '🍎 Open NutriPal', web_app: { url: appUrl } }]
          ]
        };
    }

    // Send response to Telegram
    console.log('Sending response to Telegram:', {
      chat_id: chatId,
      text: responseText.substring(0, 100) + '...',
      has_reply_markup: !!replyMarkup,
      bot_token_exists: !!botToken
    });
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: responseText,
        reply_markup: replyMarkup,
        parse_mode: 'HTML'
      })
    });

    console.log('Telegram API response status:', telegramResponse.status);
    
    if (!telegramResponse.ok) {
      const error = await telegramResponse.text();
      console.error('Telegram API error:', {
        status: telegramResponse.status,
        statusText: telegramResponse.statusText,
        error: error
      });
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
    
    const result = await telegramResponse.json();
    console.log('Telegram API success:', result);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
