const apiBase =
  window.location.pathname.startsWith('/admin') && window.location.origin
    ? ''
    : 'https://investor-backend-d42s.onrender.com';
const apiPath = `${apiBase}/api/v1/admin/home-content`;
const uploadPath = `${apiBase}/api/v1/admin/uploads`;

let state = { banner: {}, labels: {}, cities: [], plots: [], plotDetail: {} };

const nodes = {
  status: document.querySelector('#status'),
  pages: [...document.querySelectorAll('[data-page]')],
  navItems: [...document.querySelectorAll('[data-nav]')],
  cities: document.querySelector('#cities'),
  plots: document.querySelector('#plots'),
  highlights: document.querySelector('#highlights'),
  documents: document.querySelector('#documents'),
  nearby: document.querySelector('#nearby'),
  bannerHeadline: document.querySelector('#bannerHeadline'),
  bannerSubtitle: document.querySelector('#bannerSubtitle'),
  bannerImage: document.querySelector('#bannerImage'),
  bannerPreview: document.querySelector('#bannerPreview'),
  cityTitle: document.querySelector('#cityTitle'),
  recommendationTitle: document.querySelector('#recommendationTitle'),
  activeTabTitle: document.querySelector('#activeTabTitle'),
  upcomingTabTitle: document.querySelector('#upcomingTabTitle'),
  cityTemplate: document.querySelector('#cityTemplate'),
  plotTemplate: document.querySelector('#plotTemplate'),
  highlightTemplate: document.querySelector('#highlightTemplate'),
  documentTemplate: document.querySelector('#documentTemplate'),
  nearbyTemplate: document.querySelector('#nearbyTemplate'),
};

const detailFields = [
  'detailTitle',
  'detailSize',
  'detailLocation',
  'detailPlotCount',
  'detailPriceRange',
  'detailEdition',
  'detailHeroImage',
  'detailThumb1',
  'detailThumb2',
  'detailThumb3',
  'detailThumb4',
  'selectionTitle',
  'selectionImage',
  'selectionTotalAmount',
  'selectionUnlockCopy',
  'selectionSelectedCount',
  'selectionButtonText',
  'selectionMapTitle',
  'selectionPlots',
  'summaryImage',
  'summarySelectedLabel',
  'summaryPremiumPlots',
  'summaryStandardPlots',
  'summaryAgreementCopy',
  'summaryPaymentRulesTitle',
  'summaryPaymentRules',
  'summaryDocumentationTitle',
  'summaryRegistrationTitle',
  'summaryPaymentBreakdownTitle',
  'summaryTotalLabel',
  'summaryPremiumAmount',
  'summaryStandardAmount',
  'summaryTotalAmount',
  'summaryEmiButtonText',
  'summaryFullButtonText',
  'aboutMapImage',
  'aboutCardImage',
  'info1Label',
  'info1Value',
  'info2Label',
  'info2Value',
  'info3Label',
  'info3Value',
  'info4Label',
  'info4Value',
  'amenitiesTitle',
  'amenity1',
  'amenity2',
  'amenity3',
  'amenity4',
  'highlightsTitle',
  'documentsTitle',
  'nearbyTitle',
];

for (const id of detailFields) {
  nodes[id] = document.querySelector(`#${id}`);
}

document.querySelector('#reloadBtn').addEventListener('click', load);
document.querySelector('#saveBtn').addEventListener('click', save);
document.querySelector('#tokenBtn').addEventListener('click', () => {
  const token = prompt('Admin token', localStorage.getItem('adminToken') || '');
  if (token !== null) localStorage.setItem('adminToken', token.trim());
});

nodes.navItems.forEach((item) => {
  item.addEventListener('click', () => showPage(item.dataset.nav));
});

document.querySelector('#addCityBtn').addEventListener('click', () => {
  state.cities.push({
    id: crypto.randomUUID(),
    label: 'New city',
    image: {},
    sortOrder: state.cities.length,
    isActive: true,
  });
  render();
});

document.querySelector('#addPlotBtn').addEventListener('click', () => {
  state.plots.push({
    id: crypto.randomUUID(),
    title: '',
    place: '',
    priceRange: '',
    plotCount: '',
    cityId: '',
    status: 'active',
    image: {},
    iconImage: {},
    sortOrder: state.plots.length,
    isActive: true,
  });
  render();
});

