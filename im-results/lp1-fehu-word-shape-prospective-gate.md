# LP1-to-LP2 Fehu word-shape selector: original-input holdout failure

**Decision (12 November 2026; Director #648):** The first 100 original solved DIVINITY runes suggest one compact word-boundary rule for deciding when ciphertext ᚠ should be left literal without advancing the key. Freeze it before the rest of LP1, the separate FIRFUMFERENFE koan and LP2 p56 are examined. The rule fails genuine held-out plaintext and does not select p56's unique F interruption. **No new LP2 plaintext, source-selected skip rule or transferable decoder was recovered.**

## Independent genuine controls

- Original LP1 pp3–4 ciphertext and 515-rune known GP plaintext: `resources/transcriptions/lp1_wulfic_canonical.txt`, `resources/liber-primus/lp1-plaintext-reference.txt`. Authenticated eight-rune Vigenère key: GP indices `[23,10,1,10,9,10,16,26]`; 11 independently solved literal-F positions `[48,74,84,132,159,160,250,421,443,465,514]`.
- Original LP1 second koan: a separate 13-rune key and established F skip positions `[49,58]` within its first 110 original runes.
- LP2 physical p56 (original 73.jpg), canonical 85 GP runes and independently solved prime-totient plaintext; the five ciphertext F rune offsets `[35,47,51,56,74]` have one true skip at offset 56.

The first **100** solved LP1 DIVINITY runes contain six ciphertext Fs at `[5,14,47,48,74,84]`. The only true interruptions there are `[48,74,84]`, corresponding to the visible plaintext words *OF*, *FOR*, *FIND*. Their original printed ciphertext word shapes motivate the single frozen, intentionally simple rule:

```text
Skip (emit literal F, do not advance key) iff ciphertext rune is F and
  (it ends a two-rune printed word), or
  (it begins a three- or four-rune printed word).
Otherwise consume the current normal cipher key symbol.
```

The rule uses the original word separators, rune identities and positions. A printed line break does not introduce a word boundary. It requires no unknown plaintext, and gives **6/6** correct F decisions in the LP1 inference segment. This is a candidate test rather than a claim of creator intent.

## Prospective falsification

| Data withheld from selector construction | F decisions correct | Original plaintext symbols correct | First counterexample |
| --- | ---: | ---: | --- |
| LP1 DIVINITY runes 100–514 | **13/19** | **88/415** after phase drift (188/515 overall) | Original offset **159**, first of two literal interior Fs in *SUFFERING* |
| Different-key LP1 second koan, first 110 runes | **2/3** | Not used as a source of the rule | F offset **58**, interior of a 13-rune word |
| Solved LP2 p56, 85 runes | **4/5** | **52/85** | Original offset **51**, first rune of a four-rune word |

On p56 the incorrectly skipped F at local offset 51 creates the first plaintext error and shifts all later prime-key positions. The authentic fourth F at 56 is correctly skipped by the candidate, but the rule also skips the third F at 51. Original p56 Fs 35, 47 and 74 correctly consume. The authentic full 85/85 decryption remains attainable only with the established skip set `{56}`.

The original-cipher positive controls using the historical masks recover all 515 LP1 DIVINITY symbols and all 85 LP2 p56 symbols. The candidate's **incorrect** output still re-encodes the entire original 515- and 85-rune ciphertexts exactly, because Fehu branches are each formally invertible when the branch mask is supplied. Consequently, re-encryption is an implementation check and cannot authenticate a skip decision.

## Decision and architecture

Even with a fixed key schedule, every ciphertext F permits two formally valid plaintext/state continuations under the historical decoder: literal F with no key advance, or ordinary subtraction with advancement. If GP29 plaintext is unrestricted, both branches remain reversible over all subsequent original ciphertext. Word location alone cannot resolve this distinction in the genuine source: the withheld LP1 example requires skips in the interior of *SUFFERING* while the original p56 four-rune word at offset 51 must consume its initial F. A linguistic word model or an external control marker could provide additional information, but none is source-fixed by this test.

Retire **this** prospective two-case word-shape condition. The result does not prove all conceivable lexical or stateful rules impossible. A new transfer to unsolved LP2 pages requires an independently authored skip selector or a justified decoder that recovers state from available ciphertext without tuning on the target's language score.

**One-file CommonJS reproduction:** [sims/lp1_fehu_word_shape_prospective_sft.cjs](../sims/lp1_fehu_word_shape_prospective_sft.cjs) reads pinned original source data, asserts training and independent holdout decisions, checks known controls, verifies the two wrong-mask exact re-encryptions and prints all counts. No expensive workflow was needed.
