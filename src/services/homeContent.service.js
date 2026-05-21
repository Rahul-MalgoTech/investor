import {
  defaultHomeContent,
  findOrCreateHomeContent,
  replaceHomeContent,
} from '../repositories/homeContent.repository.js';

export async function getHomeContent({ includeInactive = false } = {}) {
  const content = await findOrCreateHomeContent();
  const defaults = defaultHomeContent();
  const json = content.toJSON();
  return {
    ...json,
    banner: json.banner ?? defaults.banner,
    labels: json.labels ?? defaults.labels,
    plotDetail: json.plotDetail ?? defaults.plotDetail,
    cities: sort(filterActive(json.cities, includeInactive)),
    plots: sort(
      filterActive(withDefaultPlots(json.plots, defaults.plots), includeInactive),
    ).map((plot) => withPlotDetail(plot, defaults.plotDetail)),
  };
}

export async function saveHomeContent(content) {
  return replaceHomeContent(content);
}

function filterActive(items, includeInactive) {
  if (includeInactive) {
    return items;
  }
  return items.filter((item) => item.isActive !== false);
}

function sort(items) {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function withDefaultPlots(plots = [], defaultPlots = []) {
  if (plots.length >= defaultPlots.length) {
    return plots;
  }

  const existingIds = new Set(plots.map((plot) => plot.id));
  const missingDefaults = defaultPlots.filter((plot) => !existingIds.has(plot.id));
  return [...plots, ...missingDefaults].slice(0, defaultPlots.length);
}

function withPlotDetail(plot, defaultDetail) {
  const plotDetail = plot.detail ?? {};
  return {
    ...plot,
    detail: {
      ...defaultDetail,
      ...plotDetail,
      title: plotDetail.title ?? plot.title ?? defaultDetail.title,
      location: plotDetail.location ?? plot.place ?? defaultDetail.location,
      plotCount: plotDetail.plotCount ?? plot.plotCount ?? defaultDetail.plotCount,
      priceRange:
        plotDetail.priceRange ?? plot.priceRange ?? defaultDetail.priceRange,
    },
  };
}