document.querySelector('#addHighlightBtn').addEventListener('click', () => {
  detail().about.highlights.push({
    title: 'New highlight',
    distance: '1 km',
    image: {},
  });
  renderPlotDetail();
});

document.querySelector('#addDocumentBtn').addEventListener('click', () => {
  detail().documents.push({ title: 'New Document', size: '1.8MB' });
  renderPlotDetail();
});

document.querySelector('#addNearbyBtn').addEventListener('click', () => {
  detail().nearby.push({
    title: 'Sunrise valley',
    place: 'OMR Road',
    plotCount: '12 plots',
    priceRange: '₹3.0L -₹5.0L',
    image: {},
  });
  renderPlotDetail();
});

bindStandaloneUpload(nodes.bannerImage, async (image) => {
  state.banner = { ...(state.banner || {}), image };
  render();
});
bindFieldUpload('#detailHeroUpload', nodes.detailHeroImage);
bindFieldUpload('#selectionUpload', nodes.selectionImage);
bindFieldUpload('#summaryUpload', nodes.summaryImage);
bindFieldUpload('#aboutMapUpload', nodes.aboutMapImage);
bindFieldUpload('#aboutCardUpload', nodes.aboutCardImage);

async function load() {
  setStatus('Loading');
  const response = await fetch(apiPath, { headers: adminHeaders() });
  const json = await response.json();
  if (!response.ok || json.success === false) {
    setStatus(json.message || 'Load failed');
    return;
  }
  state = json.data.homeContent;
  normalizeState();
  render();
  setStatus('Loaded');
}

async function save() {
  try {
    syncFromDom();
    setStatus('Saving');
    const response = await fetch(apiPath, {
      method: 'PUT',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        banner: state.banner,
        labels: state.labels,
        cities: state.cities,
        plots: state.plots,
        plotDetail: state.plotDetail,
      }),
    });
    const json = await response.json();
    if (!response.ok || json.success === false) {
      setStatus(json.message || 'Save failed');
      return;
    }
    state = json.data.homeContent;
    normalizeState();
    render();
    setStatus('Saved');
  } catch (error) {
    setStatus(error.message || 'Save failed');
  }
}

function render() {
  nodes.bannerHeadline.value = state.banner?.headline || '';
  nodes.bannerSubtitle.value = state.banner?.subtitle || '';
  nodes.cityTitle.value = state.labels?.cityTitle || '';
  nodes.recommendationTitle.value = state.labels?.recommendationTitle || '';
  nodes.activeTabTitle.value = state.labels?.activeTabTitle || '';
  nodes.upcomingTabTitle.value = state.labels?.upcomingTabTitle || '';
  preview(nodes.bannerPreview, state.banner?.image);

  nodes.cities.replaceChildren(
    ...sortItems(state.cities).map((city, index) => cityCard(city, index)),
  );
  nodes.plots.replaceChildren(
    ...sortItems(state.plots).map((plot) => plotCard(plot)),
  );
  renderPlotDetail();
}

