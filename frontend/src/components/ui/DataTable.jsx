import React from 'react';
import { cn } from '../../lib/utils';

export default function DataTable({ headers, children, className }) {
  return (
    <div className={cn("w-full bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-subtle", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {headers.map((head, idx) => (
                <th key={idx} className="px-4 py-3">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DataTableRow({ children, className, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors hover:bg-slate-50/60",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({ children, className, colSpan }) {
  return (
    <td colSpan={colSpan} className={cn("px-4 py-3.5 align-middle font-normal", className)}>
      {children}
    </td>
  );
}
