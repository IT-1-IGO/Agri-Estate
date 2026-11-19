/** What the page editor saves for one public page. Keys are produced by dom.ts. */
export interface LiveValues {
  text?: Record<string, string>;                       // original text -> new text
  img?: Record<string, { src?: string; alt?: string }>; // "<owner>::<original src>" -> replacement
  link?: Record<string, string>;                        // "<owner>::<original href>" -> new href
  hiddenSections?: string[];
  deletedSections?: string[];
  sectionOrder?: string[];
  hiddenCards?: string[];
  deletedCards?: string[];
  addedCards?: Record<string, AddedCard[]>;             // group key -> cards added by the admin (keys are "added:<id>")
  cardOrder?: Record<string, string[]>;                 // group key -> card keys in display order
  addedSections?: AddedSection[];                       // whole sections created in the admin ("+ Add New Section"); keys are "new:<id>"
}

/** One content item inside a section created in the admin (a card, step, question, statistic, quote...). */
export interface SectionItem { id: string; title: string; text: string; image?: string; alt?: string; link?: string }

/** A main section created in the admin for one page. */
export interface AddedSection {
  id: string;
  name: string;                 // internal name shown in the editor
  label: string;                // small eyebrow text above the heading
  heading: string; subtitle: string; description: string;
  template: string;             // id from sectionTemplates.ts
  layout: string; columns: number;
  bg: string; color: string; align: 'left' | 'center' | 'right';
  image: string; bgImage: string; alt: string;   // "media:ID" or URL
  btnText: string; btnLink: string; btnVisible: boolean;
  status: 'draft' | 'published';                 // draft sections are never shown to visitors
  items: SectionItem[];
}

/** A card/item added in the admin: a copy of an existing card's layout ("tpl") with its own content. */
export interface AddedCard {
  id: string;
  tpl: string;                                          // key of the existing card whose layout is copied
  texts: Record<string, string>;                        // template text -> this card's text
  img: Record<string, { src?: string; alt?: string }>;  // template image src -> this card's image
  link: Record<string, string>;                         // template href -> this card's link
}

export interface ScanText { key: string; value: string; tag: string }
export interface ScanImage { id: string; orig: string; src: string; alt: string; origAlt: string; bg?: boolean }
export interface ScanLink { id: string; orig: string; href: string; label: string }
export interface ScanBlock { texts: ScanText[]; images: ScanImage[]; links: ScanLink[] }
export interface ScanCard { key: string; label: string; block: ScanBlock }
export interface ScanGroup { key: string; canReorder: boolean; cards: ScanCard[] }
export interface ScanSection { key: string; label: string; general: ScanBlock; groups: ScanGroup[] }
export interface ScanResult { sections: ScanSection[]; page: ScanBlock; usage: Record<string, number>; hasMain: boolean }

export const livePageName = (path: string) => 'live.' + (path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-'));
