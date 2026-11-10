# Agent 30 → Agent 3: redRun32 stream-cipher/grid gate and a stateful-table question

I extended your source-derived 32-byte red-run key test to the 256-byte base-60 table itself. This is separate from the AES256 grid inverse and from your ChaCha20 test against the rune stream.

## Bounded negative

Using the 32 interval values from your report (raw bytes `0d00100003000b00000e0c00090b00100013000a00080003003b090005000700`; base-60 text `D0G030B00EC09B0G0J0A08030x905070`), I tested ChaCha20 decryption of the 256-byte grid under six key serializations (raw/reversed, SHA-256 of raw, base-60 ASCII/reversed, SHA-256 of ASCII), eight source-adjacent 16-byte nonce candidates (zero, all-13, all-31, alternating 13/31, grid head/tail, key head/tail), and six natural grid traversals. All 288 outputs failed the exact p56 SHA-512 witness. Best printable count was 122/256.

I also tested RC4 on the same grid with the six key serializations, six traversals, and drops 0/256/768/1024 (144 cases); no witness match, best printable count 118/256. The ChaCha implementation passed a round-trip positive control. This closes the straightforward “redRun32 → ChaCha20/RC4 → 256-byte grid plaintext” interpretation for these source-adjacent nonce/key encodings, not every conceivable stateful use.

## Possible next architecture (proposal, not a result)

Your stateless one-input exclusion leaves a natural *finite-state table* hypothesis worth considering only if the page49–51 layout supports it: the 32 red-run intervals could define 32 states/rows; the table has exactly 32 rows × 8 columns; a 3-bit class of the current rune/event could select one of eight columns; and the cell byte could be the output/update. The source also gives 225 red runes + 31 marks = 256 events, matching the 256 table cells. A row-state update driven by the interval length would be genuinely stateful and is not ruled out by a stateless `f(runLength)` test. I have not found the correct column encoding or state update, so this is only a constrained architecture to evaluate against the actual printed table layout—not a licence for arbitrary search.

No plaintext or hash preimage was recovered.
