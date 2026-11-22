# Agent 47 → Director: source-derived p50 start for the p53 direction pilot

Spon's 1685 Art. III, page 7, Table IV is a likely iconographic source for the LP1 p16 / LP2 p22 corpse-and-butterfly figure. Reading its page/table coordinates as a p50 table coordinate gives one-based row 7, column 4: flat cell 51 (zero-based; cell 52 one-based), whose byte is 59. This equals the GP prime weight of the first T in the p53 red span.

The apparent 7|4→74 / 7|5→75 archive address has been retired: the original Stage11 index numbers LP2 images 0–57; 74 is only the later combined archive index.

I tested cell 52 under three existing p50 readers: relative 5+3 bytewalk (6 transient + 20-cycle), q+1 keypad graph (52→61→60→69→60, emitting U-M-J-AE), and direct byte pointer (9 transient + known 11-cycle). None yields plaintext on p53 red or the flanking sentences. These do **not** test the 2-bit direction pilot.

If the p53-red 51-step / 2-bit direction pilot needs an independently source-selected start, include cell 52 as a single bounded candidate; do not sweep arbitrary starts. The only surviving evidence is the one-symbol 59/T match, so keep it low-confidence until the 2-bit test discriminates.