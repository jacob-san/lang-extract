/**
 * Tool to extract all the i18n strings from the source and generate JSON files
 * for translation.
 */
import fs from 'fs';
import glob from 'glob';

import arabicLocale from '../src/client/localization/arabic-translations.json';
import englishLocale from '../src/client/localization/english-translations.json';

const SRC_GLOB = './src/client/**/*.js';
const DEST_DIR = './src/client/localization/';
const i18nMatcher = /i18n\(['`"](.*?)['`"][,)]/g;
const stringMatcher = /(['`"](.*?)['`"])[,)]/;

/**
 * Extract i18n strings from a file
 *
 * @param {string} filePath
 * @returns {Array} a list of i18n strings used in file
 */
const extractStrings = filePath => {
  const file = fs.readFileSync(filePath, 'utf8');
  const matches = file.match(i18nMatcher) || [];
  const strings = matches
    .map(s => s.match(stringMatcher)[2])
    .filter((value, index, arr) => arr.indexOf(value) === index);
  return strings;
};

const extractedStrings = glob
  .sync(SRC_GLOB)
  .map(extractStrings)
  .filter(s => s.length > 0)
  .reduce((acc, val) => acc.concat(val), [])
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

const arabicTranslations = {};
const englishTranslations = {};

let arabicTranslated = 0;
let englishTranslated = 0;

extractedStrings.forEach(s => {
  // Merge existing Arabic translations
  arabicTranslations[s] = arabicLocale[s] || '';
  if (arabicTranslations[s] !== '') {
    arabicTranslated += 1;
  }
  // Merge existing English translations
  englishTranslations[s] = englishLocale[s] || '';
  if (englishTranslations[s] !== '') {
    englishTranslated += 1;
  }
});

// Save the Arabic files
fs.writeFileSync(
  `${DEST_DIR}/arabic-translations.json`,
  JSON.stringify(arabicTranslations, null, 2),
);
// Save the English files
fs.writeFileSync(
  `${DEST_DIR}/english-translations.json`,
  JSON.stringify(englishTranslations, null, 2),
);

const joinedTranslations = [];
joinedTranslations.push(['Key', 'English', 'Arabic'].join('\t'));
Object.keys(englishTranslations).forEach(k => {
  joinedTranslations.push(
    [k, englishTranslations[k], arabicTranslations[k]].join('\t'),
  );
});
fs.writeFileSync(
  `${DEST_DIR}/joined-translations.tsv`,
  joinedTranslations.join('\n'),
);

console.info(`
Arabic translation ${Math.round(
  (arabicTranslated * 100) / extractedStrings.length,
)}% done.
English translation ${Math.round(
  (englishTranslated * 100) / extractedStrings.length,
)}% done.
`);
