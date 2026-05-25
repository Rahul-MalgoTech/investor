import { HomeContent } from '../models/homeContent.model.js';

export function defaultHomeContent() {
  return {
    key: 'home',
    banner: {
      headline: 'Give a Unique\nGift that stays for\nForever!',
      subtitle: 'Personalize the Starframe and anchor.',
      image: { asset: 'homeStarframe' },
    },
    labels: {
      cityTitle: 'Select City',
      recommendationTitle: 'Recommend Plots',
      activeTabTitle: 'Active Releases',
      upcomingTabTitle: 'Upcoming',
    },
    plotDetail: defaultPlotDetail(),
    cities: [
      city('all', 'All', 'homeCityAll', 0),
      city('delhi', 'Delhi', 'homeCityDelhi', 1),
      city('chennai', 'Chennai', 'homeCityChennai', 2),
      city('noida', 'Noida', 'homeCityNoida', 3),
    ],
    plots: [
      plot('active-1', 'Sunrise valley', 'OMR Road', 0),
      plot('active-2', 'Hawa Gardens', 'Delhi', 1),
      plot('active-3', 'Hill Crest', 'OMR Road', 2),
      plot('active-4', 'Meadow Park', 'Delhi', 3),
      plot('active-5', 'Valley View', 'OMR Road', 4),
      plot('active-6', 'Sunset Acres', 'Delhi', 5),
    ],
  };
}

export async function findOrCreateHomeContent() {
  const existing = await HomeContent.findOne({ key: 'home' });
  if (existing) {
    return existing;
  }
  return HomeContent.create(defaultHomeContent());
}

