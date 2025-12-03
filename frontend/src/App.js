import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// 组件导入
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import CategoryManagement from './pages/CategoryManagement';
import DataScreen from './pages/DataScreen';
import AIAssistant from './pages/AIAssistant';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// 样式
import './App.css';

// Axios 全局配置
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { data } = await axios.get('/auth/me');
                setUser(data.user);
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>加载中...</p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login setUser={setUser} />} />

                <Route element={<ProtectedRoute user={user} />}>
                    <Route element={<Layout user={user} setUser={setUser} />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/products" element={<ProductManagement />} />
                        <Route path="/orders" element={<OrderManagement />} />
                        <Route path="/categories" element={<CategoryManagement />} />
                        <Route path="/data-screen" element={<DataScreen />} />
                        <Route path="/ai-assistant" element={<AIAssistant />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;