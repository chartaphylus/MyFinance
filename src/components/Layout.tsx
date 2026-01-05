import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  CheckSquare,
  FileText,
  User,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Trans.', icon: CreditCard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'todos', label: 'Todos', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <img
                    src="/logo_circular_frame_white.png"
                    alt="Logo"
                    className="w-12 h-12 object-contain border-4 border-transparent rounded-full shadow-lg"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent truncate">
                    MyFinance
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Financial Management
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={signOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              {/* Mobile Only Logo/Title since Sidebar is hidden */}
              <div className="lg:hidden flex items-center space-x-2">
                 <img
                    src="/logo_circular_frame_white.png"
                    alt="Logo"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">MyFinance</span>
              </div>
              <div className="hidden lg:block"></div> {/* Spacer for desktop */}

              <div className="flex items-center space-x-4">
                {/* Mobile Actions (Theme/Logout) */}
                <div className="flex lg:hidden items-center text-slate-600 dark:text-slate-400 space-x-3">
                   <button onClick={toggleTheme} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                     {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                   </button>
                   <button onClick={signOut} className="p-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                     <LogOut className="w-5 h-5" />
                   </button>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      profile?.full_name?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {profile?.full_name || "User"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 pb-safe">
            <div className="flex justify-around items-center px-2 py-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'text-cyan-500 dark:text-cyan-400 scale-110'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <div className={`relative p-1.5 rounded-full transition-all ${isActive ? 'bg-cyan-500/10' : ''}`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : 'stroke-current'}`} strokeWidth={isActive ? 2.5 : 2} />
                      {isActive && (
                         <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full" />
                      )}
                    </div>
                    {/* Optional: Hide labels on very small screens or keep them small */}
                    <span className={`text-[10px] font-medium mt-1 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