export async function replaceHomeContent(content) {
  return HomeContent.findOneAndUpdate(
    { key: 'home' },
    {
      $set: {
        key: 'home',
        banner: content.banner,
        labels: content.labels,
        cities: content.cities,
        plots: content.plots,
        plotDetail: content.plotDetail,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

function defaultPlotDetail() {
  return {
    heroImage: { asset: 'plotDetailHero' },
    thumbnails: [
      { asset: 'plotDetailThumb1' },
      { asset: 'plotDetailThumb2' },
      { asset: 'plotDetailThumb3' },
      { asset: 'plotDetailThumb4' },
    ],
    title: '',
    size: '1200 sq.ft',
    location: '',
    plotCount: '',
    priceRange: '',
    edition: 'Standard Edition',
    selection: {
      title: 'Plot Selection',
      image: { asset: 'plotDetailCard' },
      totalAmount: '₹50,00,000',
      unlockCopy: 'Add 3 More Plots to Unlock\nLegacy Edition',
      selectedCount: '10',
      buttonText: 'Choose Plots',
      mapTitle: 'Plots',
      plots: [
        { id: 'plot-1', label: '1', size: '101 sq yd', direction: 'N', status: 'available' },
        { id: 'plot-2', label: '2', size: '101 sq yd', direction: 'N', status: 'selected' },
        { id: 'plot-3', label: '3', size: '101 sq yd', direction: 'N', status: 'sold' },
        { id: 'plot-4', label: '4', size: '120 sq yd', direction: 'E', status: 'available' },
        { id: 'plot-5', label: '5', size: '120 sq yd', direction: 'E', status: 'available' },
        { id: 'plot-6', label: '6', size: '101 sq yd', direction: 'W', status: 'available' },
        { id: 'plot-7', label: '7', size: '101 sq yd', direction: 'S', status: 'available' },
        { id: 'plot-8', label: '8', size: '101 sq yd', direction: 'S', status: 'sold' },
      ],
    },
    summary: {
      screenTitle: 'Plot Summary',
      image: { asset: 'plotSummaryThumb' },
      selectedLabel: '10 Selected',
      startsFromLabel: 'Starts From',
      editionLabel: 'Star Frame',
      selectedPlotsTitle: 'Selected Plots',
      premiumTitle: 'Premium Plots:',
      standardTitle: 'Standard Plots:',
      premiumPlots: [
        'plot 7 . 101 sq Yd',
        'plot 8 . 101 sq Yd',
        'plot 9 . 101 sq Yd',
        'plot 10 . 101 sq Yd',
        'plot 11 . 101 sq Yd',
        'plot 12 . 101 sq Yd',
      ],
      standardPlots: [
        'plot 1 . 101 sq Yd',
        'plot 2 . 101 sq Yd',
        'plot 3 . 101 sq Yd',
        'plot 4 . 101 sq Yd',
        'plot 5 . 101 sq Yd',
        'plot 6 . 101 sq Yd',
      ],
      agreementCopy:
        'I have read and agree to the rules, regulations,\nand documentation guidelines.',
      paymentRulesTitle: 'Payment Rules',
      paymentRules: [
        { type: 'success', text: 'All Plots are RERA registered and legally verified' },
        { type: 'success', text: 'Ownership transfer with in 30 days of full\npayment' },
        { type: 'warning', text: 'Late payment fees apply after 7 days grace\nperiod' },
        { type: 'warning', text: 'Cancellation allowed within 15 days with 10%\ndeduction' },
      ],
      documentationTitle: 'Documentation Process',
      registrationTitle: 'Registration Details',
      paymentBreakdownTitle: 'Payment Breakdown',
      breakdownTotalLabel: 'Total',
      totalAmountTitle: 'Total Amount:',
      totalLabel: '10 Plots',
      premiumAmount: '(x5 plots)  ₹4,00,000',
      standardAmount: '(x5 Plots)  ₹4,00,000',
      totalAmount: '₹ 8,00,000',
      emiOptions: [
        { title: '6 Months', months: 6, badge: '0% interest', amount: '', selected: true },
        { title: '12 Months', months: 12, badge: 'Most Popular', amount: '', selected: false },
        { title: '24 Months', months: 24, badge: '2% interest', amount: '', selected: false },
        { title: '36 Months', months: 36, badge: '3.5% interest', amount: '', selected: false },
      ],
      emiButtonText: 'Pay In EMI',
      fullButtonText: 'Pay In Full',
    },
    about: {
      mapImage: { asset: 'homeNearby2' },
      cardImage: { asset: 'plotDetailCard' },
      info: [
        { label: 'RERA ID', value: '2024/xxx' },
        { label: 'Size', value: '1200 sq.ft' },
        { label: 'Plot Type', value: 'Residential' },
        { label: 'Road Access', value: '1200 sq.ft' },
      ],
      amenitiesTitle: 'Amenities',
      amenities: ['Gated Entry', 'Underground', 'Street lights', 'Drainage'],
      highlightsTitle: 'Location Highlights',
      highlights: [
        { title: 'Highway', distance: '2.5 Km', image: { asset: 'homeNearby1' } },
        { title: 'School', distance: '1.2 km', image: { asset: 'homeCityDelhi' } },
        { title: 'Hospital', distance: '3.0 km', image: { asset: 'homeCityNoida' } },
        { title: 'City center', distance: '5.4 km', image: { asset: 'homePlotSunrise' } },
      ],
    },
    documentsTitle: 'Plot Documents',
    documents: [
      { title: 'Patta Document', size: '1.8MB' },
      { title: 'Chitta Document', size: '1.8MB' },
      { title: 'RERA Document', size: '1.8MB' },
      { title: 'Layout Blueprint', size: '1.8MB' },
      { title: 'Plot Blueprint', size: '1.8MB' },
    ],
    nearbyTitle: 'Plots Nearby',
    nearby: [
      { title: 'Sunrise valley', place: 'OMR Road', plotCount: '12 plots', priceRange: '₹3.0L -₹5.0L', image: { asset: 'homePlotGreen' } },
      { title: 'Sunrise valley', place: 'Delhi', plotCount: '45 plots', priceRange: '₹3.0L -₹5.0L', image: { asset: 'homePlotJaipur' } },
      { title: 'Sunrise valley', place: 'Delhi', plotCount: '45 plots', priceRange: '₹3.0L -₹5.0L', image: { asset: 'homePlotSunrise' } },
    ],
  };
}

function city(id, label, asset, sortOrder) {
  return {
    id,
    label,
    sortOrder,
    isActive: true,
    image: { asset },
  };
}

function plot(id, title, place, sortOrder) {
  const detail = defaultPlotDetail();
  return {
    id,
    title,
    place,
    priceRange: '₹3.0L - ₹5.0L',
    plotCount: '45 plots',
    status: 'active',
    sortOrder,
    isActive: true,
    image: {},
    iconImage: {},
    detail: {
      ...detail,
      title,
      location: place,
      plotCount: '45 plots',
      priceRange: '₹3.0L - ₹5.0L',
    },
  };
}
