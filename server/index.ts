import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Функция для валидации данных от Telegram
function validateTelegramWebAppData(telegramInitData: string) {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get('hash');
  const dataToCheck: string[] = [];
  
  initData.sort();
  initData.forEach((val, key) => {
    if (key !== 'hash') {
      dataToCheck.push(`${key}=${val}`);
    }
  });

  const dataCheckString = dataToCheck.join('\n');
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

app.post('/validate-user', express.json(), (req, res) => {
  const { initData } = req.body;
  
  if (!initData) {
    return res.status(400).json({ error: 'No init data provided' });
  }

  const isValid = validateTelegramWebAppData(initData);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid init data' });
  }

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 