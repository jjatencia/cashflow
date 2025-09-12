import { useEffect, useState } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () =>
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    updateSystemTheme();
    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  const Icon =
    theme === 'system'
      ? systemTheme === 'dark'
        ? Moon
        : Sun
      : theme === 'dark'
      ? Moon
      : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="min-h-[44px] min-w-[44px] border-border/50 hover:border-primary/30 transition-all duration-200"
        >
          <Icon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end" 
        className="min-w-[160px] bg-card border-border/50 shadow-lg"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted focus:bg-muted ${
            theme === 'light' ? 'bg-muted text-primary' : ''
          }`}
        >
          <Sun className="h-4 w-4" />
          <span className="font-secondary">Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted focus:bg-muted ${
            theme === 'dark' ? 'bg-muted text-primary' : ''
          }`}
        >
          <Moon className="h-4 w-4" />
          <span className="font-secondary">Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted focus:bg-muted ${
            theme === 'system' ? 'bg-muted text-primary' : ''
          }`}
        >
          <Laptop className="h-4 w-4" />
          <span className="font-secondary">Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
