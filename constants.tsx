
import React from 'react';
import { LinkCategory } from './types';

export const CLOUD_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
    <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.4-1.8-4.3-4.1-4.5C17.4 6.6 14.5 4 11 4 7.7 4 5 6.4 4.1 9.6c-2.3.4-4.1 2.3-4.1 4.7C0 16.8 2.2 19 5 19h12.5z"></path>
  </svg>
);

export const LINK_CATEGORIES: LinkCategory[] = [
  {
    title: 'AI Stuff',
    links: [
      { label: 'Civitai', url: '#' },
      { label: 'Civitai (ALT)', url: '#' },
      { label: 'TensorAI', url: '#' },
      { label: 'SeaArt', url: '#' },
      { label: 'weights', url: '#' },
      { label: 'Huggingface', url: '#' },
      { label: 'Github', url: '#' },
    ]
  },
  {
    title: 'Support & Test',
    links: [
      { label: 'Discord', url: '#' },
      { label: 'Telegram', url: '#' },
      { label: 'YouTube', url: '#' },
    ]
  },
  {
    title: 'Donate',
    links: [
      { label: 'Ko-FI', url: '#' },
    ]
  }
];

export const SKETCH_IMAGE_URL = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop"; 
