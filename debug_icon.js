const icoModule = require('png-to-ico');
console.log('Module export type:', typeof icoModule);
console.log('Module export keys:', Object.keys(icoModule));
if (typeof icoModule === 'function') {
    console.log('It is a function');
} else {
    console.log('It is NOT a function');
    if (icoModule.default) {
        console.log('It has a default export');
    }
}