function renderPlotDetail() {
  const plotDetail = detail();
  nodes.detailTitle.value = plotDetail.title || '';
  nodes.detailSize.value = plotDetail.size || '';
  nodes.detailLocation.value = plotDetail.location || '';
  nodes.detailPlotCount.value = plotDetail.plotCount || '';
  nodes.detailPriceRange.value = plotDetail.priceRange || '';
  nodes.detailEdition.value = plotDetail.edition || '';
  nodes.detailHeroImage.value = imageValue(plotDetail.heroImage);
  nodes.detailThumb1.value = imageValue(plotDetail.thumbnails[0]);
  nodes.detailThumb2.value = imageValue(plotDetail.thumbnails[1]);
  nodes.detailThumb3.value = imageValue(plotDetail.thumbnails[2]);
  nodes.detailThumb4.value = imageValue(plotDetail.thumbnails[3]);

  nodes.selectionTitle.value = plotDetail.selection.title || '';
  nodes.selectionImage.value = imageValue(plotDetail.selection.image);
  nodes.selectionTotalAmount.value = plotDetail.selection.totalAmount || '';
  nodes.selectionUnlockCopy.value = plotDetail.selection.unlockCopy || '';
  nodes.selectionSelectedCount.value = plotDetail.selection.selectedCount || '';
  nodes.selectionButtonText.value = plotDetail.selection.buttonText || '';
  nodes.selectionMapTitle.value =
    plotDetail.selection.mapTitle || plotDetail.selection.premiumTitle || '';
  nodes.selectionPlots.value = (plotDetail.selection.plots || [])
    .map((plot) =>
      [
        plot.label || '',
        plot.size || '',
        plot.direction || '',
        plot.status || 'available',
      ].join('|'),
    )
    .join('\n');
  nodes.summaryImage.value = imageValue(plotDetail.summary.image);
  nodes.summarySelectedLabel.value = plotDetail.summary.selectedLabel || '';
  nodes.summaryPremiumPlots.value = (plotDetail.summary.premiumPlots || []).join('\n');
  nodes.summaryStandardPlots.value = (plotDetail.summary.standardPlots || []).join('\n');
  nodes.summaryAgreementCopy.value = plotDetail.summary.agreementCopy || '';
  nodes.summaryPaymentRulesTitle.value = plotDetail.summary.paymentRulesTitle || '';
  nodes.summaryPaymentRules.value = (plotDetail.summary.paymentRules || [])
    .map((rule) => `${rule.type || 'success'}|${rule.text || ''}`)
    .join('\n');
  nodes.summaryDocumentationTitle.value = plotDetail.summary.documentationTitle || '';
  nodes.summaryRegistrationTitle.value = plotDetail.summary.registrationTitle || '';
  nodes.summaryPaymentBreakdownTitle.value = plotDetail.summary.paymentBreakdownTitle || '';
  nodes.summaryTotalLabel.value = plotDetail.summary.totalLabel || '';
  nodes.summaryPremiumAmount.value = plotDetail.summary.premiumAmount || '';
  nodes.summaryStandardAmount.value = plotDetail.summary.standardAmount || '';
  nodes.summaryTotalAmount.value = plotDetail.summary.totalAmount || '';
  nodes.summaryEmiButtonText.value = plotDetail.summary.emiButtonText || '';
  nodes.summaryFullButtonText.value = plotDetail.summary.fullButtonText || '';

  nodes.aboutMapImage.value = imageValue(plotDetail.about.mapImage);
  nodes.aboutCardImage.value = imageValue(plotDetail.about.cardImage);
  for (let i = 0; i < 4; i += 1) {
    nodes[`info${i + 1}Label`].value = plotDetail.about.info[i]?.label || '';
    nodes[`info${i + 1}Value`].value = plotDetail.about.info[i]?.value || '';
    nodes[`amenity${i + 1}`].value = plotDetail.about.amenities[i] || '';
  }
  nodes.amenitiesTitle.value = plotDetail.about.amenitiesTitle || '';
  nodes.highlightsTitle.value = plotDetail.about.highlightsTitle || '';
  nodes.documentsTitle.value = plotDetail.documentsTitle || '';
  nodes.nearbyTitle.value = plotDetail.nearbyTitle || '';

  nodes.highlights.replaceChildren(
    ...plotDetail.about.highlights.map((item, index) =>
      highlightCard(item, index),
    ),
  );
  nodes.documents.replaceChildren(
    ...plotDetail.documents.map((item, index) => documentCard(item, index)),
  );
  nodes.nearby.replaceChildren(
    ...plotDetail.nearby.map((item, index) => nearbyCard(item, index)),
  );
}

function cityCard(city, index) {
  const card = nodes.cityTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.id = city.id;
  setValue(card, 'label', city.label);
  setValue(card, 'sortOrder', city.sortOrder ?? index);
  setChecked(card, 'isActive', city.isActive !== false);
  bindImageInput(card, city, 'image');
  bindRemove(card, () => {
    state.cities = state.cities.filter((item) => item.id !== city.id);
    render();
  });
  preview(card.querySelector('[data-preview]'), city.image);
  imageState(card.querySelector('[data-image-state]'), city.image);
  return card;
}

