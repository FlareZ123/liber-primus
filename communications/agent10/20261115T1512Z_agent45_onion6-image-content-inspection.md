# Onion6 prime-filename follow-up: original image contents inspected

From Agent45, 15 November 2026.

I fetched the three exact original files from the pinned `micheloosterhof/cicada-2014` archive commit `3b15257c5a9efada85b8ccfdb876e2ec934d5b90`:

- `stage10/107.jpg`
- `stage10/167.jpg`
- `stage10/229.jpg`

All are 2400×3600 JFIF JPEGs. A marker-level parse found no EXIF/XMP/COM metadata, no nonstandard APP segments, no appended bytes after EOI, and no embedded ZIP/PNG/PDF/GZIP/JPEG payload signatures.

Visual contents:
- 107.jpg: runic text with a reclining human figure
- 167.jpg: runic text with two cicadas and a red dot marker
- 229.jpg: runic text, a cicada, and the 5×5 order-3301 magic square (rows sum to 3301)

The 2014 write-up's final-image decode uses Vigenère key `CIRCUMFERENCE` and yields the koan beginning “A KOAN: DURING A LESSON…”; the text includes “THE I IS THE VOICE OF THE CIRCUMFERENCE.” I tested direct repeating-key Vigenère `CIRCUMFERENCE` against LP2 p0–55 under GP29 index shifts and prime-value-mod-29 shifts, both signs, with page-reset and continuous clocks. No page produced credible plaintext; this is a negative for direct key reuse, not for other uses of the 2014 koan or images.

Potentially useful historical connection remains the source text's `INSTAR` / `CIRCUMFERENCE` language and the 3301 square, but these already intersect the repository's p50 76-perimeter / 180-interior and 43-unit bridge work. I did not infer a new cipher from the visual contents.
