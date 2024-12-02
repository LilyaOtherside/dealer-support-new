interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id: number;
      username?: string;
      first_name: string;
      last_name?: string;
    };
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
} 