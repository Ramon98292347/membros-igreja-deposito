
import { Building, Users, FileText, CreditCard, BarChart3, Settings, Package, Home, Menu, LogOut, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, logout, syncData, isSyncing } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/membros', icon: Users, label: 'Membros' },
    { path: '/igrejas', icon: Building, label: 'Igrejas' },
    { path: '/deposito', icon: Package, label: 'Depósito' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/membros') {
      return location.pathname === '/membros' || location.pathname.startsWith('/membros') || location.pathname.startsWith('/ficha') || location.pathname.startsWith('/carteirinhas');
    }
    return location.pathname.startsWith(path);
  };

  const handleSyncData = async () => {
    await syncData();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/lovable-uploads/5cab3472-2cff-4f24-861b-7a00213f6fa3.png" 
                alt="Igreja Pentecostal Deus é Amor" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-xl font-bold gradient-text">IPDA</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Sistema de Gestão</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-4 xl:space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Menu and Mobile Navigation */}
          <div className="flex items-center space-x-2">
            {/* Sync Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSyncData}
              disabled={isSyncing}
              className="hidden sm:flex"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden md:inline">
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSyncData} disabled={isSyncing} className="sm:hidden">
                  <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white mr-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link
                          to={item.path}
                          className={`flex items-center space-x-2 w-full px-2 py-2 ${
                            isActive(item.path)
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-600'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
