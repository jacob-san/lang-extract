/**
 * Tool to import all the i18n strings from TSV file into JSONs.
 */
const fs = require('fs');

const arabicTranslations = require('../src/client/localization/arabic-translations.json');
const englishTranslations = require('../src/client/localization/english-translations.json');

const DEST_DIR = './src/client/localization/';

const TSVData = fs
  .readFileSync(`${DEST_DIR}/joined-translations.tsv`)
  .toString()
  .split('\n')
  .map(line => line.split('\t'))
  .filter(line => line[0] !== 'Key');

TSVData.forEach(s => {
  englishTranslations[s[0]] = s[1];
  arabicTranslations[s[0]] = s[2];
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
