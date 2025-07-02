
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, CreditCard, Mail } from 'lucide-react';
import PreachingLetter from './PreachingLetter';
import MemberRecord from './MemberRecord';
import MemberCard from './MemberCard';

interface MemberTabsProps {
  children: React.ReactNode;
}

const MemberTabs = ({ children }: MemberTabsProps) => {
  const [activeTab, setActiveTab] = useState('lista');

  const tabs = [
    { id: 'lista', label: 'Lista de Membros', icon: Users },
    { id: 'fichas', label: 'Fichas', icon: FileText },
    { id: 'carteirinhas', label: 'Carteirinhas', icon: CreditCard },
    { id: 'pregacao', label: 'Cartas de Pregação', icon: Mail }
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-[10px] leading-tight">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="lista" className="mt-4">
          {children}
        </TabsContent>

        <TabsContent value="fichas" className="mt-4">
          <MemberRecord />
        </TabsContent>

        <TabsContent value="carteirinhas" className="mt-4">
          <MemberCard />
        </TabsContent>

        <TabsContent value="pregacao" className="mt-4">
          <PreachingLetter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberTabs;
