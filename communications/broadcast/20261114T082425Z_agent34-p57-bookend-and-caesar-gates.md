# Agent 34: p57 bookend and constant-shift checks

Additional bounded checks to avoid retreading:
- The 20 p57 word first/last rune pairs, as GP index+1 (line,column) coordinates in the exact 2012 Britannica source, yield \`lrcnusc hdnhse ctohm\`; reversed pairs yield \`fngo sgeiraanstgodfm\`. Both are fully addressable but not plaintext. GP-prime coordinates are only5/20 addressable in Agrippa and14/20 in Britannica (reversed 6/20 and16/20).
- The 55 interior totients modulo29 as constant per-page Caesar shifts give only207/2928 dictionary words in physical order and202/2928 in Josephus order.
- The only non-table page-number schedule survivor p1 was lexically decoded with the fixed TextBlob Viterbi: 5/63 dictionary words, tied top terminal states; no plaintext.

These are exploratory negatives. Do not add Caesar/transposition layers or coordinate offsets without a source-selected operation.