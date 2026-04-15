import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const readFirstPattern = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] != null) {
      const parsed = toNumber(match[1]);
      if (parsed != null) return parsed;
    }
  }
  return null;
};

const readMetric = (text, patterns, fallback) => {
  const value = readFirstPattern(text, patterns);
  return value == null ? fallback : value;
};

export const parseDateFromText = (text) => {
  const patterns = [
    /\b(?:scan\s*date|date\s*of\s*scan|exam\s*date|study\s*date)\s*[:=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match || !match[1]) continue;
    const [month, day, yearRaw] = match[1].split(/[/-]/);
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

const parseFromTabularRow = (text) => {
  const liveLean = text.match(
    /(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i
  );
  if (liveLean) {
    return {
      bodyFatPercent: toNumber(liveLean[1]),
      weight: toNumber(liveLean[2]),
      fatMass: toNumber(liveLean[3]),
      leanMass: toNumber(liveLean[4]),
    };
  }

  const dexaBody = text.match(
    /(\d+(?:\.\d+)?)\s*lbs\s*[-+]?\d+(?:\.\d+)?\s*lbs\s*(\d+(?:\.\d+)?)\s*lbs\s*[-+]?\d+(?:\.\d+)?\s*lbs\s*(\d+(?:\.\d+)?)\s*lbs\s*[-+]?\d+(?:\.\d+)?\s*lbs\s*(\d+(?:\.\d+)?)%/i
  );
  if (dexaBody) {
    return {
      weight: toNumber(dexaBody[1]),
      leanMass: toNumber(dexaBody[2]),
      fatMass: toNumber(dexaBody[3]),
      bodyFatPercent: toNumber(dexaBody[4]),
    };
  }

  return {};
};

export const parseDexaPdf = async (buffer) => {
  let text = '';
  try {
    const result = await pdfParse(buffer);
    text = result.text || '';
  } catch {
    text = '';
  }

  const normalized = text.replace(/\s+/g, ' ').trim();
  const tabular = parseFromTabularRow(normalized);

  const weight = tabular.weight ?? readMetric(
    normalized,
    [/weight(?:\s*\(lb\))?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i, /total\s+mass\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i],
    170
  );
  const bodyFatPercent = tabular.bodyFatPercent ?? readMetric(
    normalized,
    [/body\s*fat(?:\s*%)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i, /total\s*body\s*fat\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i],
    24
  );
  const leanMass = tabular.leanMass ?? readMetric(
    normalized,
    [/lean\s*mass(?:\s*\(lb\))?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i, /fat[-\s]*free\s*mass\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i],
    125
  );
  const fatMass = tabular.fatMass ?? readMetric(
    normalized,
    [/fat\s*mass(?:\s*\(lb\))?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i, /total\s*fat\s*mass\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i],
    45
  );
  const visceralFat = readMetric(
    normalized,
    [/visceral\s*fat(?:\s*rating)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i],
    7
  );

  const scanDate = parseDateFromText(normalized);

  return { weight, bodyFatPercent, leanMass, fatMass, visceralFat, scanDate, rawText: text };
};
