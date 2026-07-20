import { AlertCircle, Check, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel', isDangerous = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-3 ${isDangerous ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <X size={16} />
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
              isDangerous
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
                : 'bg-gradient-to-r from-[#E60023] to-[#FF7A00] hover:from-[#D50020] hover:to-[#E66F00]'
            }`}
          >
            <Check size={16} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
