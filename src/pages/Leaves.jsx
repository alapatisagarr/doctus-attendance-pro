import { useEffect, useMemo, useState } from 'react';
import { BellRing, Check, Plus, Search, X } from 'lucide-react';
import { fetchAllData, saveLeaveRequest } from '../lib/firestoreService';
import { getLeaveBalance } from '../lib/data';
import { validateLeaveForm } from '../lib/validation';
import { showSuccess, showError } from '../lib/toast';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyLeave = { employeeId: '', employeeName: '', type: 'CL', from: '', to: '', reason: '', status: 'Pending' };

const Leaves = () => {
  const [data, setData] = useState({ employees: [], attendance: [], leaves: [], holidays: [], settings: {} });
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyLeave);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, leaveId: null, employeeName: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchAllData();
        setData(result);
      } catch (error) {
        console.error(error);
        showError('Failed to load leave data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredLeaves = useMemo(() => {
    const query = search.toLowerCase();
    return data.leaves.filter((leave) => [leave.employeeName, leave.type, leave.status].join(' ').toLowerCase().includes(query));
  }, [data.leaves, search]);

  const leaveBalance = useMemo(() => getLeaveBalance(data.leaves), [data.leaves]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateLeaveForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError('Please fix all validation errors');
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const employee = data.employees.find((item) => item.id === form.employeeId);
      await saveLeaveRequest({ ...form, employeeName: employee?.name || form.employeeName, id: `leave-${Date.now()}` });
      const refreshed = await fetchAllData();
      setData(refreshed);
      setForm(emptyLeave);
      showSuccess('Leave request submitted successfully');
    } catch (error) {
      console.error(error);
      showError('Failed to submit leave request: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leave, status) => {
    setLoading(true);
    try {
      await saveLeaveRequest({ ...leave, status });
      const refreshed = await fetchAllData();
      setData(refreshed);
      showSuccess(`Leave ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error(error);
      showError('Failed to update leave status: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (leaveId, employeeName) => {
    setDeleteConfirm({ isOpen: true, leaveId, employeeName });
  };

  const handleConfirmDelete = async () => {
    const { leaveId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, leaveId: null, employeeName: '' });
    setLoading(true);
    try {
      await saveLeaveRequest({ ...data.leaves.find(l => l.id === leaveId), deleted: true });
      const refreshed = await fetchAllData();
      setData(refreshed);
      showSuccess('Leave request deleted successfully');
    } catch (error) {
      console.error(error);
      showError('Failed to delete leave request: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, leaveId: null, employeeName: '' });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(leaveBalance).map(([type, balance]) => (
          <div key={type} className="rounded-[24px] border border-[#FFD400]/30 bg-white/80 p-4 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.18)]">
            <p className="text-sm font-semibold text-slate-600">{type} Balance</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{balance}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-[24px] border border-[#FFD400]/30 bg-white/80 p-4 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.18)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Create leave request</h3>
            <span className="rounded-full bg-[#FFF3D6] px-3 py-1 text-sm font-semibold text-[#E60023]">Track approvals</span>
          </div>
          <div className="space-y-3">
            <label className="block rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
              <span className="mb-2 block font-semibold">Employee</span>
              <select className="w-full bg-transparent outline-none" value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} required>
                <option value="">Select employee</option>
                {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </select>
              {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId}</p>}
            </label>
            <label className="block rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
              <span className="mb-2 block font-semibold">Leave type</span>
              <select className="w-full bg-transparent outline-none" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option value="CL">CL</option>
                <option value="SL">SL</option>
                <option value="EL">EL</option>
                <option value="LOP">LOP</option>
              </select>
            </label>
            <label className="block rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
              <span className="mb-2 block font-semibold">From</span>
              <input className="w-full bg-transparent outline-none" type="date" value={form.from} onChange={(event) => setForm({ ...form, from: event.target.value })} required />
              {errors.from && <p className="mt-1 text-xs text-red-600">{errors.from}</p>}
            </label>
            <label className="block rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
              <span className="mb-2 block font-semibold">To</span>
              <input className="w-full bg-transparent outline-none" type="date" value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })} required />
              {errors.to && <p className="mt-1 text-xs text-red-600">{errors.to}</p>}
            </label>
            <label className="block rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
              <span className="mb-2 block font-semibold">Reason</span>
              <textarea className="w-full bg-transparent outline-none" rows="3" placeholder="Reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
              {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason}</p>}
            </label>
            <label className="block rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
              <span className="mb-2 block font-semibold">Status</span>
              <select className="w-full bg-transparent outline-none" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>
          </div>
          <button className="mt-4 flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#E60023,_#FF7A00_60%,_#FFD400)] px-4 py-3 text-sm font-semibold text-white transition duration-200 disabled:opacity-50 hover:shadow-lg" type="submit" disabled={loading}>
            <Plus size={16} /> Submit leave
          </button>
        </form>

        <div className="rounded-[24px] border border-[#FFD400]/30 bg-white/80 p-4 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.18)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Leave requests</h3>
              <p className="text-sm text-slate-600">Approve, reject, and review leave history</p>
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-[#FFD400]/20 bg-[#FFF9E6] px-3 py-2 text-sm text-slate-600">
              <Search size={16} className="text-[#FF7A00]" />
              <input className="bg-transparent outline-none" placeholder="Search leaves" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>
          <div className="space-y-3">
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave) => (
                <div key={leave.id} className="rounded-[20px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#F3ECFF] p-3 text-[#7C3AED]"><BellRing size={18} /></div>
                      <div>
                        <p className="font-semibold text-slate-900">{leave.employeeName}</p>
                        <p className="text-sm text-slate-600">{leave.type} • {leave.from} to {leave.to}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">{leave.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{leave.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {leave.status === 'Pending' ? (
                      <>
                        <button className="flex items-center gap-2 rounded-xl border border-[#22C55E]/20 bg-[#ECFDF3] px-3 py-2 text-sm font-semibold text-[#16A34A]" onClick={() => handleStatusChange(leave, 'Approved')}>
                          <Check size={16} /> Approve
                        </button>
                        <button className="flex items-center gap-2 rounded-xl border border-[#E60023]/20 bg-[#FEF2F2] px-3 py-2 text-sm font-semibold text-[#E60023]" onClick={() => handleStatusChange(leave, 'Rejected')}>
                          <X size={16} /> Reject
                        </button>
                      </>
                    ) : null}
                    <button className="flex items-center gap-2 rounded-xl border border-[#E60023]/20 bg-white px-3 py-2 text-sm font-semibold text-[#E60023]" onClick={() => handleDeleteClick(leave.id, leave.employeeName)}>
                      <X size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] border border-[#FFD400]/20 bg-[#FFF9E6] p-6 text-center text-slate-600">
                No leave requests found
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Leave Request"
        message={`Are you sure you want to delete the leave request for ${deleteConfirm.employeeName}?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Leaves;