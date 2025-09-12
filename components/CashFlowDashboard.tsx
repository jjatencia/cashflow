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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="min-h-[44px] min-w-[44px] border-border/50 hover:border-primary/30 transition-all duration-200"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
