// src/components/SchemaManager/TableList.jsx
import React from 'react';
import { PlusIcon } from 'lucide-react';

const TableList = ({ tables, selectedTable, onTableSelect, onAddTable }) => {
  return (
    <div className="table-list">
      <div className="table-list-header">
        <h3>Tables</h3>
        <button
          className="btn btn-sm btn-primary"
          onClick={onAddTable}
          title="Add new table"
        >
          <PlusIcon size={14} />
          <span>Add Table</span>
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="empty-tables">
          <p>No tables defined</p>
          <button 
            className="btn btn-sm btn-primary"
            onClick={onAddTable}
          >
            <PlusIcon size={14} />
            <span>Add Table</span>
          </button>
        </div>
      ) : (
        <ul className="tables-nav">
          {tables.map(table => (
            <li key={table.name}>
              <button
                className={`table-nav-item ${selectedTable && selectedTable.name === table.name ? 'active' : ''}`}
                onClick={() => onTableSelect(table)}
              >
                {table.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TableList;