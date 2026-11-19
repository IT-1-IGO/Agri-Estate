import type { AddedSection } from './types';

export type SectionKind = 'hero' | 'text' | 'split' | 'cards' | 'gallery' | 'stats' | 'steps' | 'faq' | 'quotes' | 'checklist' | 'cta';

export interface SectionTemplate {
  id: string; name: string; desc: string; kind: SectionKind;
  layouts: { id: string; label: string }[];
  columns?: number[];                                   // selectable column counts (default first)
  image: boolean; bgImage: boolean; button: boolean;    // which media / button fields apply
  item?: { word: string; plural: string; title: string; text: string; image?: boolean; link?: boolean };
  bg: string; color: string;
}

const L = (id: string, label: string) => ({ id, label });
const LIGHT = { bg: '#FFFFFF', color: '#10231D' }, SOFT = { bg: '#F2F6F3', color: '#10231D' }, FOREST = { bg: '#124B3B', color: '#FFFFFF' };

export const TEMPLATES: SectionTemplate[] = [
  { id: 'hero', name: 'Hero Banner', desc: 'Large banner with heading, intro and button.', kind: 'hero', layouts: [L('banner', 'Full-width banner'), L('split', 'Text with side image')], image: true, bgImage: true, button: true, ...FOREST },
  { id: 'about', name: 'About Content', desc: 'Heading and a long text block.', kind: 'text', layouts: [L('single', 'Single column'), L('two-column', 'Two-column text')], image: false, bgImage: true, button: true, ...LIGHT },
  { id: 'imageText', name: 'Image and Text', desc: 'Picture beside a heading and text.', kind: 'split', layouts: [L('image-left', 'Image on left'), L('image-right', 'Image on right')], image: true, bgImage: false, button: true, ...LIGHT },
  { id: 'services', name: 'Services Cards', desc: 'A grid of service cards.', kind: 'cards', layouts: [L('grid', 'Card grid'), L('list', 'Stacked list')], columns: [3, 2, 4], image: false, bgImage: false, button: true, item: { word: 'Service', plural: 'Services', title: 'Service name', text: 'Short description', image: true, link: true }, ...SOFT },
  { id: 'features', name: 'Feature Cards', desc: 'Highlight what makes IGO different.', kind: 'cards', layouts: [L('grid', 'Card grid'), L('list', 'Stacked list')], columns: [3, 2, 4], image: false, bgImage: false, button: true, item: { word: 'Feature', plural: 'Features', title: 'Feature title', text: 'Short description', image: true, link: true }, ...LIGHT },
  { id: 'property', name: 'Property Listing', desc: 'Land or property cards with photo and link.', kind: 'cards', layouts: [L('grid', 'Card grid'), L('list', 'Stacked list')], columns: [3, 2, 4], image: false, bgImage: false, button: true, item: { word: 'Property', plural: 'Properties', title: 'Property name / location', text: 'Details (size, price, highlights)', image: true, link: true }, ...LIGHT },
  { id: 'gallery', name: 'Project Gallery', desc: 'Photo tiles with captions.', kind: 'gallery', layouts: [L('wide', 'Wide tiles'), L('square', 'Square tiles')], columns: [3, 2, 4], image: false, bgImage: false, button: true, item: { word: 'Project', plural: 'Projects', title: 'Caption', text: 'Sub-caption', image: true, link: true }, ...LIGHT },
  { id: 'stats', name: 'Statistics', desc: 'Key numbers in a row.', kind: 'stats', layouts: [L('row', 'Plain row'), L('cards', 'Cards')], columns: [4, 3, 2], image: false, bgImage: true, button: false, item: { word: 'Statistic', plural: 'Statistics', title: 'Number (e.g. 25+)', text: 'What it counts' }, ...FOREST },
  { id: 'testimonials', name: 'Testimonials', desc: 'Quotes from customers.', kind: 'quotes', layouts: [L('grid', 'Card grid'), L('stacked', 'Stacked')], columns: [3, 2, 1], image: false, bgImage: false, button: false, item: { word: 'Testimonial', plural: 'Testimonials', title: 'Person name / role', text: 'Quote', image: true }, ...SOFT },
  { id: 'process', name: 'Process Steps', desc: 'Numbered steps from start to finish.', kind: 'steps', layouts: [L('horizontal', 'Steps in a row'), L('vertical', 'Vertical list')], columns: [4, 3, 2], image: false, bgImage: false, button: true, item: { word: 'Step', plural: 'Steps', title: 'Step title', text: 'What happens' }, ...LIGHT },
  { id: 'benefits', name: 'Benefits', desc: 'Checklist of benefits.', kind: 'checklist', layouts: [L('grid', 'Two columns'), L('list', 'Single list')], image: true, bgImage: false, button: true, item: { word: 'Benefit', plural: 'Benefits', title: 'Benefit', text: 'Explanation (optional)' }, ...SOFT },
  { id: 'faq', name: 'FAQ', desc: 'Questions and answers.', kind: 'faq', layouts: [L('accordion', 'Single column'), L('two-column', 'Two columns')], image: false, bgImage: false, button: true, item: { word: 'Question', plural: 'Questions', title: 'Question', text: 'Answer' }, ...LIGHT },
  { id: 'cta', name: 'Call to Action', desc: 'Strong message with one button.', kind: 'cta', layouts: [L('band', 'Highlighted band'), L('plain', 'Plain')], image: false, bgImage: true, button: true, ...LIGHT },
  { id: 'contact', name: 'Contact Information', desc: 'Phone, email, address cards.', kind: 'cards', layouts: [L('grid', 'Card grid'), L('list', 'Stacked list')], columns: [3, 2, 4], image: false, bgImage: false, button: true, item: { word: 'Contact detail', plural: 'Contact details', title: 'Label (e.g. Phone)', text: 'Value (e.g. number or address)', link: true }, ...SOFT },
  { id: 'custom', name: 'Custom Content', desc: 'Free text with optional image.', kind: 'split', layouts: [L('text-only', 'Text only'), L('image-left', 'Image on left'), L('image-right', 'Image on right'), L('image-top', 'Image on top')], image: true, bgImage: true, button: true, ...LIGHT },
];

export const tplOf = (id: string): SectionTemplate => TEMPLATES.find((t) => t.id === id) || TEMPLATES[TEMPLATES.length - 1];

export const BG_PRESETS: { label: string; bg: string; color: string }[] = [
  { label: 'White', bg: '#FFFFFF', color: '#10231D' },
  { label: 'Soft grey', bg: '#F2F6F3', color: '#10231D' },
  { label: 'Sage', bg: '#E4EEDC', color: '#10231D' },
  { label: 'Forest green', bg: '#124B3B', color: '#FFFFFF' },
  { label: 'Deep green', bg: '#063D30', color: '#FFFFFF' },
];

export const newSection = (templateId: string): AddedSection => {
  const t = tplOf(templateId);
  return {
    id: '', name: '', label: '', heading: '', subtitle: '', description: '', template: t.id, layout: t.layouts[0].id, columns: t.columns?.[0] || 3,
    bg: t.bg, color: t.color, align: t.kind === 'hero' || t.kind === 'cta' || t.kind === 'stats' ? 'center' : 'left',
    image: '', bgImage: '', alt: '', btnText: '', btnLink: '', btnVisible: true, status: 'published', items: [],
  };
};
