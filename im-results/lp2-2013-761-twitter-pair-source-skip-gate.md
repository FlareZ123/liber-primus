# Original 2013 761.MP3/Twitter/XOR-Gematria sources as skip-aware GP29 running keys

**16 November 2026, Agent30. Supporting original-input finite negative.** The source-constrained screen has completed and found **no unknown LP2 plaintext, key or destination**. Source-original manual CI: [successful run 43795836572](https://github.com/FlareZ123/liber-primus/actions/runs/43795836572) (main commit `f9ca338d378f7c181b5983a75dbd1ae35a3d13a3`). Reproducer: [`sims/lp2_2013_761_twitter_pair_skip_sft.py`](../sims/lp2_2013_761_twitter_pair_skip_sft.py), using the previously committed [manual-only workflow](../.github/workflows/lp2-2013-761-twitter-pair-skip.yml).

## Historical cause and necessary missing clue

The original 2013 Twitter puzzle reconstructs a 64,167-byte file `twitter.bin` from 988 addressed records. XORing it with the **initial**, ID3-inclusive 64,167 bytes of the original 4,010,732-byte `761.MP3` produces `gematria.jpg`, a source-era explanation of GP29 runes. This is an **authentic period operation** and three concrete source streams with an independently fixed byte origin. The missing link is an instruction transferring any of these bytes to 2014 LP2 as a running key. This experiment tests that bounded transfer, rather than a search across arbitrarily aligned historical files.

Original bytes were obtained from the pinned [2013 MP3 archive](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) and [2013 Twitter reconstruction](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter), with byte-length and SHA256 assertions before any decoding:

| File | Original bytes | SHA256 |
| --- | ---: | --- |
| `761.MP3` | 4,010,732 | `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460` |
| `twitter.bin` | 64,167 | `defa117644978755c9d6e5cf9ed3dc4179dc63e5b6da877f1212ca2d24ce3776` |
| `gematria.jpg` | 64,167 | `d4736b09cfac03097efcb5c2f48ffc71f46700835fc09f7549283956580eb35d` |

The full byte relation `gematria.jpg == twitter.bin XOR 761.MP3[:64167]` passed.

## Frozen original-cipher experiment

Import the original Campaign XVIII GP29 key-skip beam at upstream pinned commit `Dukotah/cicada3301@f63501d8f2d835b80c30230eb89a1110fb9197d2`. Its published mechanism enciphers a rune by additive GP29 key symbols, optionally skips key symbols that would emit a repeated ciphertext rune, and decodes with a skip-aware English-scored beam. Use only **source byte offset zero**, three documented byte→GP29 projections (`mod29`, `scaled29`, `bits5-reject`), each additive sign, and both direct and Atbash carrier readings. Decode the **first 90 original ciphertext runes** of p0 and of the joint p54+p55 endpoint, with separate reset at each frozen source origin. This is `3×3×2×2×2=72` original screens. Stage-one score threshold is the previously set **−6.0**, with no post-screen choice of key offset, page phase, alternate spelling, or secondary cipher. A stage-one survivor would trigger an independent full-page test.

An earlier run [43774440543](https://github.com/FlareZ123/liber-primus/actions/runs/43774440543) failed a key-skip re-encipherment assertion without publishing a completed screen. The present successful run uses exact dynamic programming over **every legal 0–3-skip path** at each output rune, rather than a greedy single-path check, and records rejection details if a proposed plaintext cannot re-encipher the original input. The upstream positive/negative key-skip gate succeeded, including a native 212-rune source-text positive and an unrelated Gibran wrong-key control. Its own missing upstream Mabinogion control was replaced *only within that gate* by a repository-pinned independent Gibran text, not as an LP2 key candidate.

## Original outcome and planted controls

- **72/72** source-locked original GP29 screens completed.
- **0/72** surpassed the preset stage-one `score_norm > −6.0` requirement; hence **0** original full-page confirmation attempts and **0** recovered unknown plaintext passages.
- The strongest candidate was `gematria.jpg/mod29/p54+p55/sign−/Atbash`, with score **−6.8309565787435815** and unreadable transliteration starting `IAESCEJXBHUCXWYNGRSAERIAWEASGXPSAEH`. The second scored **−6.833654402293992**, also unreadable.
- Source-native, original-length-profile **240-rune Shakespeare plants**, encoded with the same mod29 sources and q=0.83 repeat suppression, recovered **240/240** for `761.MP3` (5 skips), **240/240** for `twitter.bin` (5 skips), and **229/240** for `gematria.jpg` (6 skips). The third plant is a **calibration imperfection** of the actual beam and should not be reported as an exact positive. In contrast, the global upstream 212-rune source-positive gate did recover its genuine key text exactly and rejected a wrong text.

The best candidate lies **0.831** score units below the screen threshold. A failed stage-one English score alone does not mathematically rule out every unusual original plaintext, especially given that one source's positive 240-rune plant recovered only 95.4%. The result excludes a language-like screen hit **under this frozen finite transfer model**, not the source bytes as material in some other, independently instructed cipher.

## Decision

Retire **zero-byte-offset, direct GP29 additive key-skip screening** of these three original 2013 streams against these two LP2 segments. Do not fit source offsets, tweak the beam after the no-hit, or escalate the top nonlinguistic candidate without a new primary instruction. An authentic source-specified key derivation, a different stateful cipher, or previously inaccessible original pre-encryption material remain independent routes.

The original source relationship and all 72 finite outcomes are reproducible from the manual CI and CJS/Python source inventory; no change to the authoritative `results/README.md` plaintext status is warranted.
