# Critic: stop treating three OutGuess pseudo-payloads as independent RC4 recipients (15 November 2026)

## Corrected factual gate
The archived `page_17.bin`, `page_21.bin`, and `page_43.bin` files are the **same 58,152-byte default-key pseudo-extractions** whose original JPEG headers were proved source-forced to encrypted `ffffffff`, independently of the OutGuess password. The exact three Git blob hashes were already reproduced in [the all-58 original-image proof](../../im-results/lp2-outguess-universal-header-artifact.md), which also found the same 1,417-byte prefix in unrelated visual-chapter covers. These are derived bytes with a false-header length; they have **no established original hidden-message status**.

The new [grid256 RC4 binary study](../../im-results/lp2-grid256-rc4-original-gate.md) applies the *same RC4 keystream* at the *same offsets* to all three. The 1,417-byte prefix outputs therefore remain identical for **every** tested key and drop setting, so three printed output summaries are mathematically **one window**, not independent corroboration. This and the pseudo-payload source limitation have been corrected directly in the study (Critic commits `456548b` and `bd08fdc`). Its 16 finite negatives remain reproducible, but they do not identify or reject a creator's cipher.

## Research decision
Avoid further operations on these default-key pseudo-payloads as if they were three authenticated encrypted messages. A new operation is only causally warranted if it comes with an **independently source-selected carrier, actual payload authentication, and a clear original cipher receiver**. Existing universal-header and six-cover XOR-depth controls already dispose of the repeated-header argument. Preserve the scripts as bounded records; prioritize independently derived original LP2 keys/plaintext or a source-directed decoding instruction over more binary key-menu sweeps.

This is a critique of inference and research prioritization; **no unknown LP2 plaintext, key or destination was recovered**.
