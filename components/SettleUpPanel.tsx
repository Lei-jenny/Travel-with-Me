'use client';

import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Member {
  user_id: string;
  username: string;
}

interface Expense {
  id: string;
  currency: string;
  total_amount: number;
  paid_by: string;
  expense_shares?: { user_id: string; amount: number }[];
}

interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

interface Props {
  expenses: Expense[];
  members: Member[];
  onClose: () => void;
}

function calcSettlements(expenses: Expense[], members: Member[], currency: string): Settlement[] {
  const balances: Record<string, number> = {};

  members.forEach(m => { balances[m.user_id] = 0; });

  expenses
    .filter(e => e.currency === currency)
    .forEach(e => {
      balances[e.paid_by] = (balances[e.paid_by] || 0) + Number(e.total_amount);
      e.expense_shares?.forEach(s => {
        balances[s.user_id] = (balances[s.user_id] || 0) - Number(s.amount);
      });
    });

  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, bal]) => {
    const rounded = Math.round(bal * 100) / 100;
    if (rounded < -0.01) debtors.push({ id, amount: -rounded });
    if (rounded > 0.01) creditors.push({ id, amount: rounded });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let di = 0, ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const transfer = Math.min(debtors[di].amount, creditors[ci].amount);
    if (transfer > 0.01) {
      const fromMember = members.find(m => m.user_id === debtors[di].id);
      const toMember = members.find(m => m.user_id === creditors[ci].id);
      settlements.push({
        from: debtors[di].id,
        fromName: fromMember?.username || 'Unknown',
        to: creditors[ci].id,
        toName: toMember?.username || 'Unknown',
        amount: Math.round(transfer * 100) / 100,
      });
    }
    debtors[di].amount -= transfer;
    creditors[ci].amount -= transfer;
    if (debtors[di].amount < 0.01) di++;
    if (creditors[ci].amount < 0.01) ci++;
  }

  return settlements;
}

export default function SettleUpPanel({ expenses, members, onClose }: Props) {
  const currencies = [...new Set(expenses.map(e => e.currency))];

  const allSettlements: Record<string, Settlement[]> = {};
  currencies.forEach(cur => {
    allSettlements[cur] = calcSettlements(expenses, members, cur);
  });

  const hasAny = Object.values(allSettlements).some(s => s.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-rhine-navy border border-rhine-gold/50 rounded-lg relative shadow-[0_0_30px_rgba(197,160,89,0.2)] max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-rhine-navy border-b border-rhine-gold/20 p-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold font-display text-white">Settle Up</h3>
            <p className="text-[10px] font-mono text-rhine-gold uppercase tracking-widest">Optimal Settlements</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-6">
          {!hasAny ? (
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto mb-3 text-green-400" size={40} />
              <p className="text-sm font-display text-white mb-1">All Settled</p>
              <p className="text-xs text-slate-500 font-mono">No outstanding balances</p>
            </div>
          ) : (
            currencies.map(cur => {
              const settlements = allSettlements[cur];
              if (settlements.length === 0) return null;

              const total = expenses
                .filter(e => e.currency === cur)
                .reduce((s, e) => s + Number(e.total_amount), 0);

              return (
                <div key={cur}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-rhine-gold uppercase tracking-widest">{cur}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Total: {total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    {settlements.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-rhine-navy-light border border-rhine-gold/20 rounded-sm"
                      >
                        <div className="flex-1 text-right">
                          <p className="text-sm font-bold text-red-400 font-display">{s.fromName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">PAYS</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-rhine-gold font-mono">{s.amount.toFixed(2)}</span>
                          <ArrowRight size={14} className="text-rhine-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-green-400 font-display">{s.toName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">RECEIVES</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* Per-person summary */}
          {hasAny && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Per Person Summary</h4>
              <div className="space-y-1">
                {members.map(m => {
                  const paid: Record<string, number> = {};
                  const owes: Record<string, number> = {};

                  expenses.forEach(e => {
                    if (e.paid_by === m.user_id) {
                      paid[e.currency] = (paid[e.currency] || 0) + Number(e.total_amount);
                    }
                    e.expense_shares?.forEach(s => {
                      if (s.user_id === m.user_id) {
                        owes[e.currency] = (owes[e.currency] || 0) + Number(s.amount);
                      }
                    });
                  });

                  const allCurs = [...new Set([...Object.keys(paid), ...Object.keys(owes)])];
                  if (allCurs.length === 0) return null;

                  return (
                    <div key={m.user_id} className="px-3 py-2 bg-rhine-navy-light/50 border border-slate-700/50 rounded-sm">
                      <p className="text-xs font-bold text-white font-display mb-1">{m.username}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                        {allCurs.map(cur => {
                          const net = (paid[cur] || 0) - (owes[cur] || 0);
                          return (
                            <span key={cur} className={`text-[10px] font-mono ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {cur}: {net >= 0 ? '+' : ''}{net.toFixed(2)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
