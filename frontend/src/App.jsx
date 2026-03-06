import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import FileDetailPage from './pages/FileDetailPage';
import EmployeePage from './pages/EmployeePage';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/employees" element={<EmployeePage />} />
                        <Route path="/files/:id" element={<FileDetailPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
