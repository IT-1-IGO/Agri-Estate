export type SectionType = 'hero' | 'text' | 'imageText' | 'cards' | 'cta';
export interface CustomCard { id: string; title: string; text: string; image: string; alt: string }
export interface CustomSection {
  id: string; type: SectionType; hidden?: boolean;
  heading: string; subheading?: string; body?: string; image?: string; alt?: string;
  buttonLabel?: string; buttonLink?: string; cards?: CustomCard[];
}
export const SECTION_LABELS: Record<SectionType, string> = { hero: 'Hero banner', text: 'Text block', imageText: 'Image + text', cards: 'Cards', cta: 'Call to action' };
export const customDocName = (id: string) => 'custom.' + id;
