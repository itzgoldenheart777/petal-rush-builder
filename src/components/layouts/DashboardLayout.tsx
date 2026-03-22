import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { LucideIcon } from 'lucide-react';
import petalLogo from '@/assets/petal-rush-logo.png';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  bottomNavItems?: NavItem[];
}

function SidebarNav({ navItems, title }: { navItems: NavItem[]; title: string }) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-4">
          <img src={petalLogo} alt="PetalRush" className="h-8 w-8 rounded-md object-contain" />
          {!collapsed && <span className="font-bold text-lg text-primary">{title}</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Sign Out'}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function BottomNav({ items }: { items: NavItem[] }) {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              activeClassName="text-primary"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default function DashboardLayout({ children, navItems, title, bottomNavItems }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const mobileNavItems = bottomNavItems || navItems.slice(0, 5);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <SidebarNav navItems={navItems} title={title} />}
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 gap-3 bg-card">
            {!isMobile && <SidebarTrigger />}
            {isMobile && (
              <div className="flex items-center gap-2">
                <img src={petalLogo} alt="PetalRush" className="h-7 w-7 rounded object-contain" />
                <span className="font-bold text-primary">{title}</span>
              </div>
            )}
          </header>
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
            {children}
          </main>
        </div>
        {isMobile && <BottomNav items={mobileNavItems} />}
      </div>
    </SidebarProvider>
  );
}
