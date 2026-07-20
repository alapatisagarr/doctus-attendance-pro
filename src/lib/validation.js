export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

export const validateEmployeeCode = (code) => {
  return code && code.trim().length > 0;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateDate = (date) => {
  return date && date.trim().length > 0;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateEmployeeForm = (form) => {
  const errors = {};

  if (!validateName(form.name)) {
    errors.name = 'Name is required and must be at least 2 characters';
  }

  if (!validateEmail(form.email)) {
    errors.email = 'Valid email address is required';
  }

  if (form.phone && !validatePhone(form.phone)) {
    errors.phone = 'Phone number format is invalid';
  }

  if (!validateRequired(form.department)) {
    errors.department = 'Department is required';
  }

  if (!validateRequired(form.designation)) {
    errors.designation = 'Designation is required';
  }

  return errors;
};

export const validateAttendanceForm = (form) => {
  const errors = {};

  if (!validateRequired(form.employeeId)) {
    errors.employeeId = 'Employee is required';
  }

  if (!validateDate(form.date)) {
    errors.date = 'Date is required';
  }

  if (!validateRequired(form.status)) {
    errors.status = 'Status is required';
  }

  return errors;
};

export const validateLeaveForm = (form) => {
  const errors = {};

  if (!validateRequired(form.employeeId)) {
    errors.employeeId = 'Employee is required';
  }

  if (!validateDate(form.from)) {
    errors.from = 'From date is required';
  }

  if (!validateDate(form.to)) {
    errors.to = 'To date is required';
  }

  if (form.from && form.to && new Date(form.from) > new Date(form.to)) {
    errors.to = 'To date must be after From date';
  }

  if (!validateRequired(form.reason)) {
    errors.reason = 'Reason is required';
  }

  return errors;
};

export const validateHolidayForm = (form) => {
  const errors = {};

  if (!validateRequired(form.title)) {
    errors.title = 'Holiday title is required';
  }

  if (!validateDate(form.date)) {
    errors.date = 'Date is required';
  }

  return errors;
};
