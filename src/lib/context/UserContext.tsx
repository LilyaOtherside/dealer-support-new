import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, testSupabaseConnection } from '../supabase';

interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initUser = async () => {
      console.log('=== Starting initialization ===');
      
      try {
        // Проверяем подключение к Supabase
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest.success) {
          throw new Error('Failed to connect to Supabase');
        }
        console.log('Supabase connection successful');

        // Проверяем Telegram WebApp
        const webApp = window.Telegram?.WebApp;
        console.log('Telegram WebApp object:', webApp);
        
        if (!webApp) {
          throw new Error('Telegram WebApp is not available');
        }

        // Инициализируем WebApp
        webApp.ready();
        console.log('WebApp ready called');

        // Проверяем данные инициализации
        console.log('WebApp initData:', webApp.initData);
        console.log('WebApp initDataUnsafe:', webApp.initDataUnsafe);

        const userData = webApp.initDataUnsafe.user;
        console.log('User data from WebApp:', userData);

        if (!userData || !userData.id) {
          throw new Error('Invalid user data from Telegram');
        }

        // Сохраняем пользователя
        const { data: dbUser, error: dbError } = await supabase
          .from('telegram_users')
          .upsert({
            telegram_id: userData.id,
            username: userData.username || null,
            first_name: userData.first_name || 'Unknown',
            last_name: userData.last_name || null,
            photo_url: userData.photo_url || null,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (dbError) {
          console.error('Failed to save user:', dbError);
          throw dbError;
        }

        console.log('User saved successfully:', dbUser);
        setUser(dbUser);
      } catch (err) {
        console.error('Error in initialization:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  // Добавляем лог при каждом рендере
  console.log('UserProvider render state:', { user, loading, error });

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 