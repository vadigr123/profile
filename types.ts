
export type Page = 'home' | 'links';

export interface LinkItem {
  label: string;
  url: string;
}

export interface LinkCategory {
  title: string;
  links: LinkItem[];
}
