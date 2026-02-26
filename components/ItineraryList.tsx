'use client';

import { useState, useEffect } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Map, Edit, Lock, Trash2, Check, X, AlertTriangle, FileText, Square, CheckSquare, Clock } from 'lucide-react';
import GlassCard from './GlassCard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  location: string;
  notes?: string;
  day_date?: string;
  isLocked?: boolean;
  lockedBy?: string;
}

interface SortableItemProps {
  item: ItineraryItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string, updates: Partial<ItineraryItem>) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ item, isSelected, onSelect, onEdit, onDelete }: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editLocation, setEditLocation] = useState(item.location);
  const [editTime, setEditTime] = useState(item.time);
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled: item.isLocked || isEditing });

  const handleEditClick = (e: React.MouseEvent | React.TouchEvent) => {
    setIsEditing(true);
    setEditTitle(item.title);
    setEditLocation(item.location);
    setEditTime(item.time);
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = () => {
    onEdit(item.id, {
      title: editTitle,
      location: editLocation,
      time: editTime,
      notes: editNotes
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(item.title);
    setEditLocation(item.location);
    setEditTime(item.time);
    setEditNotes(item.notes || '');
  };

  const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDeleting) {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    } else {
      onDelete(item.id);
    }
  };

  const handleMapClick = (e: React.MouseEvent | React.TouchEvent) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location || item.title)}`, '_blank');
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative pl-4 mb-8 w-full">
      {/* Selection Checkbox */}
      {!item.isLocked && !isEditing && (
        <div 
          onClick={() => onSelect(item.id)}
          className="absolute -left-[50px] top-6 cursor-pointer text-slate-500 hover:text-rhine-gold transition-colors"
        >
          {isSelected ? <CheckSquare size={16} className="text-rhine-gold" /> : <Square size={16} />}
        </div>
      )}

      {/* Timeline Node */}
      <div className={`absolute -left-[31px] top-5 h-4 w-4 rounded-full border z-10 flex items-center justify-center transition-transform ${item.isLocked ? 'bg-rhine-navy border-rhine-gold shadow-[0_0_15px_rgba(197,160,89,0.6)]' : 'bg-rhine-navy border-rhine-gold group-hover:scale-110'}`}>
        <div className={`h-1.5 w-1.5 bg-rhine-gold rounded-full ${item.isLocked ? 'animate-pulse' : ''}`}></div>
      </div>
      <div className="absolute -left-[14px] top-7 w-4 h-[1px] bg-rhine-gold/50"></div>

      {/* Card Content */}
      <GlassCard className={`relative transition-all duration-300 w-full ${item.isLocked ? 'overflow-hidden' : 'group-hover:translate-x-1'} ${isSelected ? 'border-rhine-gold shadow-[0_0_15px_rgba(197,160,89,0.2)]' : ''}`}>
        {item.isLocked && (
          <>
            <div className="absolute inset-0 z-20 bg-rhine-gold/5 backdrop-blur-[2px] flex items-center justify-center flex-col gap-2 border border-rhine-gold/40">
              <Lock className="text-rhine-gold animate-bounce" size={24} />
              <div className="px-2 py-1 bg-rhine-navy/90 border border-rhine-gold/50 text-[10px] text-rhine-gold font-bold uppercase tracking-widest font-mono shadow-lg">
                Editing: {item.lockedBy}
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-10 opacity-30">
              <div className="w-full h-1 bg-rhine-gold/40 scan-line absolute top-0 left-0"></div>
            </div>
          </>
        )}

        <div className={`p-5 ${item.isLocked ? 'blur-[1px]' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            {isEditing ? (
              <input 
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="bg-rhine-navy/50 border border-rhine-gold/30 text-rhine-gold font-mono text-sm px-1 rounded focus:outline-none focus:border-rhine-gold"
              />
            ) : (
              <span className="text-sm font-mono text-rhine-gold font-bold whitespace-nowrap mr-2">{item.time}</span>
            )}
            
            {!item.isLocked && !isEditing && (
              <div {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-rhine-gold shrink-0 p-1 -mt-1 -mr-1 touch-none">
                <GripVertical size={20} />
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="mb-4 space-y-3">
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-rhine-navy/50 border border-rhine-gold/50 text-white font-display text-xl px-2 py-1 focus:outline-none focus:border-rhine-gold rounded-sm placeholder-slate-600"
                placeholder="Activity Title"
                autoFocus
              />
              <input 
                type="text" 
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full bg-rhine-navy/50 border border-rhine-gold/30 text-slate-300 font-mono text-sm px-2 py-1 focus:outline-none focus:border-rhine-gold rounded-sm placeholder-slate-600"
                placeholder="Location"
              />
              <textarea 
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full bg-rhine-navy/50 border border-rhine-gold/30 text-slate-400 font-mono text-xs px-2 py-1 focus:outline-none focus:border-rhine-gold rounded-sm placeholder-slate-600 min-h-[60px]"
                placeholder="Notes / Instructions..."
              />
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveEdit} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs border border-green-500/50 rounded hover:bg-green-500/30 font-bold uppercase tracking-wider">
                  <Check size={12} /> Save
                </button>
                <button onClick={handleCancelEdit} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 text-xs border border-red-500/50 rounded hover:bg-red-500/30 font-bold uppercase tracking-wider">
                  <X size={12} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="text-xl font-bold text-white font-display tracking-wide mb-1 break-words leading-tight">{item.title}</h4>
              <p className="text-sm text-slate-400 font-mono uppercase tracking-widest mb-3 break-words">{item.location}</p>
              {item.notes && (
                <div className="mb-5 p-3 bg-rhine-gold/5 border-l-2 border-rhine-gold/50 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-1 text-rhine-gold mb-1 text-[10px] uppercase tracking-wider">
                    <FileText size={10} /> Notes
                  </div>
                  {item.notes}
                </div>
              )}
            </>
          )}
          
          {!item.isLocked && !isEditing && (
            <div className="flex gap-3 border-t border-white/5 pt-4 mt-1 relative z-50">
              <button 
                type="button"
                onClick={handleEditClick}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-700 hover:border-rhine-gold/50 hover:bg-rhine-gold/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all rounded-sm cursor-pointer"
              >
                <Edit size={16} />
                Edit
              </button>
              <button 
                type="button"
                onClick={handleMapClick}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-700 hover:border-rhine-gold/50 hover:bg-rhine-gold/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all rounded-sm cursor-pointer"
              >
                <Map size={16} />
                Map
              </button>
              <button 
                type="button"
                onClick={handleDeleteClick}
                className={`flex-none flex items-center justify-center gap-2 py-2.5 px-3 border transition-all rounded-sm cursor-pointer ${
                  isDeleting 
                    ? 'border-red-500 bg-red-500 text-white animate-pulse' 
                    : 'border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-300 hover:text-red-400'
                }`}
                title="Delete"
              >
                {isDeleting ? <AlertTriangle size={16} /> : <Trash2 size={16} />}
                {isDeleting && <span className="text-[10px] font-bold ml-1">CONFIRM</span>}
              </button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

const MOCK_ITEMS: ItineraryItem[] = [];

export default function ItineraryList({ tripId, tripStart }: { tripId?: string | null, tripStart?: string }) {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  
  // Bulk Edit State
  const [bulkTime, setBulkTime] = useState('');
  const [bulkLocation, setBulkLocation] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');

  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const fetchItems = async () => {
        let query = client
          .from('itinerary_items')
          .select('*')
          .order('day_date', { ascending: true })
          .order('start_time', { ascending: true })
          .order('position', { ascending: true });
        
        if (tripId) {
          query = query.eq('trip_id', tripId);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase error:', error);
          setConnectionError(error.message);
          return;
        }

        if (data) {
          const mappedItems = data.map((d: any) => ({
            id: d.id,
            time: d.start_time ? new Date(d.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : 'TBD',
            title: d.title,
            location: d.location || '',
            notes: d.notes || '',
            day_date: d.day_date,
            isLocked: d.is_locked,
            lockedBy: d.locked_by
          }));
          
          setItems(mappedItems);
        }
      };

      fetchItems();

      const channel = client
        .channel('itinerary_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'itinerary_items' }, (payload) => {
          console.log('Change received!', payload);
          fetchItems();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [tripId]);

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkEdit = async () => {
    if (selectedIds.size === 0) return;

    const updates: any = {};
    if (bulkTime) {
      // Need to handle date + time merging, for now just updating time string display locally is tricky
      // Assuming backend expects a full timestamp or we just update a 'time' field if it existed separately
      // But our schema uses start_time (timestamp). 
      // Simplified: We will update the time part of the timestamp for each item.
      // This is complex without knowing each item's date.
      // For this demo, let's assume we just update location and notes which are easier.
      // Time update requires fetching each item's date and reconstructing timestamp.
    }
    if (bulkLocation) updates.location = bulkLocation;
    if (bulkNotes) updates.notes = bulkNotes;

    if (Object.keys(updates).length === 0) {
      alert("Please enter at least one field to update.");
      return;
    }

    // Optimistic Update
    setItems(items.map(item => {
      if (selectedIds.has(item.id)) {
        return { ...item, ...updates };
      }
      return item;
    }));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client
        .from('itinerary_items')
        .update(updates)
        .in('id', Array.from(selectedIds));

      if (error) {
        alert('Bulk update failed: ' + error.message);
        // Revert?
      } else {
        setShowBulkEdit(false);
        setSelectedIds(new Set());
        setBulkLocation('');
        setBulkNotes('');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return;

    // Optimistic
    setItems(items.filter(item => !selectedIds.has(item.id)));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client
        .from('itinerary_items')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) {
        alert('Bulk delete failed: ' + error.message);
      } else {
        setSelectedIds(new Set());
      }
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const client = supabase;
        if (isSupabaseConfigured && client) {
          const updates = newItems.map((item, index) => ({
            id: item.id,
            position: index,
          }));

          updates.forEach(async (update) => {
            await client
              .from('itinerary_items')
              .update({ position: update.position })
              .eq('id', update.id);
          });
        }

        return newItems;
      });
    }
  }

  const handleEditItem = async (id: string, updates: Partial<ItineraryItem>) => {
    // Optimistic update
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      // Prepare updates for DB
      const dbUpdates: any = { ...updates };
      
      // Remove fields that don't exist in DB or need transformation
      delete dbUpdates.id;
      delete dbUpdates.time;
      delete dbUpdates.isLocked;
      delete dbUpdates.lockedBy;
      delete dbUpdates.day_date; // Assuming we don't update date here yet, or if we do, we handle it below

      // Handle time update -> start_time
      if (updates.time) {
        const item = items.find(i => i.id === id);
        if (item && item.day_date) {
          // Construct timestamp from day_date and new time
          // day_date is YYYY-MM-DD, time is HH:MM
          const dateTimeStr = `${item.day_date}T${updates.time}:00`;
          dbUpdates.start_time = new Date(dateTimeStr).toISOString();
        }
      }

      const { error } = await client
        .from('itinerary_items')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item in database: ' + error.message);
        // Revert optimistic update?
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    // Optimistic update
    setItems(items.filter(item => item.id !== id));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client
        .from('itinerary_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item from database: ' + error.message);
        // Revert optimistic update (optional, but good practice)
        // For simplicity, we might just re-fetch or let the user refresh
      }
    }
  };

  // Helper to calculate day number
  const getDayNumber = (dateStr?: string) => {
    if (!tripStart || !dateStr) return 1;
    const start = new Date(tripStart);
    const current = new Date(dateStr);
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + 1;
  };

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const date = item.day_date || 'TBD';
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ItineraryItem[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedItems).sort();

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full min-w-0 relative">
        <div className="mb-4 flex items-center justify-between px-2">
          {connectionError && (
             <div className="text-[9px] text-red-400 font-mono max-w-[150px] truncate" title={connectionError}>
               ERR: {connectionError}
             </div>
          )}
        </div>

        <SortableContext 
          items={items}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col py-2 pr-2 w-full min-w-0 pb-24">
            {sortedDates.map((date) => (
              <div key={date} className="mb-8">
                {/* Day Divider */}
                <div className="flex items-center gap-4 mb-6 -ml-12">
                   <div className="w-12 text-right text-rhine-gold font-bold font-display text-xl">
                     {date === 'TBD' ? '??' : String(getDayNumber(date)).padStart(2, '0')}
                   </div>
                   <div className="h-px bg-rhine-gold/50 flex-1"></div>
                   <div className="text-xs font-mono text-rhine-gold/70 tracking-widest uppercase">
                     {date === 'TBD' ? 'Unscheduled' : `Day ${getDayNumber(date)} // ${date}`}
                   </div>
                </div>

                {groupedItems[date].map((item) => (
                  <SortableItem 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedIds.has(item.id)}
                    onSelect={handleSelect}
                    onEdit={handleEditItem} 
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            ))}

            {items.length === 0 && (
               <div className="text-center py-8 border border-dashed border-slate-700 rounded-lg">
                 <p className="text-xs text-slate-500 font-mono">NO ACTIVITIES PLANNED</p>
                 <p className="text-[10px] text-slate-600 mt-2">Add items to your itinerary to begin.</p>
               </div>
            )}
          </div>
        </SortableContext>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-rhine-navy border border-rhine-gold/50 shadow-[0_0_30px_rgba(197,160,89,0.3)] rounded-lg p-4 z-50 w-[90%] max-w-md flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-rhine-gold/20 pb-2">
              <span className="text-rhine-gold font-bold font-mono text-xs uppercase tracking-widest">{selectedIds.size} Selected</span>
              <button onClick={() => setSelectedIds(new Set())} className="text-slate-400 hover:text-white text-xs">Cancel</button>
            </div>
            
            {showBulkEdit ? (
              <div className="space-y-3">
                 <input 
                  type="text" 
                  value={bulkLocation}
                  onChange={(e) => setBulkLocation(e.target.value)}
                  className="w-full bg-rhine-navy-light border border-rhine-gold/30 text-slate-300 font-mono text-sm px-2 py-1 focus:outline-none focus:border-rhine-gold rounded-sm placeholder-slate-600"
                  placeholder="Set Location for all..."
                />
                <textarea 
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  className="w-full bg-rhine-navy-light border border-rhine-gold/30 text-slate-400 font-mono text-xs px-2 py-1 focus:outline-none focus:border-rhine-gold rounded-sm placeholder-slate-600 min-h-[60px]"
                  placeholder="Set Notes for all..."
                />
                <div className="flex gap-2">
                  <button onClick={handleBulkEdit} className="flex-1 bg-rhine-gold text-rhine-navy font-bold text-xs py-2 rounded uppercase tracking-wider hover:bg-white transition-colors">Apply Changes</button>
                  <button onClick={() => setShowBulkEdit(false)} className="px-3 border border-slate-600 text-slate-400 text-xs rounded hover:text-white">Back</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowBulkEdit(true)} className="flex-1 flex items-center justify-center gap-2 bg-rhine-gold/10 border border-rhine-gold/50 text-rhine-gold py-2 rounded hover:bg-rhine-gold hover:text-rhine-navy transition-colors text-xs font-bold uppercase tracking-wider">
                  <Edit size={14} /> Edit Selected
                </button>
                <button onClick={handleBulkDelete} className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400 py-2 rounded hover:bg-red-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
                  <Trash2 size={14} /> Delete Selected
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DndContext>
  );
}