function plotCard(plot) {
  const card = nodes.plotTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.id = plot.id;
  card.querySelector('[data-title]').textContent = 'Recommend plot';
  ['title', 'place', 'priceRange', 'plotCount', 'cityId', 'status', 'sortOrder'].forEach(
    (field) => setValue(card, field, plot[field] ?? ''),
  );
  setChecked(card, 'isActive', plot.isActive !== false);
  bindImageInput(card, plot, 'image');
  bindImageInput(card, plot, 'iconImage');
  const plotDetail = detailForPlot(plot);
  setValue(card, 'detailHeroImage', imageValue(plotDetail.heroImage));
  setValue(card, 'detailThumb1', imageValue(plotDetail.thumbnails[0]));
  setValue(card, 'detailThumb2', imageValue(plotDetail.thumbnails[1]));
  setValue(card, 'detailThumb3', imageValue(plotDetail.thumbnails[2]));
  setValue(card, 'detailThumb4', imageValue(plotDetail.thumbnails[3]));
  bindUploadToInput(card.querySelector('[data-field="detailHeroUpload"]'), card.querySelector('[data-field="detailHeroImage"]'));
  bindUploadToInput(card.querySelector('[data-field="detailThumb1Upload"]'), card.querySelector('[data-field="detailThumb1"]'));
  bindUploadToInput(card.querySelector('[data-field="detailThumb2Upload"]'), card.querySelector('[data-field="detailThumb2"]'));
  bindUploadToInput(card.querySelector('[data-field="detailThumb3Upload"]'), card.querySelector('[data-field="detailThumb3"]'));
  bindUploadToInput(card.querySelector('[data-field="detailThumb4Upload"]'), card.querySelector('[data-field="detailThumb4"]'));
  bindRemove(card, () => {
    state.plots = state.plots.filter((item) => item.id !== plot.id);
    render();
  });
  preview(card.querySelector('[data-preview="image"]'), plot.image);
  preview(card.querySelector('[data-preview="iconImage"]'), plot.iconImage);
  imageState(card.querySelector('[data-image-state="image"]'), plot.image);
  imageState(card.querySelector('[data-image-state="iconImage"]'), plot.iconImage);
  return card;
}

function highlightCard(item, index) {
  const card = nodes.highlightTemplate.content.firstElementChild.cloneNode(true);
  setValue(card, 'title', item.title);
  setValue(card, 'distance', item.distance);
  setValue(card, 'imageValue', imageValue(item.image));
  bindUploadToInput(card.querySelector('[data-field="imageUpload"]'), card.querySelector('[data-field="imageValue"]'));
  bindRemove(card, () => {
    detail().about.highlights.splice(index, 1);
    renderPlotDetail();
  });
  return card;
}

function documentCard(item, index) {
  const card = nodes.documentTemplate.content.firstElementChild.cloneNode(true);
  setValue(card, 'title', item.title);
  setValue(card, 'size', item.size);
  bindRemove(card, () => {
    detail().documents.splice(index, 1);
    renderPlotDetail();
  });
  return card;
}

function nearbyCard(item, index) {
  const card = nodes.nearbyTemplate.content.firstElementChild.cloneNode(true);
  setValue(card, 'title', item.title);
  setValue(card, 'place', item.place);
  setValue(card, 'plotCount', item.plotCount);
  setValue(card, 'priceRange', item.priceRange);
  setValue(card, 'imageValue', imageValue(item.image));
  bindUploadToInput(card.querySelector('[data-field="imageUpload"]'), card.querySelector('[data-field="imageValue"]'));
  bindRemove(card, () => {
    detail().nearby.splice(index, 1);
    renderPlotDetail();
  });
  return card;
}

function syncFromDom() {
  state.banner = {
    ...(state.banner || {}),
    headline: nodes.bannerHeadline.value.trim(),
    subtitle: nodes.bannerSubtitle.value.trim(),
  };
  state.labels = {
    cityTitle: nodes.cityTitle.value.trim(),
    recommendationTitle: nodes.recommendationTitle.value.trim(),
    activeTabTitle: nodes.activeTabTitle.value.trim(),
    upcomingTabTitle: nodes.upcomingTabTitle.value.trim(),
  };

  syncPlotDetailFromFields();
  syncHomeCollections();
}

