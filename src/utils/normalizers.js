export function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

export function normalizePhone(countryCode, phoneNumber) {
  return {
    countryCode: String(countryCode).trim().replace(/\s+/g, ''),
    phoneNumber: String(phoneNumber).trim().replace(/\s+/g, ''),
  };
}
