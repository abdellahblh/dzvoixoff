import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env and .env.local
dotenv.config();
dotenv.config({ path: '.env.local' });

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY or GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const voices = [
  'Zephyr',
  'Puck',
  'Charon',
  'Fenrir',
  'Umbriel',
  'Kore',
  'Sulafat'
];

const previewTexts: Record<string, string> = {
  'Zephyr': 'مَا تْعَيِّيشْ رَاسَكْ مَعَ التَّسْجِيلْ — بْعَثْلِي النَّصْ، نَخْدَمْلَكْ فْوَا أُوفْ  طُوبْ، تَزيْدَ لِيكُومُونْدْ عَنْدَكْ!',
  'Puck': 'تَحْشَمْ تَهْدَرْ فِي الْمِيكْرُو؟ — وَصُوتَكْ مَايُخْرُجْشْ كِيمَا رَاكْ حَابْ فِي الإِعْلَانَاتْ؟... مَعْلِيشْ! نْتَا كْتَبْ السِّكْرِيبْتْ غِيرْ بِعَقْلَكْ، وَحْنَا نَخْدْمُولَكْ صُوتْ احْتِرَافِي يَجِيبْلَكْ لِيكُومُونْدْ ْ!',
  'Charon': 'مَاكَشْ مُوَالَفْ بِالتَّسْجِيلْ وَتُفَضَّلْ تَبْقَى مُورْ الْكَامِيرَا؟ — السَّلْعَة تَاعَكْ شَابَّة وَتَسْتَاهَلْ إِعْلَانْ طُوبْ... بْعَثْلِينَا النَّصْ، وَنَعْطُوكْ صُوتْ مُقْنِعْ يَبِيعْلَكْ بْلَا مَا تَتْعَبْ رُوحَكْ!',
  'Fenrir': 'بَزَّافْ نَاسْ عَنْدْهُمْ سَلْعَة هَايْلَة، بَصَّحْ يَحْشَمُوا يَدِيرُوا فْوَا أُوفْ! — الْيُومْ الْحَلْ سَاهَلْ... اكْتَبْ وَاشْ رَاكْ حَابْ تْقُولْ، وَخَلِّي الذَّكَاءْ الاصْطِنَاعِي يْهَدَّرْ فِي بْلَاصْتَكْ وَيْضَاعِفْلَكْ الْمَبِيعَاتْ!',
  'Umbriel': 'تَسْتَعْمَلْ ذَكَاءْ اصْطِنَاعِي يَهْدَرْ خَلِيجِي — وَالنَّاسْ تْخَافْ تَشْرِي عَلِيكْ؟... جِيبْلْنَا النَّصْ تَاعَكْ، وَدِي صُوتْ جَزَائِرِي مِيَّة بِالْمِيَّة يَدْخُلْ لِلْقَلْبْ — وَيْكترَلَكْ لِيكُومُونْدْ ْ!',
  'Kore': 'كتَبْ السِّكْرِيبْتْ تَاعَكْ وَخَلِّي الْبَاقِي عَلِينَا — نَعْطُوكْ صُوتْ جَزَائِرِي قُحْ، يَجْدَبْ الْكِلِيُونْ... وَيْطَلَّعْلَكْ لِيكُومُونْدْ!',
  'Sulafat': 'زَّافْ نَاسْ عَنْدْهُمْ سَلْعَة هَايْلَة، بَصَّحْ يَحْشَمُوا يَدِيرُوا فْوَا أُوفْ! — الْيُومْ الْحَلْ سَاهَلْ... اكْتَبْ وَاشْ رَاكْ حَابْ تْقُولْ، وَخَلِّي الذَّكَاءْ الاصْطِنَاعِي يْهَدَّرْ فِي بْلَاصْتَكْ وَيْضَاعِفْلَكْ الْمَبِيعَاتْ!',
};

function createWavBuffer(base64Audio: string): Buffer {
  const binaryString = atob(base64Audio);
  
  if (binaryString.startsWith('RIFF')) {
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return Buffer.from(bytes);
  }

  const sampleRate = 24000;
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = binaryString.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < binaryString.length; i++) {
    view.setUint8(44 + i, binaryString.charCodeAt(i));
  }

  return Buffer.from(buffer);
}

async function generatePreviews() {
  const voicesDir = path.join(process.cwd(), 'public', 'voices');
  if (!fs.existsSync(voicesDir)) {
    fs.mkdirSync(voicesDir, { recursive: true });
  }

  for (const voice of voices) {
    console.log(`Generating preview for ${voice}...`);
    const textToSpeak = previewTexts[voice] || 'يلا كنت حشمان، كاين لي يقدر يعاونك';
    const promptText = `Read the following text with an aggressive, high-impact sales voice designed for Facebook, TikTok, and Instagram Reels ads.
Deliver the text with maximum energy, urgency, and confidence to force attention and trigger immediate buying decisions.

Powerful, punchy rhythm — no calm or slow delivery
Create urgency, FOMO, and desire in every sentence
Emphasize problem → solution → result naturally through delivery
Bold, assertive, and convincing — never shy or neutral
Stress key words and benefits with strong vocal emphasis
End with a direct, commanding call to action

Voice style:
Modern, street-smart, confident commercial tone — sounds like a top-performing social media ad voiceover

Language rule:
Read every word exactly as written. If the text is in Arabic, read it in Arabic. If it is in French, read it in French. If it mixes languages, follow the mix exactly as written. Do not translate, replace, or rewrite anything.
Execution rules:

Speak numbers as natural spoken words
Use punctuation as natural pause and breath markers
Do not add any introduction, explanation, or conclusion
Start the vocal performance immediately

Goal:
Make the listener feel they need the product right now, not later.

Text to speak:
${textToSpeak}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const wavBuffer = createWavBuffer(base64Audio);
        fs.writeFileSync(path.join(voicesDir, `${voice}.wav`), wavBuffer);
        console.log(`Saved ${voice}.wav`);
      } else {
        console.error(`No audio data for ${voice}`);
      }
    } catch (err) {
      console.error(`Error generating ${voice}:`, err);
    }
    
    // Add a small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

generatePreviews().then(() => console.log('Done!')).catch(console.error);
