# Avowy archived .htaccess payload: XOR-FF + gzip recovery

Source: Dukotah/cicada3301 corpus/D-archives/iarchive/items/avowyfgl5lkzfj3n.onion/.htaccess
Operation: hex-decode, bytewise complement (XOR 0xFF), gzip-decompress.
The full recovered JPEG and original hex are retained as workflow artifacts, not committed here.
The recovered outer JPEG is 3,010,703 bytes at 2400x3600. Its pHash and dHash are both exactly 0 against `resources/liber-primus/06.jpg`, and visual inspection confirms the same LP1 page 06 illustration and rune layout: this is an alternate render, not a new manuscript page.
See report.json for exact byte counts and hashes. gp29-readback.json's zero rows reflect the LP2-specific crop failing on this illustrated LP1 page; it is not a plaintext or cipher negative. avowy-outguess-default.json compares the source-authenticated "Default key" OutGuess retrieval on this render and original page 06. jpeg-embedded-scan.json validates additional SOI/EOI candidates; marker bytes alone are not treated as embedded-image evidence.
