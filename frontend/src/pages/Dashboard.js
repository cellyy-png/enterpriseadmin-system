import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

function Dashboard() {
    const [overview, setOverview] = useState({});
    const [salesTrend, setSalesTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [overviewRes, salesRes] = await Promise.all([
                axios.get('/dashboard/overview'),
                axios.get('/dashboard/sales-trend?period=7days')
            ]);

            setOverview(overviewRes.data);
            setSalesTrend(salesRes.data.salesData);
        } catch (error) {
            console.error('加载仪表盘数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="dashboard">
            <h1 className="page-title">数据总览</h1>

            {/* 关键指标卡片 */}
            <div className="metrics-grid">
                <MetricCard
                    title="总用户数"
                    value={overview.totalUsers}
                    change={`+${overview.todayUsers} 今日新增`}
                    icon="👥"
                    color="#5b8def"
                />
                <MetricCard
                    title="总订单数"
                    value={overview.totalOrders}
                    change={`+${overview.todayOrders} 今日订单`}
                    icon="📦"
                    color="#49cc90"
                />
                <MetricCard
                    title="总销售额"
                    value={`¥${(overview.totalRevenue || 0).toLocaleString()}`}
                    change="+12.5% 较上月"
                    icon="💰"
                    color="#f7b84b"
                />
                <MetricCard
                    title="商品总数"
                    value={overview.totalProducts}
                    change="活跃商品"
                    icon="🛍️"
                    color="#f1556c"
                />
            </div>

            {/* 图表区域 */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>销售趋势（近7天）</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#5b8def" strokeWidth={2} name="销售额" />
                            <Line type="monotone" dataKey="orders" stroke="#49cc90" strokeWidth={2} name="订单数" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>订单状态分布</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: '待处理', value: 30 },
                                    { name: '处理中', value: 45 },
                                    { name: '已完成', value: 80 },
                                    { name: '已取消', value: 5 }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {COLORS.map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 快速操作 */}
            <div className="quick-actions">
                <h3>快速操作</h3>
                <div className="action-buttons">
                    <ActionButton icon="➕" text="新增用户" onClick={() => {}} />
                    <ActionButton icon="📦" text="新增订单" onClick={() => {}} />
                    <ActionButton icon="🛍️" text="新增商品" onClick={() => {}} />
                    <ActionButton icon="📊" text="生成报告" onClick={() => {}} />
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, icon, color }) {
    return (
        <div className="metric-card" style={{ borderLeftColor: color }}>
            <div className="metric-icon" style={{ background: color }}>{icon}</div>
            <div className="metric-info">
                <p className="metric-title">{title}</p>
                <h2 className="metric-value">{value}</h2>
                <p className="metric-change">{change}</p>
            </div>
        </div>
    );
}

function ActionButton({ icon, text, onClick }) {
    return (
        <button className="action-button" onClick={onClick}>
            <span className="action-icon">{icon}</span>
            <span className="action-text">{text}</span>
        </button>
    );
}

export default Dashboard;
