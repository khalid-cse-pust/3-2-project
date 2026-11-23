import React, { useState, useEffect } from 'react';
import { 
  DoorOpen, 
  Bed, 
  Search, 
  Plus, 
  RefreshCw,
  Filter
} from 'lucide-react';
import { api } from '../../api';

export function AdminRoomManagement() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    roomNumber: '',
    block: 'Block B',
    floor: 2,
    capacity: 4,
    roomType: 'standard',
  });
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    seatId: string;
    seatNumber: string;
    studentIdInput: string;
  }>({
    isOpen: false,
    seatId: '',
    seatNumber: '',
    studentIdInput: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const token = localStorage.getItem('hall_management_user')
    ? JSON.parse(localStorage.getItem('hall_management_user')!).token
    : '';

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await api.get('/rooms', token);
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    try {
      await api.post('/rooms', newRoomData, token);
      setShowAddRoom(false);
      setNewRoomData({ roomNumber: '', block: 'Block B', floor: 2, capacity: 4, roomType: 'standard' });
      await fetchRooms();
    } catch (err: any) {
      setActionError(err.message || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSeat = async () => {
    if (!assignModal.studentIdInput) return;
    setActionLoading(true);
    setActionError('');
    try {
      await api.post(
        `/rooms/seats/${assignModal.seatId}/assign`,
        { studentId: assignModal.studentIdInput },
        token
      );
      setAssignModal({ isOpen: false, seatId: '', seatNumber: '', studentIdInput: '' });
      await fetchRooms();
    } catch (err: any) {
      setActionError(err.message || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVacateSeat = async (seatId: string) => {
    if (!confirm('Vacate this seat?')) return;
    try {
      await api.post(`/rooms/seats/${seatId}/vacate`, {}, token);
      await fetchRooms();
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = filterBlock === 'all' || r.block === filterBlock;
    return matchesSearch && matchesBlock;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-800 antialiased">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Room & Seat Management</h2>
          <p className="text-slate-500">Inventory of hall rooms, bed occupancy, and allocations.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddRoom(true)}
            className="px-3 py-1.5 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Room</span>
          </button>
          <button
            onClick={fetchRooms}
            className="px-2.5 py-1 text-slate-600 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-md border border-slate-200 flex justify-between items-center gap-3">
        <div className="relative w-64">
          <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search room (e.g. B-224)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 focus:outline-none"
          />
        </div>

        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1.5 bg-white"
        >
          <option value="all">All Blocks</option>
          <option value="Block A">Block A</option>
          <option value="Block B">Block B</option>
          <option value="Block C">Block C</option>
          <option value="Main Building">Main Building</option>
        </select>
      </div>

      {/* Room Grid */}
      {loading ? (
        <p className="p-6 text-center text-slate-500">Loading rooms...</p>
      ) : filteredRooms.length === 0 ? (
        <p className="p-6 text-center text-slate-500 bg-white rounded border border-slate-200">No rooms found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <div key={room._id} className="bg-white rounded-md border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Room {room.roomNumber}</h4>
                  <p className="text-[11px] text-slate-500">{room.block} • Floor {room.floor}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  room.availableSeatsCount === 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {room.availableSeatsCount === 0 ? 'Full' : `${room.availableSeatsCount} Vacant`}
                </span>
              </div>

              {/* Seats list */}
              <div className="space-y-1.5">
                {room.seats?.map((seat: any) => (
                  <div key={seat._id} className="p-2 rounded border border-slate-100 bg-slate-50/60 flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-slate-800">
                      {seat.seatNumber}
                      {seat.status === 'occupied' && <span className="font-sans font-normal text-slate-500 ml-1">({seat.studentId})</span>}
                    </span>
                    {seat.status === 'occupied' ? (
                      <button
                        onClick={() => handleVacateSeat(seat._id)}
                        className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Vacate
                      </button>
                    ) : (
                      <button
                        onClick={() => setAssignModal({ isOpen: true, seatId: seat._id, seatNumber: seat.seatNumber, studentIdInput: '' })}
                        className="text-[11px] text-[#087E8B] hover:underline font-semibold cursor-pointer"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-md border border-slate-300 max-w-sm w-full p-6 text-xs text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Room</h3>
            {actionError && <div className="p-2 mb-3 bg-rose-50 text-rose-700 rounded border border-rose-200">{actionError}</div>}
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-301"
                  value={newRoomData.roomNumber}
                  onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Block</label>
                  <select
                    value={newRoomData.block}
                    onChange={(e) => setNewRoomData({ ...newRoomData, block: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Main Building">Main Building</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRoomData.floor}
                    onChange={(e) => setNewRoomData({ ...newRoomData, floor: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-[#087E8B] hover:bg-[#066570] text-white rounded font-semibold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-md border border-slate-300 max-w-xs w-full p-6 text-xs text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-1">Assign Seat {assignModal.seatNumber}</h3>
            <p className="text-slate-500 mb-3">Enter student ID:</p>
            {actionError && <div className="p-2 mb-2 bg-rose-50 text-rose-700 rounded border border-rose-200">{actionError}</div>}
            <input
              type="text"
              placeholder="e.g. 220133"
              value={assignModal.studentIdInput}
              onChange={(e) => setAssignModal({ ...assignModal, studentIdInput: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded mb-3 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignModal({ isOpen: false, seatId: '', seatNumber: '', studentIdInput: '' })}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSeat}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-[#087E8B] hover:bg-[#066570] text-white rounded font-semibold cursor-pointer"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
