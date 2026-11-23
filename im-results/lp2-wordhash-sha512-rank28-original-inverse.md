# Source-native SHA-512/256 constrained-word index inverse on original LP2

**Agent6, 23 November 2026. Classification: bounded negative, no unknown plaintext.**

## Decisive proposed inverse

The original LP2 p0–55 text contains 2,896 complete printed words and 12,956 GP29 runes. Within printed words, only 63 adjacent rune pairs are identical. The solved p56 original provides an authenticated SHA-512 checksum example, and historical Cicada stages employ named hash algorithms. Together these features motivate a specific finite dictionary-invertible encoding: hash one plaintext word, interpret its digest as a big-endian nonnegative integer, emit the first source rune modulo29, and extract each later rune modulo28, skipping the immediately preceding 29-symbol value. Each output word has a fully predetermined rune length under the documented solved-LP1 orthography. If this were the unknown-page encoder, its source word could be recovered by exact digest lookup against a historical English lexicon.

The source itself **does not** command individual-word hashing, announce the rank28 unranking rule, specify a digest-to-numeral endian convention, or guarantee preservation of plaintext words. The hypothesis is an exploratory route to *actual plaintext recovery*, with zero fitted key or plaintext guesses. The published test is frozen to two historically available digest functions, SHA-512 and SHA-256, four unambiguous word serializers (lowercase Latin, uppercase Latin, native GP rune UTF-8, and native GP index bytes), and two reading directions. All sixteen methods apply literally to the unmodified original material.

For digest integer `h` and GP word length `n`:

```text
c[0] = h mod29; h = floor(h/29)
for i=1..n-1:
  t = h mod28; h = floor(h/28)
  c[i] = t + 1 if t >= c[i-1], else t
```

The encoder forbids every adjacent equal pair by construction, so **63 original within-word doublets** already require an additional, as-yet-unprovided escape rule if this were a complete manuscript-wide mechanism. The narrower experiment asks whether any of the other long original words directly identify authentic English dictionary words under this particular recoverable hash construction.

## Original-input result

The 29,060-form pinned TextBlob lexicon supplies **22,340** entries of at least six *native GP runes* whose lengths occur in the unknown book. Source and decoded words use the solved-LP1 conventions `ING -> NG`, `IO -> IA`, `QU -> CW`, `V -> U`, `K/Q -> C` and `Z -> S`.

**All sixteen original-input exact-match scans produced zero recovered source words with at least six GP runes.** No provisional English hit, plaintext sentence, actual key, or generator was found. For a uniform independent constrained-code null the expected accidental matches are only **0.00246843 per method** and **0.03949491 across all sixteen methods**. Under the hypothesized *correct* word-hash encoder, lexicon-covered authentic words would instead be deterministic full matches. The 63 within-word doublets and the absence of long-word matches disfavor the exact family for normal dictionary-covered English with intact printed words.

The digest algorithms and source serializers are not a claimed exhaustive family of word hashes. Unknown salts, keyed digests, hash-to-rune conventions, segmentation changes or nonlexical plaintext fall outside the test. Do not manufacture new variants without independent source information selecting them.

## Executable original gate

The dependency-free CommonJS reproducer [`sims/lp2_sha512_constrained_wordhash_native_sft.cjs`](../sims/lp2_sha512_constrained_wordhash_native_sft.cjs) reads canonical `lp2-corpus.json`, the carried-word parser `sims/lp2_word_pages.cjs`, and `resources/control/english_wordfreq_textblob.txt`. It asserts the exact 2,896 words, 12,956 runes, 32 cross-page carried words, and 63 internal doublets. It explicitly prints each method's hits and a complete family summary. Four synthetic native-English source words are deterministically encoded, reconstructed under the same hash, and discriminated from SHA-256 as a wrong-algorithm control.

**Windows Node22 original-source CI PASS:** [run 45129279390](https://github.com/FlareZ123/liber-primus/actions/runs/45129279390), 23 November 2026; [workflow](../.github/workflows/agent6-wordhash-constrained-original.yml).

**Decision:** Retire unkeyed SHA-512/SHA-256 whole-digest rank28 individual-word lookup in these sixteen specified source-native serializations. Retain the missing source-selected **variable-length or higher-order reversible cipher and its authentic key** as the main research dependency. No change to `results/README.md` or the established LP2 solve status is warranted.
