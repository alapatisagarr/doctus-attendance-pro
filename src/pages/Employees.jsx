import { useEffect, useMemo, useState } from 'react';
import { PencilLine, Plus, Search, Trash2, UsersRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteEmployee, fetchAllData, saveEmployee } from '../lib/firestoreService';
import { generateEmployeeCode, getEmployeeAvatar } from '../lib/data';
import { validateEmployeeForm } from '../lib/validation';
import { showSuccess, showError } from '../lib/toast';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyEmployee = {
  employeeCode: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  manager: '',
  dateOfBirth: '',
  joinDate: '',
  address: '',
  emergencyContact: '',
  status: 'Active',
  photo: '',
};

const departmentOptions = ['Operations', 'HR', 'Engineering', 'Finance', 'Sales', 'Support', 'Clinical'];

const Employees = () => {
  const [data, setData] = useState({ employees: [], attendance: [], leaves: [], holidays: [], settings: {} });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyEmployee);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, employeeId: null, employeeName: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchAllData();
        setData(result);
      } catch (error) {
        console.error(error);
        showError('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, departmentFilter]);

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase();
    return data.employees.filter((employee) => {
      const matchesQuery = [employee.name, employee.department, employee.designation, employee.employeeCode].join(' ').toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
      const matchesDepartment = departmentFilter === 'All' || employee.department === departmentFilter;
      return matchesQuery && matchesStatus && matchesDepartment;
    });
  }, [data.employees, departmentFilter, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / 6));
  const paginatedEmployees = filteredEmployees.slice((page - 1) * 6, page * 6);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validationErrors = validateEmployeeForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError('Please fix all validation errors');
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const payload = {
        ...form,
        employeeCode: form.employeeCode || generateEmployeeCode(data.employees),
        id: editingId || `emp-${Date.now()}`,
        designation: form.designation || 'Staff',
      };
      await saveEmployee(payload);
      const refreshed = await fetchAllData();
      setData(refreshed);
      setForm(emptyEmployee);
      setEditingId(null);
      showSuccess(editingId ? 'Employee updated successfully' : 'Employee created successfully');
    } catch (error) {
      console.error(error);
      showError('Failed to save employee: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setForm({ ...emptyEmployee, ...employee });
    setErrors({});
  };

  const handleDeleteClick = (employeeId, employeeName) => {
    setDeleteConfirm({ isOpen: true, employeeId, employeeName });
  };

  const handleConfirmDelete = async () => {
    const { employeeId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, employeeId: null, employeeName: '' });
    setLoading(true);
    try {
      await deleteEmployee(employeeId);
      const refreshed = await fetchAllData();
      setData(refreshed);
      showSuccess('Employee deleted successfully');
    } catch (error) {
      console.error(error);
      showError('Failed to delete employee: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, employeeId: null, employeeName: '' });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={handleSubmit} className="rounded-[24px] border border-[#FFD400]/30 bg-white/80 p-4 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">{editingId ? 'Edit employee' : 'Add employee'}</h3>
          <span className="rounded-full bg-[#FFF3D6] px-3 py-1 text-sm font-semibold text-[#E60023]">HR records</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Employee code</span>
            <input className="w-full bg-transparent outline-none" value={form.employeeCode} onChange={(event) => setForm({ ...form, employeeCode: event.target.value })} placeholder="Auto-generated" />
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Full name</span>
            <input className="w-full bg-transparent outline-none" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Email</span>
            <input className="w-full bg-transparent outline-none" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Phone</span>
            <input className="w-full bg-transparent outline-none" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Department</span>
            <input className="w-full bg-transparent outline-none" list="departments" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required />
            <datalist id="departments">{departmentOptions.map((department) => <option key={department} value={department} />)}</datalist>
            {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Designation</span>
            <input className="w-full bg-transparent outline-none" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} required />
            {errors.designation && <p className="mt-1 text-xs text-red-600">{errors.designation}</p>}
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Manager</span>
            <input className="w-full bg-transparent outline-none" value={form.manager} onChange={(event) => setForm({ ...form, manager: event.target.value })} />
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Join date</span>
            <input className="w-full bg-transparent outline-none" type="date" value={form.joinDate} onChange={(event) => setForm({ ...form, joinDate: event.target.value })} />
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Date of birth</span>
            <input className="w-full bg-transparent outline-none" type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} />
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Address</span>
            <input className="w-full bg-transparent outline-none" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Emergency contact</span>
            <input className="w-full bg-transparent outline-none" value={form.emergencyContact} onChange={(event) => setForm({ ...form, emergencyContact: event.target.value })} />
          </label>
          <label className="rounded-[18px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 text-sm text-slate-600">
            <span className="mb-2 block font-semibold">Status</span>
            <select className="w-full bg-transparent outline-none" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          <div className="rounded-[18px] border border-dashed border-[#FFD400]/30 bg-[#FFF9E6] p-3 text-sm text-slate-600 sm:col-span-2">
            Profile photos use generated initials avatars while Firebase Storage is disabled.
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#E60023,_#FF7A00_60%,_#FFD400)] px-4 py-3 text-sm font-semibold text-white transition duration-200 disabled:opacity-50 hover:shadow-lg"
          >
            <Plus size={16} /> {editingId ? 'Update employee' : 'Create employee'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyEmployee);
                setErrors({});
              }}
              className="flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-[24px] border border-[#FFD400]/30 bg-white/80 p-4 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Employee directory</h3>
            <p className="text-sm text-slate-600">Search, filter, and manage your team</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 rounded-2xl border border-[#FFD400]/20 bg-[#FFF9E6] px-3 py-2 text-sm text-slate-600">
              <Search size={16} className="text-[#FF7A00]" />
              <input className="bg-transparent outline-none" placeholder="Search employees" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select className="rounded-2xl border border-[#FFD400]/20 bg-[#FFF9E6] px-3 py-2 text-sm text-slate-700" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select className="rounded-2xl border border-[#FFD400]/20 bg-[#FFF9E6] px-3 py-2 text-sm text-slate-700" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
              <option value="All">All departments</option>
              {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {paginatedEmployees.length > 0 ? (
            paginatedEmployees.map((employee) => (
              <div key={employee.id} className="flex flex-col gap-3 rounded-[20px] border border-[#FFD400]/20 bg-[#FFF9E6] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <img src={getEmployeeAvatar(employee)} alt={employee.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-[#FFD400]/40" />
                  <div>
                    <p className="font-semibold text-slate-900">{employee.employeeCode || 'EMP000'} • {employee.name}</p>
                    <p className="text-sm text-slate-600">{employee.designation || 'Staff'} • {employee.department || 'General'} • {employee.manager || 'No manager assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(employee)} className="rounded-xl border border-[#FFD400]/20 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-[#FFF3D6]">
                    <PencilLine size={16} />
                  </button>
                  <button onClick={() => handleDeleteClick(employee.id, employee.name)} className="rounded-xl border border-[#E60023]/20 bg-white px-3 py-2 text-sm text-[#E60023] transition hover:bg-[#FDE7EA]">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[20px] border border-[#FFD400]/20 bg-[#FFF9E6] p-6 text-center text-slate-600">
              No employees found
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button className="rounded-xl border border-[#FFD400]/20 bg-white px-3 py-2 disabled:opacity-50" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Prev</button>
            <button className="rounded-xl border border-[#FFD400]/20 bg-white px-3 py-2 disabled:opacity-50" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteConfirm.employeeName}? All related attendance and leave records will also be removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Employees;
