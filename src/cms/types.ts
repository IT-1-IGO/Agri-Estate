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
  cardOrder?: Record<string, string[]>;                 // group key -> card keys in display order
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
