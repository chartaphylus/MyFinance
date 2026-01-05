import { ReactNode, useState } from 'react';
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
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
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

              <div className="flex items-center space-x-4 relative">
                {/* User Info & Dropdown Trigger */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 pl-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 transition-opacity hover:opacity-80"
                >
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
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {profile?.full_name || "User"}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 lg:hidden">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{profile?.full_name}</p>
                      </div>

                      <button
                        onClick={() => {
                          toggleTheme();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                      >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>

                      <button
                        onClick={() => {
                          signOut();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          {/* Mobile Bottom Navigation - Floating Pill Design */}
          <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl px-2 py-2">
              <div className="flex justify-around items-center">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onPageChange(item.id)}
                      className="relative flex flex-col items-center justify-center w-12 h-12"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-xl"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">
                        <Icon
                          className={`w-6 h-6 transition-colors duration-200 ${isActive
                            ? 'text-white'
                            : 'text-slate-500 dark:text-slate-400'
                            }`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
