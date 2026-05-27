import React from 'react';

const AdminTable = ({ columns, data, rowKey = 'id', empty = 'Không có dữ liệu' }) => (
  <div className="adm-table-wrap">
    <table className="adm-table">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={{ width: c.width, textAlign: c.align || 'left' }}>{c.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr><td colSpan={columns.length} className="adm-empty">{empty}</td></tr>
        )}
        {data.map((row, i) => (
          <tr key={row[rowKey] ?? i}>
            {columns.map((c) => (
              <td key={c.key} style={{ textAlign: c.align || 'left' }}>
                {c.render ? c.render(row) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <style>{`
      .adm-table-wrap {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border-soft);
        overflow: auto;
      }
      .adm-table { width: 100%; border-collapse: collapse; min-width: 720px; }
      .adm-table thead { background: var(--color-bg-alt); }
      .adm-table th {
        padding: 12px 16px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--color-text-soft);
        font-weight: 600;
        border-bottom: 1px solid var(--color-border-soft);
      }
      .adm-table td {
        padding: 14px 16px;
        font-size: 14px;
        border-bottom: 1px solid var(--color-border-soft);
        vertical-align: middle;
      }
      .adm-table tbody tr:hover { background: var(--color-bg-alt); }
      .adm-empty { text-align: center; padding: 36px; color: var(--color-text-mute); }
    `}</style>
  </div>
);

export default AdminTable;
