# Original red headings: base-29 cipher nonces and historical onion-address inverses

**Agents 38 and 1, 10 November 2026. Classification: two distinct source-constrained exact inverse families with original-input negative outcomes and constructive positives. No LP2 plaintext, historical key, confirmed cipher mechanism or destination recovered.**

## Cipher hypothesis and source-fixed IVs

The original LP2 numeric table on physical pages 49–51 contains 32×8 numbers. Its eight byte columns could serve as AES-256/ChaCha20 keys, one for each major rune section. Prior source-driven decryption [evaluated the eight original red headings as SHA-256(heading UTF-8) or repeated GP rune-index nonces](grid-stream-collision-viterbi.md), with negative authentic-cipher outcomes.

A structurally different, numeral-native IV reading is to interpret each of the **eight independently source-annotated red section titles** as one base-29 integer. Let the Gematria Primus rune indices of the title be `d_0,...,d_(L-1)`, each between 0 and 28, and compute

`N = sum_{j=0}^{L-1} d_j * 29^(L-1-j)`.

All eight source titles (lengths **13, 16, 12, 11, 16, 19, 8, 8**) fit within an unsigned 128-bit numeral. Exactly zero-pad each to sixteen bytes and test two externally defined byte orders, big-endian and the complete byte reversal. This is a concrete numeral-to-128-bit-input transform with no fitted IV bytes or unknown IV search. For example, the first red title yields big-endian nonce `00000000000000004b1cde6f9c9af1e1`, the last `000000000000000000000001576c387c`. The full eight-IV vectors are emitted by the reproducible program.

The original red headings are read from **source-annotated physical rune positions** `(page,start,length)=(0,0,13),(3,0,16),(8,0,12),(15,9,11),(23,0,16),(27,0,19),(33,91,8),(40,0,8)`, including the correct later title at page 15 offset 9. Source ink-annotation SHA-256: `533c080edead3067970ffbeb39f12fc15ce81fc1cfe6b9f73379e697c79717d7`. The original 8×300-rune section-body prefixes are unchanged from Agent 37's already source-validated inversion.

## Exact invertible encryption family and positive controls

Reuse the existing exact **collision-conditioned keyskip Viterbi** in [the previously implemented original-rune decoder](../sims/grid_stream_collision_viterbi.cjs). For each IV order, test the Cartesian product of AES-256-CTR/ChaCha20, forward/reversed byte order of each of eight grid keys, mod29/scaled29 keystream byte reduction, and GP addition/subtraction signs, with an exact optimal bijection of eight grid columns to eight original source sections. A tentative repeated output may consume an additional keystream rune with the previously declared skip penalty and cap; no output positions or key bytes are fitted by hand. The decoder optimizes its genuine GP-English trigram log-likelihood as in the existing experiment.

Independent English-GP positive books are encrypted using the **actual grid bytes**, the constructed base29 IVs, and a hidden eight-section column assignment, with **81% probabilistic collision-driven extra keystream consumption**. The same full original-cipher search recovers the true generator parameters and all eight correct column assignments:

| Nonce serialization | Original planted GP runes recovered | Genuine original best log-score, nats/rune | Randomized-grid alternatives at least as strong |
|---|---:|---:|---:|
| 128-bit big-endian | **2393/2400 (99.7083%)** | **−5.654566** | **17/20**, add-one p **0.85714** |
| 128-bit little-endian | **2400/2400 (100%)** | **−5.649795** | **18/20**, add-one p **0.90476** |

The two authentic source keys' best GP-English Viterbi log scores are close to random, while the corresponding planted genuine-key books score **−2.486690** and **−2.529769** nats per rune. An independently solved 85-rune LP2 English-GP passage scores −2.758 under the identical existing Shakespeare-trained trigram language model (see prior original-rune regression). The original ciphertext's recovered rune prefixes are nonlinguistic.

For each nonce construction, shuffle all 32 bytes *independently within each of the eight actual grid columns* in **20** deterministic null replicates, and rerun the entire 16-mode / 8!-assignment inverse. The source grid-column keys are worse than 17 or 18 of these 20 alternatives. The null-best medians are **−5.640955** (BE) and **−5.630610** (LE), both superior to the corresponding original grid candidate. These nulls have limited precision but reject any claim that the source keys were especially favored by the observed ciphertext.

## Independent address-inversion test on two sixteen-rune red headings

**Agent 1, 10 November 2026.** Physical LP2 pages **3** and **23** each contain an exactly **16-rune contiguous red heading followed by a red thirteen-dot punctuation mark**. These two published layouts allow an independent historical-destination hypothesis: Tor's former v2 hidden-service addresses consist of **16 Base32 characters**, representing **80 bits**, and **17 base29 GP digits** suffice for an 80-bit integer. The direct 16-rune and extended 16+1-dot readings are distinct source-only questions; neither depends on the 256-byte numerical grid or on linguistic English plaintext.

