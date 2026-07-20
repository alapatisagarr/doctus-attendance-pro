import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#ECFDF3',
      color: '#16A34A',
      border: '1px solid #22C55E',
      borderRadius: '12px',
      padding: '12px 16px',
      fontWeight: '600',
      fontSize: '14px',
    },
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#FEF2F2',
      color: '#DC2626',
      border: '1px solid #FCA5A5',
      borderRadius: '12px',
      padding: '12px 16px',
      fontWeight: '600',
      fontSize: '14px',
    },
  });
};

export const showWarning = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#FFF7ED',
      color: '#EA580C',
      border: '1px solid #FDBA74',
      borderRadius: '12px',
      padding: '12px 16px',
      fontWeight: '600',
      fontSize: '14px',
    },
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#EFF6FF',
      color: '#0369A1',
      border: '1px solid #7DD3FC',
      borderRadius: '12px',
      padding: '12px 16px',
      fontWeight: '600',
      fontSize: '14px',
    },
  });
};
