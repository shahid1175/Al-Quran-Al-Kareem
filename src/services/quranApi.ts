export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  translation?: string;
  audio?: string;
  tafsir?: string;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

const BASE_URL = 'https://api.alquran.cloud/v1';

export const QuranService = {
  async getSurahs(): Promise<Surah[]> {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    return data.data;
  },

  async getSurahDetail(surahNumber: number, translationEdition = 'en.sahih', audioEdition = 'ar.alafasy'): Promise<SurahDetail> {
    // Fetch Arabic text
    const arabicRes = await fetch(`${BASE_URL}/surah/${surahNumber}/quran-uthmani`);
    const arabicData = await arabicRes.json();

    // Fetch Translation
    const transRes = await fetch(`${BASE_URL}/surah/${surahNumber}/${translationEdition}`);
    const transData = await transRes.json();

    // Fetch Audio
    const audioRes = await fetch(`${BASE_URL}/surah/${surahNumber}/${audioEdition}`);
    const audioData = await audioRes.json();

    const ayahs = arabicData.data.ayahs.map((ayah: any, index: number) => ({
      ...ayah,
      translation: transData.data.ayahs[index].text,
      audio: audioData.data.ayahs[index].audio,
    }));

    return {
      ...arabicData.data,
      ayahs,
    };
  },

  async search(query: string, language = 'en.sahih'): Promise<any> {
    const response = await fetch(`${BASE_URL}/search/${query}/all/${language}`);
    const data = await response.json();
    return data.data;
  },

  async getTranslations(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/edition?type=translation`);
    const data = await response.json();
    return data.data;
  },

  async getReciters(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/edition?format=audio&language=ar`);
    const data = await response.json();
    return data.data;
  }
};
