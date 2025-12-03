import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import './UserManagement.css';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        status: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, [filters]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/users', { params: filters });
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('加载用户失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('确定要删除该用户吗？')) {
            try {
                await axios.delete(`/users/${userId}`);
                loadUsers();
            } catch (error) {
                alert('删除失败: ' + error.response?.data?.error);
            }
        }
    };

    const columns = [
        { key: 'username', label: '用户名', sortable: true },
        { key: 'email', label: '邮箱', sortable: true },
        {
            key: 'role',
            label: '角色',
            render: (row) => <span className="badge">{row.role?.displayName}</span>
        },
        {
            key: 'status',
            label: '状态',
            render: (row) => (
                <span className={`status-badge status-${row.status}`}>
          {row.status === 'active' ? '激活' : '停用'}
        </span>
            )
        },
        {
            key: 'createdAt',
            label: '创建时间',
            render: (row) => new Date(row.createdAt).toLocaleDateString('zh-CN')
        },
        {
            key: 'actions',
            label: '操作',
            render: (row) => (
                <div className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(row)}>编辑</button>
                    <button className="btn-delete" onClick={() => handleDelete(row._id)}>删除</button>
                </div>
            )
        }
    ];

    return (
        <div className="user-management">
            <div className="page-header">
                <h1>用户管理</h1>
                <button className="btn-primary" onClick={() => { setSelectedUser(null); setShowModal(true); }}>
                    ➕ 新增用户
                </button>
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="搜索用户名或邮箱..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="search-input"
                />
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="filter-select"
                >
                    <option value="">全部状态</option>
                    <option value="active">激活</option>
                    <option value="inactive">停用</option>
                </select>
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setFilters({ ...filters, page })}
            />

            {showModal && (
                <Modal onClose={() => setShowModal(false)} title={selectedUser ? '编辑用户' : '新增用户'}>
                    <UserForm user={selectedUser} onSuccess={() => { setShowModal(false); loadUsers(); }} />
                </Modal>
            )}
        </div>
    );
}

function UserForm({ user, onSuccess }) {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        role: user?.role?._id || '',
        status: user?.status || 'active'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (user) {
                await axios.put(`/users/${user._id}`, formData);
            } else {
                await axios.post('/auth/register', formData);
            }
            onSuccess();
        } catch (error) {
            alert('操作失败: ' + error.response?.data?.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
                <label>用户名</label>
                <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <label>邮箱</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>
            {!user && (
                <div className="form-group">
                    <label>密码</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
            )}
            <div className="form-group">
                <label>状态</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                    <option value="active">激活</option>
                    <option value="inactive">停用</option>
                </select>
            </div>
            <button type="submit" className="btn-primary">
                {user ? '更新' : '创建'}
            </button>
        </form>
    );
}

export default UserManagement;