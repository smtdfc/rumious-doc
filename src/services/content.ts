import ky from 'ky';
import appContext from '../context';
import { watch } from '@rumious/core';
import { PageMap } from '../types';

export class ContentService {
  static async getPageMap(): Promise<string[]> {
    try {
      const data = (await ky.get('/docs/list.json').json()) as any;
      appContext.setKey('pageMap', data as PageMap);
      return data.list;
    } catch (err) {
      throw err;
    }
  }

  static async getPageContent(name: string): Promise<string> {
    try {
      const currentLang = appContext.getKey('lang');
      const data = await ky.get(`/docs/${currentLang}/${name}.md`).text();
      return data;
    } catch (err) {
      throw err;
    }
  }

  static async getListPage(): Promise<Record<string, string>> {
    try {
      const currentLang = appContext.getKey('lang');
      const data = (await ky
        .get(`/docs/${currentLang}/dec.json`)
        .json()) as any;
      appContext.setKey('pageIndex', data);
      return data;
    } catch (err) {
      throw err;
    }
  }
}

const lang = appContext.reactiveKey('lang');
ContentService.getPageMap();
