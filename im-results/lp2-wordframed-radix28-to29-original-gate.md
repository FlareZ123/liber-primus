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

## Fixed-secret-alphabet exclusion without key search

The direct GP dictionary check alone leaves the possibility that the reconstructed base29 digits encode a *secretly permuted* 29-letter GP alphabet. Complete-word identity is invariant under **every fixed 29! permutation** of these symbols. Count only reconstructed words of **four or more** actual GP runes, ignoring the 62/85 undecodable input words:

| Model | Reconstructed long-word tokens | Distinct long-word types | Repeated long-word occurrences | Native same-length Shakespeare duplicates (20 fixed offsets) |
| --- | ---: | ---: | ---: | ---: |
| Sorted, all positions | **1,560** | **1,560** | **0** | **694–765** |
| Cyclic, all positions | **1,558** | **1,558** | **0** | **692–762** |
| Sorted, first is seed | **1,070** | **1,070** | **0** | **423–492** |
| Cyclic, first is seed | **1,083** | **1,083** | **0** | **435–502** |

The independent native control uses authentic GP-normalized words from the fixed 300k Shakespeare source. At each reconstructed long-word slot it chooses the next actual Shakespeare word of **exactly that slot's GP rune length**, from per-length source pools, with deterministic starting offsets `0,131,...,2489`. It therefore compares repeated-type behavior under exactly the inferred long-word length distribution. All **20/20** reference replicas have hundreds of repeated long words; the original inverses have **zero**. This is a source-dependent control, not a corpus-universal p-value.

**Stronger decision:** fixed alphabet relabelling cannot make the recovered words ordinary English prose because it cannot create a repeated long-word type. This argument is *key-independent* for this transport, even with an unknown 29-symbol substitution key. It does not constrain a position-dependent pad, a per-word or per-page changing secret alphabet, a hidden escaping channel, or a further nonletter codec.

The seed cases have many extra one/two-symbol reconstructed words, which produce incidental dictionary matches. Almost **no** reconstructed word of at least four GP tokens is in the fixed dictionary. All outputs have essentially uniform 29-way collisions (random reference 1/29≈0.03448). No literal natural-language plaintext emerges, even after discarding 62–85 incompatible original words.

The [single-file CommonJS native-GP decoder/encoder control](../sims/lp2_wordframed_radix28_to29_sft.cjs) uses source-exact word segmentation and four full original inverses, with GP-encoded Shakespeare input planted through matching inverse codes. Each planted original word round-trips exactly under its corresponding inverse. It asserts source counts, results and dictionary identity.

**Decision:** retire the four literal word-number transport models, including all their globally fixed 29-symbol alphabet relabellings, before considering any guessed escapes or further secret states. Other source-selected variable-state/non-GP layers remain open. This supporting negative does not change `results/README.md`.