function syncHomeCollections() {
  state.cities = [...nodes.cities.querySelectorAll('[data-kind="city"]')].map(
    (card, index) => {
      const existing = state.cities.find((city) => city.id === card.dataset.id);
      return {
        ...existing,
        label: value(card, 'label'),
        sortOrder: numberValue(card, 'sortOrder', index),
        isActive: checked(card, 'isActive'),
      };
    },
  );

  const plotCards = [...nodes.plots.querySelectorAll('[data-kind="plot"]')];
  state.plots = plotCards.map((card, index) => {
    const existing = state.plots.find((plot) => plot.id === card.dataset.id);
    return {
      ...existing,
      title: value(card, 'title'),
      place: value(card, 'place'),
      priceRange: value(card, 'priceRange'),
      plotCount: value(card, 'plotCount'),
      cityId: value(card, 'cityId'),
      status: value(card, 'status') === 'upcoming' ? 'upcoming' : 'active',
      detail: {
        ...(existing?.detail || {}),
        ...detail(),
        title: value(card, 'title'),
        location: value(card, 'place'),
        plotCount: value(card, 'plotCount'),
        priceRange: value(card, 'priceRange'),
        heroImage: imageFromValue(value(card, 'detailHeroImage')),
        thumbnails: [
          imageFromValue(value(card, 'detailThumb1')),
          imageFromValue(value(card, 'detailThumb2')),
          imageFromValue(value(card, 'detailThumb3')),
          imageFromValue(value(card, 'detailThumb4')),
        ],
      },
      sortOrder: numberValue(card, 'sortOrder', index),
      isActive: checked(card, 'isActive'),
    };
  });
}

