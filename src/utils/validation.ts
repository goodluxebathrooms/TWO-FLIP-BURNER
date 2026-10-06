/**
 * Order details & Nigerian phone validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  normalized?: string;
}

export interface FormErrors {
  fullName?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  state?: string;
  general?: string;
}

/**
 * Validates a Nigerian or international phone number
 * Valid Nigerian formats: 08031234567, 09031585177, 081..., 070..., 091...
 * or +2348031234567, +234 903 158 5177
 */
export function validatePhone(phone: string, isOptional = false): ValidationResult {
  const trimmed = phone.trim();

  if (!trimmed) {
    if (isOptional) return { isValid: true };
    return {
      isValid: false,
      message: 'Phone number is required for dispatch & delivery rider communication.',
    };
  }

  // Remove spaces, dashes, parentheses
  const cleaned = trimmed.replace(/[\s\-()]/g, '');

  // Check for suspicious dummy repetitive sequences (e.g. 0000000000, 11111111111, 12345678901)
  if (/^(\d)\1{7,}$/.test(cleaned) || cleaned === '12345678901' || cleaned === '01234567890') {
    return {
      isValid: false,
      message: 'Please enter a genuine, active phone number.',
    };
  }

  // Handle Nigerian numbers
  let normalized = cleaned;
  if (normalized.startsWith('+234')) {
    normalized = '0' + normalized.slice(4);
  } else if (normalized.startsWith('234') && normalized.length === 13) {
    normalized = '0' + normalized.slice(3);
  }

  // Check Nigerian standard 11-digit mobile format: 070, 080, 081, 090, 091, 071
  const nigerianRegex = /^0(70|71|80|81|90|91)\d{8}$/;
  if (nigerianRegex.test(normalized)) {
    return {
      isValid: true,
      normalized,
    };
  }

  // If international (+...) or other valid country code, require 10 to 15 digits
  if (/^\+?[1-9]\d{9,14}$/.test(cleaned)) {
    return {
      isValid: true,
      normalized: cleaned,
    };
  }

  return {
    isValid: false,
    message: 'Enter a valid 11-digit Nigerian phone number starting with 080, 081, 090, 070, or 091 (e.g. 08031234567).',
  };
}

/**
 * Validates Full Name
 * Must contain at least first and last name so delivery dispatch can identify recipient
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return {
      isValid: false,
      message: 'Please enter your Full Name (first and last name).',
    };
  }

  if (trimmed.length < 4) {
    return {
      isValid: false,
      message: 'Full Name must be at least 4 letters long.',
    };
  }

  // Check if there are at least two distinct parts (First & Last name)
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return {
      isValid: false,
      message: 'Please enter both your First Name and Last Name (e.g. Emmanuel Collins).',
    };
  }

  return { isValid: true, normalized: trimmed };
}

/**
 * Validates Delivery Address
 * Must be specific enough for dispatch rider to reach the location
 */
export function validateDeliveryAddress(address: string): ValidationResult {
  const trimmed = address.trim();

  if (!trimmed) {
    return {
      isValid: false,
      message: 'Delivery address is required for dispatch.',
    };
  }

  if (trimmed.length < 10) {
    return {
      isValid: false,
      message: 'Please provide a detailed delivery address with street name, house number or landmark (at least 10 characters).',
    };
  }

  // Reject generic one-word entries like just "Lagos" or "House"
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return {
      isValid: false,
      message: 'Please provide full address details including house number, street name, and area/bustop.',
    };
  }

  return { isValid: true, normalized: trimmed };
}

/**
 * Validates Nigerian State
 */
export function validateState(state: string): ValidationResult {
  const trimmed = state.trim();
  if (!trimmed) {
    return {
      isValid: false,
      message: 'Please select your delivery state.',
    };
  }
  return { isValid: true, normalized: trimmed };
}

/**
 * Validates complete checkout form
 */
export function validateOrderForm(data: {
  fullName: string;
  phone: string;
  whatsapp?: string;
  address: string;
  state: string;
}): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  const nameVal = validateFullName(data.fullName);
  if (!nameVal.isValid) {
    errors.fullName = nameVal.message;
  }

  const phoneVal = validatePhone(data.phone);
  if (!phoneVal.isValid) {
    errors.phone = phoneVal.message;
  }

  if (data.whatsapp && data.whatsapp.trim()) {
    const whatsappVal = validatePhone(data.whatsapp, true);
    if (!whatsappVal.isValid) {
      errors.whatsapp = whatsappVal.message;
    }
  }

  const addressVal = validateDeliveryAddress(data.address);
  if (!addressVal.isValid) {
    errors.address = addressVal.message;
  }

  const stateVal = validateState(data.state);
  if (!stateVal.isValid) {
    errors.state = stateVal.message;
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    errors.general =
      errors.phone ||
      errors.fullName ||
      errors.address ||
      errors.state ||
      'Please correct the highlighted fields before submitting.';
  }

  return { isValid, errors };
}
