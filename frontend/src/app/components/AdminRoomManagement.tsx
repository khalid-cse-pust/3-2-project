import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DoorOpen, 
  Users, 
  Bed, 
  Wrench, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw,
  XCircle,
  Filter
} from 'lucide-react';
import { api } from '../../api';

export function AdminRoomManagement() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
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
      if (selectedRoom) {
        const refreshedSelected = data.find((r: any) => r._id === selectedRoom._id);
        if (refreshedSelected) setSelectedRoom(refreshedSelected);
      }
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
      setActionError(err.message || 'Failed to create room');
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
      setActionError(err.message || 'Failed to assign seat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVacateSeat = async (seatId: string) => {
    if (!confirm('Are you sure you want to vacate this seat? Student allocation status will be cleared.')) return;
    try {
      await api.post(`/rooms/seats/${seatId}/vacate`, {}, token);
      await fetchRooms();
    } catch (err: any) {
      alert(err.message || 'Failed to vacate seat');
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = filterBlock === 'all' || r.block === filterBlock;
    return matchesSearch && matchesBlock;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Institutional Facilities</span>
          <h2 className="text-2xl font-bold text-[#16324F] mt-1">Hall Room & Seat Inventory</h2>
          <p className="text-xs text-slate-500">
            Real-time occupancy tracking, bed allocations, and maintenance oversight across Shadhinota Hall blocks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddRoom(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-[#087E8B] hover:bg-[#066570] text-white rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>Add New Room</span>
          </button>
          <button
            onClick={fetchRooms}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search room (e.g. B-224)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="size-4 text-slate-500" />
          <span className="text-xs text-slate-600 font-medium">Block:</span>
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
          >
            <option value="all">All Blocks</option>
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="Block C">Block C</option>
            <option value="Main Building">Main Building</option>
          </select>
        </div>
      </div>

      {/* Room Grid and Seat Breakdown */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading hall rooms...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
          No matching rooms found in database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden hover:border-[#087E8B] transition-colors"
            >
              {/* Room Card Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-[#16324F] flex items-center gap-2">
                    <DoorOpen className="size-4 text-[#087E8B]" />
                    <span>Room {room.roomNumber}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {room.block} • Floor {room.floor} • {room.roomType}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      room.availableSeatsCount === 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {room.availableSeatsCount === 0 ? 'Full' : `${room.availableSeatsCount} Available`}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {room.occupiedSeatsCount} / {room.capacity} Beds
                  </p>
                </div>
              </div>

              {/* Beds / Seats List */}
              <div className="p-4 space-y-2">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Bed Allocations:
                </p>
                <div className="space-y-2">
                  {room.seats?.map((seat: any) => (
                    <div
                      key={seat._id}
                      className="p-2.5 rounded-md border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Bed className="size-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-800">{seat.seatNumber}</span>
                        {seat.status === 'occupied' ? (
                          <span className="text-[10px] text-slate-600">
                            (ID: {seat.studentId || 'Occupied'})
                          </span>
                        ) : seat.status === 'reserved' ? (
                          <span className="text-[10px] text-amber-700 font-medium">
                            (Reserved for ID: {seat.studentId})
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-medium">
                            (Vacant)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {seat.status === 'occupied' ? (
                          <button
                            onClick={() => handleVacateSeat(seat._id)}
                            className="px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          >
                            Vacate
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setAssignModal({
                                isOpen: true,
                                seatId: seat._id,
                                seatNumber: seat.seatNumber,
                                studentIdInput: '',
                              })
                            }
                            className="px-2 py-1 text-[11px] font-medium text-[#087E8B] hover:bg-teal-50 rounded transition-colors cursor-pointer"
                          >
                            Assign ID
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#16324F] mb-4">Add New Hall Room</h3>
            {actionError && (
              <div className="mb-4 text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-200">
                {actionError}
              </div>
            )}
            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Room Number (e.g. B-301)</label>
                <input
                  type="text"
                  required
                  value={newRoomData.roomNumber}
                  onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                  placeholder="B-301"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Block</label>
                  <select
                    value={newRoomData.block}
                    onChange={(e) => setNewRoomData({ ...newRoomData, block: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
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
                    required
                    value={newRoomData.floor}
                    onChange={(e) => setNewRoomData({ ...newRoomData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacity (Beds)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={newRoomData.capacity}
                    onChange={(e) => setNewRoomData({ ...newRoomData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Room Type</label>
                  <select
                    value={newRoomData.roomType}
                    onChange={(e) => setNewRoomData({ ...newRoomData, roomType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  >
                    <option value="standard">Standard</option>
                    <option value="attached_bath">Attached Bath</option>
                    <option value="accessible">Accessible</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Room & Seats'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Seat Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#16324F] mb-1">Assign Seat {assignModal.seatNumber}</h3>
            <p className="text-xs text-slate-500 mb-4">Enter university Student ID to allocate this bed directly.</p>
            {actionError && (
              <div className="mb-3 text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-200">
                {actionError}
              </div>
            )}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student ID (e.g. 220133)</label>
                <input
                  type="text"
                  placeholder="220133"
                  value={assignModal.studentIdInput}
                  onChange={(e) => setAssignModal({ ...assignModal, studentIdInput: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignModal({ isOpen: false, seatId: '', seatNumber: '', studentIdInput: '' })}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignSeat}
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
