import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ user, setUser }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', icon: '📊', label: '数据总览' },
        { path: '/users', icon: '👥', label: '用户管理', permission: 'user' },
        { path: '/products', icon: '🛍️', label: '商品管理', permission: 'product' },
        { path: '/orders', icon: '📦', label: '订单管理', permission: 'order' },
        { path: '/categories', icon: '📁', label: '分类管理', permission: 'category' },
        { path: '/data-screen', icon: '📈', label: '数据大屏' },
        { path: '/ai-assistant', icon: '🤖', label: 'AI助手' }
    ];

    return (
        <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* 侧边栏 */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>{sidebarCollapsed ? '系统' : '企业管理系统'}</h2>
                    <button
                        className="collapse-btn"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <img src={user?.avatar || 'https://ui-avatars.com/api/?name=User'} alt="avatar" />
                        {!sidebarCollapsed && (
                            <div className="user-details">
                                <p className="user-name">{user?.username}</p>
                                <p className="user-role">{user?.role?.displayName}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* 主内容区 */}
            <div className="main-content">
                <header className="top-bar">
                    <div className="breadcrumb">
                        <span>{menuItems.find(i => i.path === location.pathname)?.label || '首页'}</span>
                    </div>

                    <div className="top-bar-actions">
                        <button className="icon-btn notification-btn">
                            🔔
                            <span className="badge">3</span>
                        </button>
                        <button className="icon-btn" onClick={handleLogout}>
                            🚪 退出
                        </button>
                    </div>
                </header>

                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;