interface TelegramWebApps {
  WebApp: {
    ready: () => void;
    expand: () => void;
    close: () => void;
    initDataUnsafe: {
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        photo_url?: string;
      };
      start_param?: string;
      auth_date: number;
      hash: string;
    };
    initData: string;
  };
}

interface Window {
  Telegram: TelegramWebApps;
} 