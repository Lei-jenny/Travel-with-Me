'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { X, Loader2, Check, Trash2 } from 'lucide-react';

interface Member {
  user_id: string;
  username: string;
  role: string;
}

interface ItineraryItem {
  id: string;
  title: string;
  start_time: string;
  day_date: string;
}

interface EditExpense {
  id: string;
  itinerary_item_id: string | null;
  title: string;
  event_time: string;
  currency: string;
  total_amount: number;
  paid_by: string;
  split_type: string;
  expense_shares?: { user_id: string; amount: number }[];
}

interface Props {
  tripId: string;
  members: Member[];
  itineraryItems: ItineraryItem[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
  editExpense?: EditExpense | null;
}

const CURRENCIES = ['CNY', 'USD', 'EUR', 'JPY', 'THB', 'GBP', 'KRW', 'SGD', 'HKD', 'TWD'];

export default function AddExpenseModal({ tripId, members, itineraryItems, onClose, onSaved, onDeleted, editExpense }: Props) {
  const { user } = useAuth();
  const isEditing = !!editExpense;
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [linkedItemId, setLinkedItemId] = useState<string>(editExpense?.itinerary_item_id || '');
  const [title, setTitle] = useState(editExpense?.title || '');
  const [eventTime, setEventTime] = useState(
    editExpense?.event_time ? editExpense.event_time.slice(0, 16) : ''
  );
  const [currency, setCurrency] = useState(editExpense?.currency || 'CNY');
  const [totalAmount, setTotalAmount] = useState(
    editExpense ? String(editExpense.total_amount) : ''
  );
  const [paidBy, setPaidBy] = useState(editExpense?.paid_by || user?.id || '');
  const [splitType, setSplitType] = useState<'even' | 'custom'>(
    (editExpense?.split_type as 'even' | 'custom') || 'even'
  );
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(() => {
    if (editExpense?.expense_shares && editExpense.expense_shares.length > 0) {
      return new Set(editExpense.expense_shares.map(s => s.user_id));
    }
    return new Set(members.map(m => m.user_id));
  });
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(() => {
    if (editExpense?.expense_shares && editExpense.split_type === 'custom') {
      const amounts: Record<string, string> = {};
      editExpense.expense_shares.forEach(s => {
        amounts[s.user_id] = String(s.amount);
      });
      return amounts;
    }
    return {};
  });

  const handleLinkItem = (itemId: string) => {
    setLinkedItemId(itemId);
    if (itemId) {
      const item = itineraryItems.find(i => i.id === itemId);
      if (item) {
        setTitle(item.title);
        if (item.start_time) {
          setEventTime(item.start_time.slice(0, 16));
        } else if (item.day_date) {
          setEventTime(item.day_date + 'T12:00');
        }
      }
    }
  };

  const toggleParticipant = (userId: string) => {
    const next = new Set(selectedParticipants);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    setSelectedParticipants(next);
  };

  const handleSave = async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    const amount = parseFloat(totalAmount);
    if (!title.trim()) { setError('Please enter a title'); return; }
    if (isNaN(amount) || amount <= 0) { setError('Please enter a valid amount'); return; }
    if (!paidBy) { setError('Please select who paid'); return; }
    if (selectedParticipants.size === 0) { setError('Please select at least one participant'); return; }

    if (splitType === 'custom') {
      const customTotal = Array.from(selectedParticipants).reduce((sum, uid) => {
        return sum + (parseFloat(customAmounts[uid] || '0') || 0);
      }, 0);
      if (Math.abs(customTotal - amount) > 0.01) {
        setError(`Custom amounts (${customTotal.toFixed(2)}) must equal total (${amount.toFixed(2)})`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    const expenseData = {
      trip_id: tripId,
      itinerary_item_id: linkedItemId || null,
      title: title.trim(),
      event_time: eventTime || null,
      currency,
      total_amount: amount,
      paid_by: paidBy,
      split_type: splitType,
    };

    let expenseId: string;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', editExpense!.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      expenseId = editExpense!.id;

      await supabase.from('expense_shares').delete().eq('expense_id', expenseId);
    } else {
      const { data: expense, error: insertError } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();

      if (insertError || !expense) {
        setError(insertError?.message || 'Failed to save expense');
        setSaving(false);
        return;
      }
      expenseId = expense.id;
    }

    const participantArray = Array.from(selectedParticipants);
    const shares = participantArray.map(uid => ({
      expense_id: expenseId,
      user_id: uid,
      amount: splitType === 'even'
        ? parseFloat((amount / participantArray.length).toFixed(2))
        : parseFloat(customAmounts[uid] || '0'),
    }));

    const { error: sharesError } = await supabase
      .from('expense_shares')
      .insert(shares);

    if (sharesError) {
      setError('Expense saved but failed to save shares: ' + sharesError.message);
    }

    setSaving(false);
    onSaved();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    if (!supabase || !editExpense) return;

    setDeleting(true);
    const { error } = await supabase.from('expenses').delete().eq('id', editExpense.id);
    if (error) {
      setError('Failed to delete: ' + error.message);
      setDeleting(false);
      return;
    }
    setDeleting(false);
    onDeleted?.();
    onClose();
  };

  const allItineraryItems = isEditing && editExpense?.itinerary_item_id
    ? [...itineraryItems, ...(itineraryItems.find(i => i.id === editExpense.itinerary_item_id) ? [] : [{ id: editExpense.itinerary_item_id, title: editExpense.title, start_time: '', day_date: '' }])]
    : itineraryItems;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-rhine-navy border border-rhine-gold/50 rounded-t-lg sm:rounded-lg relative shadow-[0_0_30px_rgba(197,160,89,0.2)] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-rhine-navy border-b border-rhine-gold/20 p-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold font-display text-white">{isEditing ? 'Edit Expense' : 'Add Expense'}</h3>
            <p className="text-[10px] font-mono text-rhine-gold uppercase tracking-widest">{isEditing ? 'Modify Transaction' : 'Log Transaction'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Link to itinerary item */}
          {allItineraryItems.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link to Activity (Optional)</label>
              <select
                value={linkedItemId}
                onChange={e => handleLinkItem(e.target.value)}
                className="w-full bg-rhine-navy-light border border-rhine-gold/30 rounded p-2 text-sm text-white focus:border-rhine-gold outline-none"
              >
                <option value="">Manual entry</option>
                {allItineraryItems.map(item => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-rhine-navy-light border border-rhine-gold/30 rounded p-2 text-sm text-white focus:border-rhine-gold outline-none"
              placeholder="e.g. Dinner at Isetan"
            />
          </div>

          {/* Time */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</label>
            <input
              type="datetime-local"
              value={eventTime}
              onChange={e => setEventTime(e.target.value)}
              className="w-full bg-rhine-navy-light border border-rhine-gold/30 rounded p-2 text-sm text-white focus:border-rhine-gold outline-none [color-scheme:dark]"
            />
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-[1fr_100px] gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                className="w-full bg-rhine-navy-light border border-rhine-gold/30 rounded p-2 text-sm text-white focus:border-rhine-gold outline-none font-mono"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-rhine-navy-light border border-rhine-gold/30 rounded p-2 text-sm text-white focus:border-rhine-gold outline-none"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Paid by */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid By</label>
            <select
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="w-full bg-rhine-navy-light border border-rhine-gold/30 rounded p-2 text-sm text-white focus:border-rhine-gold outline-none"
            >
              <option value="">Select payer</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>{m.username}</option>
              ))}
            </select>
          </div>

          {/* Split type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Split Method</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSplitType('even')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all ${
                  splitType === 'even'
                    ? 'bg-rhine-gold text-rhine-navy border-rhine-gold'
                    : 'border-slate-600 text-slate-400 hover:border-rhine-gold/50'
                }`}
              >
                Even Split
              </button>
              <button
                onClick={() => setSplitType('custom')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all ${
                  splitType === 'custom'
                    ? 'bg-rhine-gold text-rhine-navy border-rhine-gold'
                    : 'border-slate-600 text-slate-400 hover:border-rhine-gold/50'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Participants ({selectedParticipants.size})
            </label>
            <div className="space-y-1">
              {members.map(m => {
                const isSelected = selectedParticipants.has(m.user_id);
                const evenShare = totalAmount && selectedParticipants.size > 0
                  ? (parseFloat(totalAmount) / selectedParticipants.size).toFixed(2)
                  : '0.00';

                return (
                  <div key={m.user_id} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleParticipant(m.user_id)}
                      className={`flex items-center gap-2 flex-1 p-2 rounded-sm border text-left transition-all ${
                        isSelected
                          ? 'border-rhine-gold/50 bg-rhine-gold/10'
                          : 'border-slate-700 bg-rhine-navy-light/50 opacity-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                        isSelected ? 'bg-rhine-gold border-rhine-gold' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check size={12} className="text-rhine-navy" />}
                      </div>
                      <span className="text-xs text-white font-mono">{m.username}</span>
                    </button>

                    {splitType === 'custom' && isSelected && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customAmounts[m.user_id] || ''}
                        onChange={e => setCustomAmounts({ ...customAmounts, [m.user_id]: e.target.value })}
                        className="w-24 bg-rhine-navy-light border border-rhine-gold/30 rounded p-2 text-xs text-white focus:border-rhine-gold outline-none font-mono text-right"
                        placeholder="0.00"
                      />
                    )}

                    {splitType === 'even' && isSelected && (
                      <span className="w-24 text-right text-xs text-rhine-gold font-mono">{evenShare}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/30 p-2 rounded">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className={`flex gap-3 ${isEditing ? '' : ''}`}>
            {isEditing && (
              <button
                onClick={handleDelete}
                disabled={deleting || saving}
                className={`py-3 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm border transition-all disabled:opacity-50 ${
                  confirmDelete
                    ? 'bg-red-500 text-white border-red-400 animate-pulse'
                    : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Trash2 size={16} />
                {deleting ? '...' : confirmDelete ? 'Confirm' : ''}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="flex-1 py-3 bg-rhine-gold text-rhine-navy font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 rounded-sm shadow-[0_0_15px_rgba(197,160,89,0.3)] disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : isEditing ? 'Update Expense' : 'Log Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
