const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico').default;
const jimpPkg = require('jimp');

// Robust Jimp Import
const JimpConstructor = jimpPkg.Jimp || jimpPkg;

async function convert() {
    try {
        const inputPath = path.resolve('icon_candidate.png');
        const resizedPath = path.resolve('icon_resized.png');
        // Cache Busting Filename
        const icoPath = path.resolve('hss_icon_v2.ico');
        const mainIconPath = path.resolve('icon.png');

        console.log(`Processing: ${inputPath}`);

        if (!fs.existsSync(inputPath)) {
            console.error("Input file missing!");
            return;
        }

        console.log("Reading image...");
        const image = await JimpConstructor.read(inputPath);

        console.log("Resizing to 256x256...");
        image.resize({ w: 256, h: 256 });

        console.log("Applying Rounded Corners (Direct Alpha)...");
        const r = 40; // Corner radius
        const w = 256;
        const h = 256;

        image.scan(0, 0, w, h, (x, y, idx) => {
            // Check corners
            // Top Left
            if (x < r && y < r && Math.hypot(r - x, r - y) > r) {
                image.bitmap.data[idx + 3] = 0;
            }
            // Top Right
            else if (x > w - r && y < r && Math.hypot(x - (w - r), r - y) > r) {
                image.bitmap.data[idx + 3] = 0;
            }
            // Bottom Left
            else if (x < r && y > h - r && Math.hypot(r - x, y - (h - r)) > r) {
                image.bitmap.data[idx + 3] = 0;
            }
            // Bottom Right
            else if (x > w - r && y > h - r && Math.hypot(x - (w - r), y - (h - r)) > r) {
                image.bitmap.data[idx + 3] = 0;
            }
        });

        console.log("Writing resized PNG...");
        await image.write(resizedPath);

        // Sync main icon.png
        console.log("Updating main icon.png...");
        await image.write(mainIconPath);

        console.log("Converting to ICO...");
        const buf = await pngToIco(resizedPath);
        fs.writeFileSync(icoPath, buf);
        console.log(`SUCCESS: Created ${icoPath}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

convert();
