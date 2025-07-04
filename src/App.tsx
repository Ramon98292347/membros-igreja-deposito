import { lazy } from "react";
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
import ErrorBoundary from "@/components/ErrorBoundary";
import { LazyWrapper } from "@/components/LazyWrapper";

// Lazy loading das páginas para melhor performance
const Login = lazy(() => import("@/pages/Login"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Members = lazy(() => import("@/pages/Members"));
const MemberForm = lazy(() => import("@/pages/MemberForm"));
const MemberRecord = lazy(() => import("@/pages/MemberRecord"));
const MemberCard = lazy(() => import("@/pages/MemberCard"));
const ChurchManagement = lazy(() => import("@/pages/ChurchManagement"));
const ChurchForm = lazy(() => import("@/pages/ChurchForm"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const InventoryItemForm = lazy(() => import("@/pages/InventoryItemForm"));
const InventoryMovement = lazy(() => import("@/pages/InventoryMovement"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Lazy loading dos componentes
const PreachingLetter = lazy(() => import("@/components/PreachingLetter"));
const ChurchReassignment = lazy(() => import("@/components/ChurchReassignment"));
const WorkerForm = lazy(() => import("@/components/WorkerForm"));
const ContractForm = lazy(() => import("@/components/ContractForm"));

const App = () => (
  <ErrorBoundary>
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
                    <Route path="/login" element={
                      <LazyWrapper>
                        <Login />
                      </LazyWrapper>
                    } />
                    <Route path="/signup" element={
                      <LazyWrapper>
                        <SignUp />
                      </LazyWrapper>
                    } />
                    
                    {/* Rotas Protegidas */}
                    <Route path="/*" element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={
                              <LazyWrapper>
                                <Dashboard />
                              </LazyWrapper>
                            } />
                            <Route path="/membros" element={
                              <LazyWrapper>
                                <Members />
                              </LazyWrapper>
                            } />
                            <Route path="/membros/novo" element={
                              <LazyWrapper>
                                <MemberForm />
                              </LazyWrapper>
                            } />
                            <Route path="/membros/editar/:id" element={
                              <LazyWrapper>
                                <MemberForm />
                              </LazyWrapper>
                            } />
                            <Route path="/ficha/:id" element={
                              <LazyWrapper>
                                <MemberRecord />
                              </LazyWrapper>
                            } />
                            <Route path="/ficha" element={
                              <LazyWrapper>
                                <Members />
                              </LazyWrapper>
                            } />
                            <Route path="/carteirinhas/:id" element={
                              <LazyWrapper>
                                <MemberCard />
                              </LazyWrapper>
                            } />
                            <Route path="/carteirinhas" element={
                              <LazyWrapper>
                                <Members />
                              </LazyWrapper>
                            } />
                            <Route path="/carta-pregacao" element={
                              <LazyWrapper>
                                <PreachingLetter />
                              </LazyWrapper>
                            } />
                            <Route path="/ficha-obreiros" element={
                              <LazyWrapper>
                                <WorkerForm />
                              </LazyWrapper>
                            } />
                            <Route path="/igrejas" element={
                              <LazyWrapper>
                                <ChurchManagement />
                              </LazyWrapper>
                            } />
                            <Route path="/igrejas/nova" element={
                              <LazyWrapper>
                                <ChurchForm />
                              </LazyWrapper>
                            } />
                            <Route path="/igrejas/editar/:id" element={
                              <LazyWrapper>
                                <ChurchForm />
                              </LazyWrapper>
                            } />
                            <Route path="/remanejamento" element={
                              <LazyWrapper>
                                <ChurchReassignment />
                              </LazyWrapper>
                            } />
                            <Route path="/contratos" element={
                              <LazyWrapper>
                                <ContractForm />
                              </LazyWrapper>
                            } />
                            <Route path="/deposito" element={
                              <LazyWrapper>
                                <Inventory />
                              </LazyWrapper>
                            } />
                            <Route path="/deposito/item/novo" element={
                              <LazyWrapper>
                                <InventoryItemForm />
                              </LazyWrapper>
                            } />
                            <Route path="/deposito/item/editar/:id" element={
                              <LazyWrapper>
                                <InventoryItemForm />
                              </LazyWrapper>
                            } />
                            <Route path="/deposito/:type" element={
                              <LazyWrapper>
                                <InventoryMovement />
                              </LazyWrapper>
                            } />
                            <Route path="/relatorios" element={
                              <LazyWrapper>
                                <Reports />
                              </LazyWrapper>
                            } />
                            <Route path="/configuracoes" element={
                              <LazyWrapper>
                                <Settings />
                              </LazyWrapper>
                            } />
                            <Route path="*" element={
                              <LazyWrapper>
                                <NotFound />
                              </LazyWrapper>
                            } />
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
  </ErrorBoundary>
);

export default App;