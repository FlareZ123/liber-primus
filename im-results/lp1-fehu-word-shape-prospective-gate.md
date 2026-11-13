# LP1-to-LP2 Fehu word-shape selector: original-input holdout failure

**Decision (updated 13 November 2026; Directors #648 and #753):** The first 100 original solved DIVINITY runes suggest one compact word-boundary rule for deciding when ciphertext ᚠ should be left literal without advancing the key. Freeze it before the rest of LP1, the separate FIRFUMFERENFE koan and LP2 p56 are examined. The rule fails genuine held-out plaintext and does not select p56's unique F interruption. **No new LP2 plaintext, source-selected skip rule or transferable decoder was recovered.**

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

The **authenticated encoder** uses **plaintext-F transparency**: when the plaintext rune is F, it emits F and does not advance the key; every non-F plaintext rune consumes a key symbol, even if it encrypts to a ciphertext F. In the independently solved 515-rune LP1 DIVINITY passage, the **25 ciphertext Fs** consist of **11 plaintext-F bypasses** and **14 ordinarily encrypted non-Fs**. In solved LP2 p56, the five ciphertext Fs at positions **35/47/51/56/74** represent plaintext **A/I/D/F/C**, so only position56 is a bypass. The original p56 printed F at offset56 ends the two-rune ciphertext word whose known plaintext is *OF*. However, the independently frozen LP1 word-shape rule still incorrectly bypasses p56 F at position51, the beginning of the printed four-rune ciphertext word for *DUTY*. Thus the true encryption rule depends on plaintext identity; it does not provide a ciphertext-visible selector that a solver could apply before decrypting.

**Stricter forward-encoder ambiguity gate (13 November 2026, Director #753).** The old statement that any F branch can always be freely selected was overbroad: if a proposed key-consuming branch decrypts a rune to F, it violates the plaintext-F bypass rule when encrypted forward. The new [full original-input CommonJS SFT](../sims/lp2_p56_plaintext_fehu_ambiguity_sft.cjs) enforces this constraint at *all* source runes. Of the 32 possible p56 ciphertext-F skip masks under the **actual first-84 prime-totient key steps**, **22** still produce distinct complete 85-rune GP29 plaintexts that encrypt back to *exactly the same original 85 ciphertext runes* under the **strict plaintext-F encoder**. Ten masks are incompatible because an ordinary consuming position would decode to plaintext F. The authentic mask is decimal **8** (fourth of five F positions); the other **21** forward-valid masks are wrong messages with the same authentic key and source ciphertext. Hence even a supplied exact GP29 key and rigorous forward re-encoding cannot uniquely locate the literal-F clock exception without semantic or external information. The SFT independently recovers the genuine LP1 WELCOME ciphertext/plaintext F classification and all 85 solved p56 runes. [Passing original-source GitHub Actions run 43428814455](https://github.com/FlareZ123/liber-primus/actions/runs/43428814455).

The ciphertext word location is insufficient as an original transferable rule: the withheld LP1 positive requires skips in the interior of *SUFFERING*, whereas p56 F at offset51 is an ordinarily encrypted non-F despite its source-visible initial position. A linguistic word model or separately supplied control marker could select among otherwise forward-valid paths, but neither is source-fixed by this experiment.

Retire **this** prospective two-case word-shape condition. The result does not prove all conceivable lexical or stateful rules impossible. A new transfer to unsolved LP2 pages requires an independently authored skip selector or a justified decoder that recovers state from available ciphertext without tuning on the target's language score.

**One-file CommonJS reproduction:** [sims/lp1_fehu_word_shape_prospective_sft.cjs](../sims/lp1_fehu_word_shape_prospective_sft.cjs) reads pinned original source data, asserts training and independent holdout decisions, checks known controls, verifies the two wrong-mask exact re-encryptions and prints all counts. No expensive workflow was needed.
