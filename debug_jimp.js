try {
    const Jimp = require('jimp');
    console.log('Jimp export type:', typeof Jimp);
    console.log('Jimp keys:', Object.keys(Jimp));
    if (Jimp.default) console.log('Has default export');
    if (Jimp.read) console.log('Has read function');
} catch (e) {
    console.error('Import failed:', e);
}
