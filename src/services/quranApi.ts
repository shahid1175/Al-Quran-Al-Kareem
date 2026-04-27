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
  },

  BENGALI_TAFSIRS: [
    { id: 161, name: 'Tafsir Ibn Kathir (ইবনে কাসীর)', slug: 'bn-tafsir-ibn-kasir' },
    { id: 168, name: 'Tafheem-ul-Quran (তাফহীমুল কুরআন)', slug: 'bn-tafheem-ul-quran' },
    { id: 169, name: 'Fi Zilal al-Quran (ফি জিলালিল কুরআন)', slug: 'bn-fi-zilal-al-quran' },
    { id: 162, name: 'Ahsanul Bayaan (আহসানুল বায়ান)', slug: 'bn-ahsanul-bayaan' },
    { id: 163, name: 'Fathul Majeed (ফাতহুল মাজীদ)', slug: 'bn-fathul-majeed' }
  ],

  async getTafsir(surahNumber: number, ayahNumber: number, tafsirId?: number): Promise<string> {
    try {
      const id = tafsirId || parseInt(localStorage.getItem('preferred_tafsir') || '161');
      const response = await fetch(`https://api.quran.com/api/v4/tafsirs/${id}/by_ayah/${surahNumber}:${ayahNumber}`);
      const data = await response.json();
      if (data && data.tafsir) {
        return data.tafsir.text;
      }
      return 'তাফসীর বর্তমানে পাওয়া যাচ্ছে না। (Tafsir currently unavailable)';
    } catch (error) {
      console.error('Error fetching tafsir:', error);
      return 'তাফসীর বর্তমানে পাওয়া যাচ্ছে না। (Tafsir currently unavailable)';
    }
  }
};
