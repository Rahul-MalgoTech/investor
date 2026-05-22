import { ApiError } from '../utils/apiError.js';

export function validateCreateOrder(body) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'request body is required');
  }

  return {
    plot: objectWithStrings(body.plot, 'plot', [
      'title',
      'size',
      'location',
      'priceRange',
      'edition',
    ]),
    summary: {
      ...objectWithStrings(body.summary, 'summary', [
        'selectedLabel',
        'totalLabel',
        'totalAmount',
        'premiumAmount',
        'standardAmount',
      ]),
      paymentMode: enumValue(body.summary?.paymentMode, 'summary.paymentMode', [
        'full',
        'emi',
      ], 'full'),
    },
    customization: objectWithStrings(body.customization, 'customization', [
      'fullName',
      'occasion',
      'message',
    ]),
    delivery: {
      ...objectWithStrings(body.delivery, 'delivery', [
        'searchText',
        'area',
        'addressLine',
        'buildingName',
        'contactName',
        'mobileNumber',
      ]),
      method: enumValue(body.delivery?.method, 'delivery.method', [
        'home',
        'registry_handover',
      ], 'home'),
    },
  };
}

function objectWithStrings(value, name, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    fields.map((field) => [field, optionalString(value[field], `${name}.${field}`)]),
  );
}

function optionalString(value, name) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, `${name} must be a string`);
  }
  return value.trim();
}

function enumValue(value, name, allowed, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  if (!allowed.includes(value)) {
    throw new ApiError(400, `${name} is invalid`);
  }
  return value;
}
