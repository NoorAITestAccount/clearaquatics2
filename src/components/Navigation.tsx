import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Droplets, Fish, BarChart3, Settings, Home, User, LogOut } from 'lucide-react';
import { useAquariumData } from '../hooks/useAquariumData';
import { useAuth } from '../hooks/useAuth';
import clearAquaticsLogo from 'figma:asset/28257e32706956333e89a40006551a433f69b928.png';

type Frame = 'dashboard' | 'aquariums' | 'history';

interface NavigationProps {
  currentFrame: Frame;
  onFrameChange: (frame: Frame) => void;
}

export function Navigation({ currentFrame, onFrameChange }: NavigationProps) {
  const { waterParameters } = useAquariumData();
  const { user, signOut } = useAuth();
  
  const warnings = waterParameters.filter(param => param.status === 'warning' || param.status === 'critical').length;

  const navigationItems = [
    {
      id: 'dashboard' as Frame,
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and alerts'
    },
    {
      id: 'aquariums' as Frame,
      label: 'Aquarium Management',
      icon: Fish,
      description: 'Tanks, aquatic life & water tests'
    },
    {
      id: 'history' as Frame,
      label: 'History',
      icon: BarChart3,
      description: 'Trends & charts'
    }
  ];

  return (
    <div className="bg-card border-b">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img 
              src={clearAquaticsLogo} 
              alt="ClearAquatics Logo" 
              className="h-24 w-auto"
            />
            <p className="text-muted-foreground">
              Track water parameters and aquatic life for crystal clear aquariums
            </p>
          </div>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Frame Selector */}
      <div className="container mx-auto px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentFrame === item.id;
            
            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive 
                    ? 'ring-2 ring-primary bg-primary/5 border-primary/20' 
                    : 'hover:border-primary/30'
                }`}
                onClick={() => onFrameChange(item.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                        {item.label}
                      </span>
                    </div>
                    {item.badge && (
                      <Badge variant="destructive" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}