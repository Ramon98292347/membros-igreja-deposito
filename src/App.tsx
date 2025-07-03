import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { MemberProvider } from "@/context/MemberContext";
import { ChurchProvider } from "@/context/ChurchContext";
import { InventoryProvider } from "@/context/InventoryContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import MemberForm from "@/pages/MemberForm";
import MemberRecord from "@/pages/MemberRecord";
import MemberCard from "@/pages/MemberCard";
import ChurchManagement from "@/pages/ChurchManagement";
import ChurchForm from "@/pages/ChurchForm";
import Inventory from "@/pages/Inventory";
import InventoryItemForm from "@/pages/InventoryItemForm";
import InventoryMovement from "@/pages/InventoryMovement";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import PreachingLetter from "@/components/PreachingLetter";
import ChurchReassignment from "@/components/ChurchReassignment";
import WorkerForm from "@/components/WorkerForm";
import ContractForm from "@/components/ContractForm";

const App = () => (
  <QueryProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <MemberProvider>
          <ChurchProvider>
            <InventoryProvider>
              <BrowserRouter>
                <Routes>
                  {/* Rotas de Autenticação */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  
                  {/* Rotas Protegidas */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/membros" element={<Members />} />
                          <Route path="/membros/novo" element={<MemberForm />} />
                          <Route path="/membros/editar/:id" element={<MemberForm />} />
                          <Route path="/ficha/:id" element={<MemberRecord />} />
                          <Route path="/ficha" element={<Members />} />
                          <Route path="/carteirinhas/:id" element={<MemberCard />} />
                          <Route path="/carteirinhas" element={<Members />} />
                          <Route path="/carta-pregacao" element={<PreachingLetter />} />
                          <Route path="/ficha-obreiros" element={<WorkerForm />} />
                          <Route path="/igrejas" element={<ChurchManagement />} />
                          <Route path="/igrejas/nova" element={<ChurchForm />} />
                          <Route path="/igrejas/editar/:id" element={<ChurchForm />} />
                          <Route path="/remanejamento" element={<ChurchReassignment />} />
                          <Route path="/contratos" element={<ContractForm />} />
                          <Route path="/deposito" element={<Inventory />} />
                          <Route path="/deposito/item/novo" element={<InventoryItemForm />} />
                          <Route path="/deposito/item/editar/:id" element={<InventoryItemForm />} />
                          <Route path="/deposito/:type" element={<InventoryMovement />} />
                          <Route path="/relatorios" element={<Reports />} />
                          <Route path="/configuracoes" element={<Settings />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </BrowserRouter>
            </InventoryProvider>
          </ChurchProvider>
        </MemberProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryProvider>
);

export default App;
