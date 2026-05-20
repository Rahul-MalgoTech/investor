import { ApiError } from '../utils/apiError.js';

const maxImageBase64Length = 12000000;

export function validateHomeContentUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'request body is required');
  }

  const cities = arrayOf(body.cities, 'cities').map((item, index) =>
    validateCity(item, index),
  );
  const plots = arrayOf(body.plots, 'plots').map((item, index) =>
    validatePlot(item, index),
  );

  return {
    banner: validateBanner(body.banner),
    labels: validateLabels(body.labels),
    cities,
    plots,
    plotDetail: validatePlotDetail(body.plotDetail),
  };
}

function validatePlotDetail(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  assertObject(value, 'plotDetail');
  return value;
}

function validateBanner(item) {
  if (item === undefined || item === null) {
    return undefined;
  }
  assertObject(item, 'banner');
  return {
    headline: optionalString(item, 'headline'),
    subtitle: optionalString(item, 'subtitle'),
    image: validateImage(item.image),
  };
}

function validateLabels(item) {
  if (item === undefined || item === null) {
    return undefined;
  }
  assertObject(item, 'labels');
  return {
    cityTitle: optionalString(item, 'cityTitle'),
    recommendationTitle: optionalString(item, 'recommendationTitle'),
    activeTabTitle: optionalString(item, 'activeTabTitle'),
    upcomingTabTitle: optionalString(item, 'upcomingTabTitle'),
  };
}

function validateCity(item, index) {
  assertObject(item, `cities[${index}]`);
  return {
    id: optionalString(item, 'id') || slug(requiredString(item, 'label')),
    label: requiredString(item, 'label'),
    image: validateImage(item.image),
    sortOrder: optionalNumber(item, 'sortOrder') ?? index,
    isActive: item.isActive !== false,
  };
}

function validatePlot(item, index) {
  assertObject(item, `plots[${index}]`);
  const status = optionalString(item, 'status') || 'active';
  if (!['active', 'upcoming'].includes(status)) {
    throw new ApiError(400, `plots[${index}].status is invalid`);
  }
  return {
    id: optionalString(item, 'id') || slug(optionalString(item, 'title') || `plot-${index + 1}`),
    title: optionalString(item, 'title') ?? '',
    place: optionalString(item, 'place') ?? '',
    priceRange: optionalString(item, 'priceRange') ?? '',
    plotCount: optionalString(item, 'plotCount') ?? '',
    cityId: optionalString(item, 'cityId'),
    status,
    image: validateImage(item.image),
    iconImage: validateImage(item.iconImage),
    detail: validatePlotDetail(item.detail),
    sortOrder: optionalNumber(item, 'sortOrder') ?? index,
    isActive: item.isActive !== false,
  };
}

function validateImage(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  assertObject(value, 'image');
  const image = {
    asset: optionalString(value, 'asset'),
    url: optionalString(value, 'url'),
    base64: optionalString(value, 'base64'),
    mimeType: optionalString(value, 'mimeType'),
  };
  if (image.base64 && image.base64.length > maxImageBase64Length) {
    throw new ApiError(400, 'image upload is too large');
  }
  return image;
}

function arrayOf(value, name) {
  if (!Array.isArray(value)) {
    throw new ApiError(400, `${name} must be an array`);
  }
  return value;
}

function assertObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, `${name} must be an object`);
  }
}

function requiredString(body, name) {
  const value = optionalString(body, name);
  if (!value) {
    throw new ApiError(400, `${name} is required`);
  }
  return value;
}

function optionalString(body, name) {
  const value = body[name];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, `${name} must be a string`);
  }
  return value.trim();
}

function optionalNumber(body, name) {
  const value = body[name];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new ApiError(400, `${name} must be a number`);
  }
  return numberValue;
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
