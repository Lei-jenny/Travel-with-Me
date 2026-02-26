'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScreenHeader from '@/components/ScreenHeader';
import GlassCard from '@/components/GlassCard';
import AddExpenseModal from '@/components/AddExpenseModal';
import SettleUpPanel from '@/components/SettleUpPanel';
import { motion } from 'motion/react';
import { Plus, Loader2, MapPin, Calendar, Wallet, ChevronRight, ArrowLeft, Receipt, Scale } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { format } from 'date-fns';

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

interface ItineraryItem {
  id: string;
  title: string;
  start_time: string;
  day_date: string;
}

interface Member {
  user_id: string;
  username: string;
  role: string;
}

interface Expense {
  id: string;
  trip_id: string;
  itinerary_item_id: string | null;
  title: string;
  event_time: string;
  currency: string;
  total_amount: number;
  paid_by: string;
  split_type: string;
  paid_by_profile?: { username: string };
  expense_shares?: { user_id: string; amount: number }[];
}

const CURRENCIES = ['CNY', 'USD', 'EUR', 'JPY', 'THB', 'GBP', 'KRW', 'SGD', 'HKD', 'TWD'];

export default function ExpensesPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showSettleUp, setShowSettleUp] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!isSupabaseConfigured || !supabase || !user) return;
      const { data } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTrips(data);
      setLoading(false);
    };
    fetchTrips();
  }, [user]);

  const selectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    if (!supabase) return;

    const [itemsRes, membersRes, expensesRes] = await Promise.all([
      supabase
        .from('itinerary_items')
        .select('id, title, start_time, day_date')
        .eq('trip_id', trip.id)
        .order('day_date', { ascending: true })
        .order('position', { ascending: true }),
      supabase
        .from('trip_members')
        .select('user_id, role, profiles(username)')
        .eq('trip_id', trip.id),
      supabase
        .from('expenses')
        .select('*, paid_by_profile:profiles!expenses_paid_by_fkey(username), expense_shares(user_id, amount)')
        .eq('trip_id', trip.id)
        .order('event_time', { ascending: true }),
    ]);

    if (itemsRes.data) setItineraryItems(itemsRes.data);
    if (membersRes.data) {
      setMembers(membersRes.data.map((m: any) => ({
        user_id: m.user_id,
        username: m.profiles?.username || 'Unknown',
        role: m.role,
      })));
    }
    if (expensesRes.data) setExpenses(expensesRes.data as Expense[]);
  };

  const refreshExpenses = async () => {
    if (!supabase || !selectedTrip) return;
    const { data } = await supabase
      .from('expenses')
      .select('*, paid_by_profile:profiles!expenses_paid_by_fkey(username), expense_shares(user_id, amount)')
      .eq('trip_id', selectedTrip.id)
      .order('event_time', { ascending: true });
    if (data) setExpenses(data as Expense[]);
  };

  const syncedItemIds = new Set(expenses.filter(e => e.itinerary_item_id).map(e => e.itinerary_item_id));
  const unsyncedItems = itineraryItems.filter(item => !syncedItemIds.has(item.id));

  const totalByCurrency: Record<string, number> = {};
  expenses.forEach(e => {
    totalByCurrency[e.currency] = (totalByCurrency[e.currency] || 0) + Number(e.total_amount);
  });

  // Mission selector view
  if (!selectedTrip) {
    return (
      <div className="min-h-screen bg-rhine-bg text-slate-100 relative pb-24">
        <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30 z-0"></div>
        <ScreenHeader title="Ledger" subtitle="Expense Terminal" />
        <main className="flex-1 p-6 relative z-10">
          <h2 className="text-sm font-bold text-rhine-gold uppercase tracking-widest mb-6">Select Mission</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-rhine-gold" />
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-lg">
              <p className="text-xs text-slate-500 font-mono">NO MISSIONS FOUND</p>
              <Link href="/trips/new" className="mt-4 inline-block text-rhine-gold text-xs underline">Create a Mission First</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button onClick={() => selectTrip(trip)} className="w-full text-left">
                    <GlassCard className="p-4 hover:border-rhine-gold/60 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold text-white font-display tracking-wide mb-1">{trip.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono uppercase tracking-widest">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {trip.destination || 'Unknown'}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {trip.start_date || 'TBD'}</span>
                          </div>
                        </div>
                        <ChevronRight className="text-rhine-gold" size={20} />
                      </div>
                    </GlassCard>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Expense list view
  return (
    <div className="min-h-screen bg-rhine-bg text-slate-100 relative pb-24">
      <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30 z-0"></div>

      {(showAddModal || editingExpense) && (
        <AddExpenseModal
          tripId={selectedTrip.id}
          members={members}
          itineraryItems={editingExpense ? itineraryItems : unsyncedItems}
          onClose={() => { setShowAddModal(false); setEditingExpense(null); }}
          onSaved={refreshExpenses}
          onDeleted={refreshExpenses}
          editExpense={editingExpense}
        />
      )}

      {showSettleUp && (
        <SettleUpPanel
          expenses={expenses}
          members={members}
          onClose={() => setShowSettleUp(false)}
        />
      )}

      <ScreenHeader
        title={selectedTrip.title}
        subtitle="Expense Ledger"
        rightElement={
          <button
            onClick={() => setShowSettleUp(true)}
            className="p-2 text-rhine-gold hover:bg-rhine-gold/10 rounded border border-transparent hover:border-rhine-gold/30 transition-all"
            title="Settle Up"
          >
            <Scale size={18} />
          </button>
        }
      />

      <main className="flex-1 relative z-10">
        {/* Back + Summary Bar */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setSelectedTrip(null)}
            className="flex items-center gap-1 text-xs text-rhine-gold font-mono uppercase tracking-widest mb-4 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Missions
          </button>

          {Object.keys(totalByCurrency).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(totalByCurrency).map(([cur, amt]) => (
                <div key={cur} className="px-3 py-1.5 bg-rhine-navy-light border border-rhine-gold/20 rounded-sm">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{cur}</span>
                  <span className="ml-2 text-sm font-bold text-rhine-gold font-mono">{amt.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Itinerary items not yet logged */}
        {unsyncedItems.length > 0 && (
          <div className="px-4 mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Unlogged Activities</h3>
            <div className="space-y-1">
              {unsyncedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-rhine-navy-light/50 border border-slate-700/50 rounded-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-slate-600 rounded-full"></div>
                    <div>
                      <p className="text-xs text-slate-300">{item.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.day_date || (item.start_time ? format(new Date(item.start_time), 'MMM d') : 'No date')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono">NO EXPENSE</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logged expenses */}
        <div className="px-4">
          <h3 className="text-[10px] font-bold text-rhine-gold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Receipt size={12} /> Logged Expenses ({expenses.length})
          </h3>
          {expenses.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-700 rounded-lg">
              <Wallet className="mx-auto mb-2 text-slate-600" size={24} />
              <p className="text-xs text-slate-500 font-mono">NO EXPENSES LOGGED YET</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {expenses.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    className="w-full text-left"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <GlassCard className="p-3 hover:border-rhine-gold/60 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white font-display truncate">{expense.title}</p>
                            {expense.itinerary_item_id && (
                              <span className="text-[8px] px-1 py-0.5 bg-rhine-gold/10 border border-rhine-gold/30 rounded-sm text-rhine-gold font-mono flex-shrink-0">LINKED</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {expense.event_time ? format(new Date(expense.event_time), 'MMM d, HH:mm') : 'No time'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Paid by {(expense.paid_by_profile as any)?.username || 'Unknown'}
                            </span>
                          </div>
                          {expense.expense_shares && expense.expense_shares.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {expense.expense_shares.map(share => {
                                const member = members.find(m => m.user_id === share.user_id);
                                return (
                                  <span key={share.user_id} className="text-[9px] px-1.5 py-0.5 bg-rhine-navy-light border border-slate-700 rounded-sm text-slate-400 font-mono">
                                    {member?.username || '?'}: {expense.currency} {Number(share.amount).toFixed(2)}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-lg font-bold text-rhine-gold font-mono">{Number(expense.total_amount).toFixed(2)}</p>
                          <p className="text-[10px] text-rhine-gold/60 font-mono">{expense.currency}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FAB: Add Expense */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 h-14 w-14 bg-rhine-navy text-rhine-gold rounded-sm shadow-[0_0_20px_rgba(197,160,89,0.3)] flex items-center justify-center hover:bg-rhine-gold hover:text-rhine-navy hover:scale-105 transition-all z-30 border border-rhine-gold/50 group"
      >
        <div className="absolute inset-0 border border-rhine-gold transform scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500 rounded-sm"></div>
        <Plus size={30} />
      </button>
    </div>
  );
}
