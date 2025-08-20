import { Context } from '@rumious/core';
import { PageMap } from '../types';

interface AppContext {
  lang: string;
  pageMap: PageMap;
  pageIndex: Record<string, any>;
}

let currentLang = localStorage.getItem('lang');
if (!currentLang) {
  localStorage.setItem('lang', 'en');
  currentLang = 'en';
}

const appContext = new Context<AppContext>({
  lang: currentLang,
  pageMap: {},
  pageIndex: {},
});

export default appContext;
