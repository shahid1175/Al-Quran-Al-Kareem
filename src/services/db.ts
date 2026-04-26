import Dexie, { Table } from 'dexie';
import { SurahDetail } from './quranApi';

export interface OfflineSurah {
  number: number;
  data: SurahDetail;
  downloadedAt: number;
}

export class QuranOfflineDB extends Dexie {
  surahs!: Table<OfflineSurah>;

  constructor() {
    super('QuranOfflineDB');
    this.version(1).stores({
      surahs: 'number, downloadedAt'
    });
  }
}

export const db = new QuranOfflineDB();
