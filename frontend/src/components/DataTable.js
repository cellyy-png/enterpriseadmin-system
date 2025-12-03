import React from 'react';
import './DataTable.css';

function DataTable({ columns, data, loading, pagination, onPageChange }) {
    if (loading) {
        return <div className="table-loading">加载中...</div>;
    }

    if (!data || data.length === 0) {
        return <div className="table-empty">暂无数据</div>;
    }

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                <tr>
                    {columns.map(col => (
                        <th key={col.key}>
                            {col.label}
                            {col.sortable && <span className="sort-icon">⇅</span>}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, index) => (
                    <tr key={row._id || index}>
                        {columns.map(col => (
                            <td key={col.key}>
                                {col.render ? col.render(row) : row[col.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            {pagination && (
                <div className="table-pagination">
                    <div className="pagination-info">
                        显示 {((pagination.page - 1) * pagination.limit) + 1} 到{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                        共 {pagination.total} 条
                    </div>
                    <div className="pagination-controls">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            上一页
                        </button>
                        <span className="page-numbers">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const pageNum = pagination.page - 2 + i;
                  if (pageNum < 1 || pageNum > pagination.pages) return null;
                  return (
                      <button
                          key={pageNum}
                          className={pageNum === pagination.page ? 'active' : ''}
                          onClick={() => onPageChange(pageNum)}
                      >
                          {pageNum}
                      </button>
                  );
              })}
            </span>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                        >
                            下一页
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;