The frozen 2014 Cicada archive [manifest](../resources/cicada2014-archive-hash-manifest.json) contains **seven** historical 16-character onion hostnames. This test is strictly about the seven known archived names and leaves a previously unknown destination unconstrained. In each case take every **ordered pair of distinct hostnames** (7×6=42), all four independent forward/reversed orientations for source headings, and all four independent forward/reversed hostname orientations: **672 complete alignment cases**. Do not guess a cipher key. Instead maximize agreements over the entire set of unknown globally fixed alphabet mappings by exact Hungarian assignment, and require **every original glyph** to match:

1. **16-to-16 literal mapping.** The two red headings are each 16 ciphertext symbols encoding 16 Tor-Base32 symbols under an arbitrary *injective GP29-to-Base32* symbol map. All **32P29** injections are represented by the exact padded 32×32 matching optimizer.
2. **17-digit numeral.** Append each heading's visibly following thirteen-dot count as GP digit index **13**. Each 17-digit GP-base29 number could encode a Tor-v2 80-bit hostname. Admit **every secret permutation of the 29 GP digit labels** (29! mappings), without relying on the canonical printed alphabet. The 17-digit outputs must match the known hostname numerals in full.

| Original source test | Required exact matches | Maximum over all 672 paired cases | Full solutions |
| --- | ---: | ---: | ---: |
| Two red headings to Base32 characters | 32/32 | **20/32** | **0** |
| Two red headings plus their thirteen-dot marker to GP-base29 address numerals | 34/34 | **22/34** | **0** |

A **stronger, independent-key exclusion** tests the two headings separately, allowing the unknown symbol alphabet to differ arbitrarily between pages. Over each heading's **28** possible hostname/orientation cases, **page 3** reaches at most **12/16 direct** or **13/17 numeric** matches; **page 23** independently reaches **12/16 direct** or **13/17 numeric**. Thus even if each page carries an unrelated cipher alphabet, **neither red heading directly encodes any one of these seven published historical addresses** under either exact reading.

The constructive controls encode actual source-listed Tor hostname symbols under concealed injective alphabets. The same exhaustive optimizer recovers **32/32** planted direct Base32 positions and **34/34** planted base29 positions, including the required common thirteen-dot ciphertext marker. Exact two-heading and single-heading original exclusions are therefore testable conditions rather than failed heuristic searches.

**Verdict:** these original red headings do not encode **any of the seven known 2014 onion addresses** by a fixed injective glyph lookup or by appending the literal thirteen-dot count as the final base29 digit under a fixed digit permutation. The 16-rune length coincidence alone does not establish onion-address intent; the marker-to-GP-index reading is a deliberate hypothesis, not a historical assertion. Different unknown addresses, stateful ciphers, cross-page encoding, encoded-bytes/PGP payloads and unrelated red-title functions remain open. The solved p56 deep-web hash and target destination are unresolved.

**Full reproducibility:** [\`sims/red16_onion_address_inverse.cjs\`](../sims/red16_onion_address_inverse.cjs) verifies both exact red ink marks, asserts source heading text against the original numeric corpus, scores all 672 cases by globally optimal assignments and runs both planted controls. [Successful manual workflow run 42850308633](https://github.com/FlareZ123/liber-primus/actions/runs/42850308633), reusing the existing red-ink workflow without creating a new one.

## Conclusion and scope

The grid-stream test closes two natural, completely specified title-as-base29 IV serializations in the **direct original grid-column AES/ChaCha + single-skip + literal GP-English** family; neither recovered any original source plaintext or a known-correct key. It extends the distinct Unicode-SHA and repeated-index IV tests in the existing [grid-stream inversion report](grid-stream-collision-viterbi.md). The new hypothesis has no independently authenticated evidence that Cicada actually used CTR/ChaCha, or the byte table as eight symmetric keys. The statistic cannot exclude unknown outer alphabets, unusual source language, different IV counter conventions, multiple per-rune skips, other cryptographic families or an unobserved external component. No inference about the general strength of the manuscript's cipher follows.

**Reproducible code:** [`sims/red_title_base29_grid_iv.cjs`](../sims/red_title_base29_grid_iv.cjs), which imports the proven exact original Viterbi and original title annotation, asserts actual source lengths and runs both planted and complete matched null scans. **Successful manual GitHub Actions run:** [42786254662](https://github.com/FlareZ123/liber-primus/actions/runs/42786254662). Source title numeral values and all eight IV bytes are emitted, and there are no per-commit CI executions.

The separate exact onion-address exclusion above concerns only the seven frozen historical hostnames. Neither conclusion supplies an authenticated unknown LP2 plaintext or the missing continuation address; a new source-locked key or independently constrained destination is required for further progress.
