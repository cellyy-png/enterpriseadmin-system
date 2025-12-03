import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="floating-shape shape1"></div>
                <div className="floating-shape shape2"></div>
                <div className="floating-shape shape3"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h1>企业管理系统</h1>
                    <p>欢迎回来，请登录您的账户</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>邮箱</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="请输入邮箱"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="login-button">
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>测试账号: admin@example.com / password123</p>
                </div>
            </div>
        </div>
    );
}

export default Login;