import { Property } from '../types';

const projectOffice = 'A Block, Venkateshwara Avenue, Harish Viceroy, Plot No. 3 & 4, Madipakkam Main Road, Madipakkam, Chennai - 600091, Tamil Nadu';

// Only verified details are listed. Price, size and title particulars are shared on request
// until each parcel has been surveyed and documented by IGO.
export const locationEstates: Record<string, Property[]> = {
  maduranthagam: [
    {
      id: 'maduranthagam-agri-land-1',
      title: 'Maduranthagam Agricultural Land: Parcel 1',
      location: 'Maduranthagam, Tamil Nadu',
      price: 'On request',
      size: 'On request',
      type: 'Open Field Agricultural Land',
      image: '/images/properties/maduranthagam-parcel-1.webp',
      images: ['/images/properties/maduranthagam-parcel-1.webp', '/images/properties/open-cultivation.png'],
      status: 'Available',
      roi: 'On request',
      description: 'Agricultural land in the Maduranthagam region, offered directly by IGO. Survey details, title documents and site visits are shared on request.',
      projectOffice,
      intention: 'Sell',
    },
    {
      id: 'maduranthagam-agri-land-2',
      title: 'Maduranthagam Agricultural Land: Parcel 2',
      location: 'Maduranthagam, Tamil Nadu',
      price: 'On request',
      size: 'On request',
      type: 'Open Field Agricultural Land',
      image: '/images/properties/open-cultivation.png',
      images: ['/images/properties/open-cultivation.png', '/images/featured/organic-farmland-hd.webp'],
      status: 'Available',
      roi: 'On request',
      description: 'Agricultural land in the Maduranthagam region, offered directly by IGO. Survey details, title documents and site visits are shared on request.',
      projectOffice,
      intention: 'Sell',
    },
  ],
};

export const allEstates = Object.values(locationEstates).flat();

export const locations = [
  {
    id: 'maduranthagam',
    name: 'Maduranthagam',
    description: 'Agricultural land in the Maduranthagam region of Tamil Nadu, offered directly by IGO with verified documents and guided site visits.',
    heroImage: '/images/featured/organic-farmland-hd.webp',
    estateCount: locationEstates.maduranthagam.length,
    avgPrice: 'On request',
    avgRoi: 'On request',
  },
];

export const getEstatesByLocation = (locationId: string): Property[] => {
  return locationEstates[locationId] || [];
};

export const getLocationById = (id: string) => {
  return locations.find(l => l.id === id);
};
