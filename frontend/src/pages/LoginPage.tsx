import { LoginForm } from '@/components/auth/LoginForm';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  );
}
