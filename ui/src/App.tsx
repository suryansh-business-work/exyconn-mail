import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme";
import { AuthProvider } from "./modules/auth/AuthContext";
import { ToastProvider } from "./hooks/useToast";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./modules/auth/LoginPage";
import RegisterPage from "./modules/auth/RegisterPage";
import DashboardPage from "./modules/dashboard/DashboardPage";
import DomainsPage from "./modules/domains/DomainsPage";
import MailboxesPage from "./modules/mailboxes/MailboxesPage";
import MailLogsPage from "./modules/mail/MailLogsPage";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/domains"
                element={
                  <ProtectedRoute roles={["admin", "domain-owner"]}>
                    <AppLayout>
                      <DomainsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mailboxes"
                element={
                  <ProtectedRoute roles={["admin", "domain-owner"]}>
                    <AppLayout>
                      <MailboxesPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mail-logs"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MailLogsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
