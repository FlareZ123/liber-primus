# Word-framed radix28→radix29 inverse on the original unsolved LP2

**Agent 38, 12 November 2026. Bounded original-source negative. No recovered LP2 plaintext/key.**

## Intended human cue and complete operation

The signed 2016 message points to *words as a map*; the unsolved text's 86 same-rune transitions suggest a predecessor-excluding 28-way output alphabet; Cicada 2013 publicly used BASE29 integer conversion. These three observations motivate a different operation from previously tested fixed 5n→3n byte packing and one-rank-to-one-rune inversion: interpret **each printed ciphertext word as one arbitrary-precision base28 integer**, then write it as a minimal native GP29 plaintext word. Preserve printed word boundaries. Two canonical predecessor-excluding digit orders and two complete framing contracts:

- Sorted: `digit = current − [current > previous]`; cyclic: `digit = ((current−previous) mod29)−1`.
- Either every glyph carries a rank, continuing from the previous original word (initial preceding GP F/index0), or the first rune of each word is a transparent seed.
- If current equals previous at a rank-carrying position, that source word is **unrepresentable** by the literal codec. The original material supplies no documented escape/repair rule.

The original `resources/lp2-transcription.txt` is truncated after exactly 12,956 unknown runes (pp0–55, p50 rune-free). Line/page wraps `/`, `%` and newlines are discarded without splitting words. This yields exactly **2,896 authentic ciphertext words**. Rune order from `resources/liber-primus/lp2-corpus.json`. For an independent lexical diagnostic, `resources/control/english_wordfreq_textblob.txt` yields **29,059 distinct GP-normalized** dictionary entries (QU→CW, K→C, V→U, Z→S, ING→NG).

## Decisive original results

| Successor order | First rune | Undecodable words | Decoded GP runes | GP IoC | Dictionary hits, all lengths | Dictionary hits ≥4 GP runes |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Sorted | carries digit | **85** | 12,355 | **0.034699893** | 213 | **0** |
| Cyclic | carries digit | **85** | 12,367 | **0.034665395** | 202 | **3** |
| Sorted | transparent seed | **62** | 9,733 | **0.034726351** | 699 | **1** |
| Cyclic | transparent seed | **62** | 9,738 | **0.034711326** | 696 | **1** |

The seed cases have many extra one/two-symbol reconstructed words, which produce incidental dictionary matches. Almost **no** reconstructed word of at least four GP tokens is in the fixed dictionary. All outputs have essentially uniform 29-way collisions (random reference 1/29≈0.03448). No literal natural-language plaintext emerges, even after discarding 62–85 incompatible original words.

The [single-file CommonJS native-GP decoder/encoder control](../sims/lp2_wordframed_radix28_to29_sft.cjs) uses source-exact word segmentation and four full original inverses, with GP-encoded Shakespeare input planted through matching inverse codes. Each planted original word round-trips exactly under its corresponding inverse. It asserts source counts, results and dictionary identity.

**Decision:** retire the four specific direct, source-motivated word-number transport models; do not rescue them with arbitrary alphabet permutations or guessed escapes. Other source-selected variable-state/non-GP layers remain open. This supporting negative does not change `results/README.md`.