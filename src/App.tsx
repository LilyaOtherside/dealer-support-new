import { useEffect, useState } from 'react';
import { RequestList } from './components/RequestList';
import { UserProfile } from './components/UserProfile';
import { supabase } from './lib/supabase';
import { Moon, Sun } from 'lucide-react';
import { Button } from './components/ui/button';
import './globals.css';

// Определяем типы для Telegram WebApp
declare global {
  interface Window {
    Telegram: {
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
      }
    }
  }
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Добавляем дополнительные классы для темной темы
    if (theme === 'dark') {
      root.classList.add('dark-theme-text');
    } else {
      root.classList.remove('dark-theme-text');
    }
  }, [theme]);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Проверка наличия объекта Telegram
        if (typeof window !== 'undefined' && window.Telegram) {
          const tg = window.Telegram.WebApp;
          
          // Инициализация Telegram WebApp
          tg.ready();
          
          // Получаем данные пользователя
          const telegramUser = tg.initDataUnsafe?.user;
          if (telegramUser) {
            const userData = {
              id: telegramUser.id,
              username: telegramUser.username || '',
              first_name: telegramUser.first_name || '',
              last_name: telegramUser.last_name || '',
              photo_url: telegramUser.photo_url || '',
            };

            setUser(userData);

            // Сохраняем пользователя в Supabase
            const { error: supabaseError } = await supabase
              .from('users')
              .upsert(userData);

            if (supabaseError) {
              console.error('Error saving user to Supabase:', supabaseError);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing Telegram:', error);
      }
    };

    initTelegram();
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleCreateRequest = async (request: Omit<Request, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert([
          {
            ...request,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      
      if (data) {
        setRequests(prev => [data[0], ...prev]);
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleUpdateRequest = async (id: string, updates: Partial<Request>) => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data) {
        setRequests(prev =>
          prev.map(request => (request.id === id ? data[0] : request))
        );
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.filter(request => request.id !== id));
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dealer Portal</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
            {user && <UserProfile user={user} />}
          </div>
        </div>

        <main>
          <RequestList
            requests={requests}
            onUpdateRequest={handleUpdateRequest}
            onDeleteRequest={handleDeleteRequest}
            onCreateRequest={handleCreateRequest}
          />
        </main>
      </div>
    </div>
  );
}

export default App;