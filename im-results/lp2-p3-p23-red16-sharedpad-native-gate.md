# Two original 16-rune red chapter headings: shared additive-pad cancellation

**Agent14, 21 November 2026.** The two original red chapter headings on physical LP2 p3 and p23 each contain exactly **16 Gematria Primus runes**. Their **printed word lengths differ**, providing a key-independent plaintext test for a plausible shared, phase-zero 16-position modular additive pad. This test provides **no unknown LP2 plaintext, key, mechanism or destination**.

## Original source and one bounded cipher hypothesis

Original p3 scan `20.jpg` prints `2|11|3` red title runes. Original p23 scan `40.jpg` prints `2|6|3|5` red title runes. The fixed canonical GP29 ciphertext titles (source `resources/liber-primus/lp2-corpus.json`) are:

- p3: `[20,11,12,8,21,5,2,16,25,11,16,14,8,16,1,22]`
- p23: `[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]`

**Conditional hypothesis:** The two visually marked headings use an identical fully consumed 16-symbol additive keystream, starting with the first title rune on each page, and preserving the printed word gaps. Each title may have independently chosen English plaintext. Either common encryption sign `C=P+K` or `C=P−K` yields an exact pad-cancellation invariant:

`P23[i]−P3[i] ≡ C23[i]−C3[i] (mod29)`.

The frozen difference is `[10,13,24,13,14,9,21,19,14,6,23,27,8,1,9,4]`. No pad secret, alphabet assignment, phase, or target word is fitted.

## Decisive untouched title-word check

Use **32,190 native-GP29-encodable words** from TextBlob word-frequency, Shakespeare, Gibran and Emerson existing project control fixtures, with explicitly defined GP digraph handling. There are **1,708** 11-rune dictionary words that could occupy p3's eleven-rune middle word.

The first two letters of the headings do not decisively contradict a shared pad: **50** length-2 p3 dictionary words can be transformed into another length-2 p23 dictionary word by the fixed original difference.

The middle title word, however, creates a key-free contradiction within that finite native vocabulary. For each of the **1,708** possible 11-rune p3 plaintext words, shift each rune by the corresponding nine first original difference values, and ask whether the first six output runes constitute an attested p23 six-rune word **and** the next three an attested three-rune word. The original produces **zero** compatible `11 ↔ 6|3` pairs. A full matching English title pair is therefore unavailable under this exact shared-pad, common-rune-clock hypothesis without at least one non-vocabulary middle word, altered word boundaries, a different pad phase or a different cipher.

A source-native positive plant picks dictionary words of exactly `2|11|3` and `2|6|3|5`, encrypts both headings with the **same 16-symbol secret GP29 pad**, and passes the identical cancellation screen: the planted eleven-rune word is recovered among the candidates. Both whole titles re-encrypt exactly. The experiment relies on an **untouched source-input condition**, so it does not interpret any fragmentary accidental words as recovered plaintext.

## Decision

The original red16 pair does **not** support direct phase-zero additive pad reuse encoding ordinary GP-native dictionary title words. This is an exact finite-language exclusion only, because any unrestricted proper noun or unusual word could escape the dictionary. The source is visually suggestive of chapter-related reuse, but **no first-party Cicada statement asserts equal title keys**. There is no justification to rescue this specific model with free key shifts, an invented skip, or a word-boundary override. An independent original key-identity instruction would be required to reopen it.

**Reproduction:** [standalone Windows Node 22 CJS](../sims/lp2_p3_p23_red16_sharedpad_native_sft.cjs), [successful manual Windows CI run 44945406474](https://github.com/FlareZ123/liber-primus/actions/runs/44945406474). The code asserts both exact original page headings and printed word lengths, the complete native control vocabulary, the 50/0 original outcome, and the planted shared-pad positive.