function syncPlotDetailFromFields() {
  const plotDetail = detail();
  plotDetail.title = nodes.detailTitle.value.trim();
  plotDetail.size = nodes.detailSize.value.trim();
  plotDetail.location = nodes.detailLocation.value.trim();
  plotDetail.plotCount = nodes.detailPlotCount.value.trim();
  plotDetail.priceRange = nodes.detailPriceRange.value.trim();
  plotDetail.edition = nodes.detailEdition.value.trim();
  plotDetail.heroImage = imageFromValue(nodes.detailHeroImage.value);
  plotDetail.thumbnails = [
    imageFromValue(nodes.detailThumb1.value),
    imageFromValue(nodes.detailThumb2.value),
    imageFromValue(nodes.detailThumb3.value),
    imageFromValue(nodes.detailThumb4.value),
  ];

  plotDetail.selection = {
    title: nodes.selectionTitle.value.trim(),
    image: imageFromValue(nodes.selectionImage.value),
    totalAmount: nodes.selectionTotalAmount.value.trim(),
    unlockCopy: nodes.selectionUnlockCopy.value.trim(),
    selectedCount: nodes.selectionSelectedCount.value.trim(),
    buttonText: nodes.selectionButtonText.value.trim(),
    mapTitle: nodes.selectionMapTitle.value.trim(),
    plots: lines(nodes.selectionPlots.value).map((line, index) => {
      const [label, size, direction, status] = line.split('|');
      const statusValue = ['available', 'selected', 'sold'].includes(
        status?.trim(),
      )
        ? status.trim()
        : 'available';
      return {
        id: `plot-${index + 1}-${label?.trim() || index + 1}`,
        label: label?.trim() || `${index + 1}`,
        size: size?.trim() || '101 sq yd',
        direction: direction?.trim() || 'N',
        status: statusValue,
      };
    }),
  };

  plotDetail.summary = {
    image: imageFromValue(nodes.summaryImage.value),
    selectedLabel: nodes.summarySelectedLabel.value.trim(),
    premiumTitle: 'Selected Plots:',
    standardTitle: '',
    premiumPlots: lines(nodes.summaryPremiumPlots.value),
    standardPlots: lines(nodes.summaryStandardPlots.value),
    agreementCopy: nodes.summaryAgreementCopy.value.trim(),
    paymentRulesTitle: nodes.summaryPaymentRulesTitle.value.trim(),
    paymentRules: lines(nodes.summaryPaymentRules.value).map((line) => {
      const [type, ...textParts] = line.split('|');
      return {
        type: type?.trim() === 'warning' ? 'warning' : 'success',
        text: textParts.join('|').trim() || type.trim(),
      };
    }),
    documentationTitle: nodes.summaryDocumentationTitle.value.trim(),
    registrationTitle: nodes.summaryRegistrationTitle.value.trim(),
    paymentBreakdownTitle: nodes.summaryPaymentBreakdownTitle.value.trim(),
    totalLabel: nodes.summaryTotalLabel.value.trim(),
    premiumAmount: nodes.summaryPremiumAmount.value.trim(),
    standardAmount: nodes.summaryStandardAmount.value.trim(),
    totalAmount: nodes.summaryTotalAmount.value.trim(),
    emiButtonText: nodes.summaryEmiButtonText.value.trim(),
    fullButtonText: nodes.summaryFullButtonText.value.trim(),
  };

  plotDetail.about = {
    mapImage: imageFromValue(nodes.aboutMapImage.value),
    cardImage: imageFromValue(nodes.aboutCardImage.value),
    info: [1, 2, 3, 4].map((number) => ({
      label: nodes[`info${number}Label`].value.trim(),
      value: nodes[`info${number}Value`].value.trim(),
    })),
    amenitiesTitle: nodes.amenitiesTitle.value.trim(),
    amenities: [1, 2, 3, 4].map((number) =>
      nodes[`amenity${number}`].value.trim(),
    ),
    highlightsTitle: nodes.highlightsTitle.value.trim(),
    highlights: [...nodes.highlights.querySelectorAll('[data-kind="highlight"]')].map((card) => ({
      title: value(card, 'title'),
      distance: value(card, 'distance'),
      image: imageFromValue(value(card, 'imageValue')),
    })),
  };

  plotDetail.documentsTitle = nodes.documentsTitle.value.trim();
  plotDetail.documents = [...nodes.documents.querySelectorAll('[data-kind="document"]')].map((card) => ({
    title: value(card, 'title'),
    size: value(card, 'size'),
  }));
  plotDetail.nearbyTitle = nodes.nearbyTitle.value.trim();
  plotDetail.nearby = [...nodes.nearby.querySelectorAll('[data-kind="nearby"]')].map((card) => ({
    title: value(card, 'title'),
    place: value(card, 'place'),
    plotCount: value(card, 'plotCount'),
    priceRange: value(card, 'priceRange'),
    image: imageFromValue(value(card, 'imageValue')),
  }));
}

function normalizeState() {
  state.banner ||= {};
  state.labels ||= {};
  state.cities ||= [];
  state.plots ||= [];
  const plotDetail = detail();
  plotDetail.thumbnails ||= [];
  plotDetail.selection ||= {};
  plotDetail.about ||= {};
  plotDetail.about.info ||= [];
  plotDetail.about.amenities ||= [];
  plotDetail.about.highlights ||= [];
  plotDetail.documents ||= [];
  plotDetail.nearby ||= [];
}

function detail() {
  state.plotDetail ||= {};
  normalizeNestedDetail(state.plotDetail);
  return state.plotDetail;
}

function detailForPlot(plot) {
  const plotDetail = { ...detail(), ...(plot.detail || {}) };
  normalizeNestedDetail(plotDetail);
  return plotDetail;
}

function normalizeNestedDetail(plotDetail) {
  plotDetail.thumbnails ||= [];
  plotDetail.selection ||= {};
  plotDetail.summary ||= {};
  plotDetail.summary.premiumPlots ||= [];
  plotDetail.summary.standardPlots ||= [];
  plotDetail.summary.paymentRules ||= [];
  plotDetail.about ||= {};
  plotDetail.about.info ||= [];
  plotDetail.about.amenities ||= [];
  plotDetail.about.highlights ||= [];
  plotDetail.documents ||= [];
  plotDetail.nearby ||= [];
}

function bindImageInput(card, item, field) {
  card.querySelector(`[data-field="${field}"]`).addEventListener(
    'change',
    async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        syncFromDom();
        const current =
          state.cities.find((entry) => entry.id === item.id) ||
          state.plots.find((entry) => entry.id === item.id);
        if (!current) return;
        setStatus('Uploading image');
        current[field] = await uploadFile(file);
        render();
        setStatus('Image uploaded. Save changes to publish.');
      } catch (error) {
        setStatus(error.message || 'Image upload failed');
      }
    },
  );
}

