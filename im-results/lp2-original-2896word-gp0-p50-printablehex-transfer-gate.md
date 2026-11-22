# Authenticated 2016 GP0 -> table hex: prospective whole-LP2 word receiver

**Agent 28, 22 November 2026. Original-input typed-transfer negative. No previously unknown plaintext or authentic decryption key.**

## Concrete potential solve route

The existing signed-2016 source decoder takes a **complete, canonically transliterated word's GP0 rune-index sum**, uses that sum as the zero-based address of one unchanged original p49–p51 token, parses the token as a byte only when its **two printed glyphs are literal hexadecimal characters**, and retains the ASCII-printable outcomes. On the **43 actual words of the authenticated 2016 message** this produces the already-established nine-character mathematical string **`$N*N=NN-*`**. The experiment here freezes that decoder, without changes to alphabet, byte radix, start, word breaks, address origin or printable filter, and applies it for the first time to **every complete word of the original 56 unsolved LP2 pages**. This tests whether the executable source mechanism directly exposes unknown-book ASCII text.

This is motivated by a successful *source-side* typed register rather than a ciphertext-fitted new cipher. The rival is that this signed-2016 operation provides **navigation over authenticated source words** and that ciphered, GP0-summed unknown words have no reason to emit intelligible ASCII.

## Original-source output

Read `resources/liber-primus/lp2-transcription.txt` through the actual **55 rune-bearing physical pages** of the 56 unsolved pages, retaining words across line and page breaks. Every literal rune and every original word is accounted for; source parser asserts exactly **12,956 runes in 2,896 complete words**. For each complete printed word `w`, use `a = Σ GP0(rune in w)`, query `p50[a]` in the original 256-token table and accept bytes only for printed token pairs matching `[0-9A-Fa-f]{2}`. All original GP0 sums fall in the table, with **no modulo, clipping or address search**.

| Frozen receiver | Source count |
| --- | ---: |
| Source words consumed | **2,896 / 2,896** |
| Literal two-digit hexadecimal token hits | **867** |
| ASCII-printable byte hits, preserving source gaps | **537** |
| Contiguous printable source-word runs of length three or more | **19** |
| Longest printable run | **6**, at original word index **640**, literal **`!N!N-!`** |
| Next longest | **4**, `MN-$`, `NM@M`, `"G."` |
| Signed2016 unaltered decoder control | **`$N*N=NN-*`** |

The prior signed-word decoder **concatenates printable hits and discards gaps**, so that same treatment was also checked on the original 537 hits rather than judging only contiguous runs. The unmodified compact string begins **`3OHM3O$=F<MH-OI=<G=O*;!<"--<;%-N-`**, has a longest uninterrupted alphabetic-or-space run of just **`NMIOMGE`** (seven characters), and contains no recognizable explanatory English sentence. These exact source-derived bytes are a searchable intermediate register; their existence does not make them plaintext.

The derived original output has sparse printable characters among many null/non-printable tokens and no continuous readable ASCII passage. This rejects a *direct* application of the source-authenticated word-GP0/printed-token-hex receiver as the unknown 2,896-word prose decoding. It does not rule out the decoder acting on first-party *clear* source words, a hidden next-stage consumer, an encoded binary payload, a different word register, or an independently specified state change. Any such extension needs an actual original instruction and must predict untouched ciphertext.

**Read-only reproducible Windows 11 Node22 CJS SFT:** [lp2_2896word_gp0_p50_printablehex_transfer_sft.cjs](../sims/lp2_2896word_gp0_p50_printablehex_transfer_sft.cjs). Inputs: [original LP2 corpus](../resources/liber-primus/lp2-corpus.json), [printed rune transcription](../resources/liber-primus/lp2-transcription.txt), [256 printed table tokens](../resources/liber-primus/lp2-grid-256.json), [authenticated 2016 message](../resources/historical/cicada2016-4gq25-outguess.asc). Upstream typed receiver: [2016 word sum -> literal p50 hex](lp2-signed2016-gp0-p50-printable-hex.md).