function bindStandaloneUpload(input, onUploaded) {
  input.addEventListener('change', async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      syncFromDom();
      setStatus('Uploading image');
      await onUploaded(await uploadFile(file));
      render();
      setStatus('Image uploaded. Save changes to publish.');
    } catch (error) {
      setStatus(error.message || 'Image upload failed');
    }
  });
}

function bindFieldUpload(selector, targetInput) {
  bindUploadToInput(document.querySelector(selector), targetInput);
}

function bindUploadToInput(fileInput, targetInput) {
  fileInput.addEventListener('change', async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      setStatus('Uploading image');
      const image = await uploadFile(file);
      targetInput.value = imageValue(image);
      setStatus('Image uploaded. Save changes to publish.');
    } catch (error) {
      setStatus(error.message || 'Image upload failed');
    }
  });
}

function lines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function bindRemove(card, callback) {
  card.querySelector('[data-remove]').addEventListener('click', callback);
}

function fileToImage(file) {
  return readFileAsDataUrl(file).then((source) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const mimeType = 'image/jpeg';
        const quality = 0.78;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const [, data] = dataUrl.split(',');
        resolve({ base64: data, mimeType });
      };
      image.onerror = () => reject(new Error('Image could not be loaded'));
      image.src = source;
    });
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Image file could not be read'));
    reader.readAsDataURL(file);
  });
}

async function uploadFile(file) {
  const image = await fileToImage(file);
  const response = await fetch(uploadPath, {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(image),
  });
  const json = await response.json();
  if (!response.ok || json.success === false) {
    throw new Error(json.message || 'Image upload failed');
  }
  return json.data.image;
}

function showPage(page) {
  nodes.pages.forEach((section) => {
    section.hidden = section.dataset.page !== page;
  });
  nodes.navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.nav === page);
  });
}

function preview(img, image) {
  const src = imageSrc(image);
  img.onerror = () => {
    img.hidden = true;
  };
  img.src = src || '';
  img.hidden = !src;
}

function imageState(node, image) {
  node.textContent = imageSrc(image) ? 'Saved image available' : '';
}

function imageSrc(image) {
  if (!image) return '';
  if (image.base64) return `data:${image.mimeType || 'image/png'};base64,${image.base64}`;
  if (image.url) return absoluteUrl(image.url);
  return '';
}

function absoluteUrl(url) {
  if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
  return `${window.location.origin}${url}`;
}

function imageValue(image) {
  if (image?.base64) {
    return `data:${image.mimeType || 'image/png'};base64,${image.base64}`;
  }
  return image?.url || image?.asset || '';
}

function imageFromValue(rawValue) {
  const value = rawValue.trim();
  if (!value) return {};
  if (value.startsWith('data:')) {
    const [meta, base64] = value.split(',');
    const mimeType = meta.match(/^data:([^;]+)/)?.[1] || 'image/png';
    return { base64, mimeType };
  }
  if (value.startsWith('/') || value.startsWith('http')) return { url: value };
  return { asset: value };
}

function value(card, field) {
  return card.querySelector(`[data-field="${field}"]`).value.trim();
}

function numberValue(card, field, fallback) {
  const number = Number(value(card, field));
  return Number.isFinite(number) ? number : fallback;
}

function checked(card, field) {
  return card.querySelector(`[data-field="${field}"]`).checked;
}

function setValue(card, field, value) {
  card.querySelector(`[data-field="${field}"]`).value = value ?? '';
}

function setChecked(card, field, value) {
  card.querySelector(`[data-field="${field}"]`).checked = Boolean(value);
}

function sortItems(items) {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function setStatus(text) {
  nodes.status.textContent = text;
}

function adminHeaders(headers = {}) {
  const token = localStorage.getItem('adminToken');
  return {
    ...headers,
    ...(token ? { 'x-admin-token': token } : {}),
  };
}

showPage('home');
load().catch((error) => setStatus(error.message));
