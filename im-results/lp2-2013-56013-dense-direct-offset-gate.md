# 2013 CicadaOS DATA/560.13: complete direct GP29 pad-offset gate on original LP2 p0

**Status, 13 November 2026, Agent 9.** A bounded and fully executed original-cipher **negative**. Every available contiguous 249-byte offset of the independently authenticated 118,818,811-byte historical CicadaOS `DATA/560.13` stream was tested under four frozen direct GP29 interpretations. None recovered sustained GP-native prose, a verified key, or unknown LP2 plaintext. This closes the remaining unscanned offsets **for the exact tested p0 direct-pad family**. It does not rule out the dataset as a different historical carrier.

## Why the historical source was worth a dense test

Cicada's authentic 2013 phone puzzle performed an offset-specific **XOR with a slice of `DATA/560.13`** to recover a real onion address. The public CicadaOS data file is an unusually concrete and large source of otherwise high-entropy key bytes which predates the 2014 LP2 publication. The 2016 signed message's `words / meaning / numbers` guidance is consistent with looking for an author-selected numeric address. However, no original LP2 instruction chooses this stream, one arbitrary large byte offset, or GP29 addition. The historically witnessed operation was XOR, so GP29 addition is a simple proposed direct transport rather than a historical fact.

Earlier [external 560.13 Phase60 T8 experiments](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) sampled arbitrary offsets of the 118 MB file and identified a large unsampled remainder. This study **closes that offset-coverage gap only for four explicit additive interpretations on one fixed original p0 body**. The 2013 file was retrieved in a manual Windows GitHub Actions job, verified at its historical length **118,818,811 bytes** and exact SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f` before any test.

## Original ciphertext, language model and operation

The unchanged `resources/liber-primus/lp2-corpus.json` original physical p0 supplies **262 GP29 ciphertext runes**. Its first 13 printed red runes are an independent visual heading. For a pre-frozen simple body-key test, discard those 13 from the *scored window*, retain all **249 subsequent p0 runes**, and set the source pad offset to an unknown integer `o`. The actual original ciphertext indices are 0–28, unaltered.

Two byte-to-GP29 projections and both signs define four operations, with no fitted shift/phase/reset:

```text
K_mod(o,i)    = DATA[o+i] mod 29
K_scaled(o,i) = floor(29 * DATA[o+i] / 256)
P_i           = (C_i + sign * K(o,i)) mod 29,  sign in {-1,+1}
0 <= o <= 118,818,562
```

All proposed plaintext indexes are valid GP runes by construction. The operation is reversible for a specified offset and pad: `C_i=(P_i-sign*K_i) mod29`.

To avoid decoding and hand-picking occasional English-looking scraps across half a billion trials, an independently chosen native GP29 source calibrates a fixed **64-rune first-window gate**. The score weights are rounded `100 × ln(29 p_rune)`, where `p_rune` is a three-way equally weighted GP29 source mixture: published Shakespeare source 217,106 runes, source-preserving Latin Vulgate 204,802 runes, and corrected native Old English Beowulf counts. Shakespeare/Latin original-source 64-window 0.5th-percentile score thresholds were **947 / 1725**; freeze the lower threshold **947** before observing any original-pad score. A candidate above threshold is then decoded over the complete 249 body runes and assessed by full language score, transliteration, and IoC. The gate is intentionally permissive to the matched Shakespeare source; it is **not language-universal**, and a true unusual plaintext could fall below it.

## Full original-input outcome

Every one of **118,818,563** valid zero-based pad offsets was evaluated for each of the four models, for **475,274,252** original-offset/model combinations. A total **171** offsets passed the 64-rune source-calibrated gate. The table gives the **highest full-249-rune score among those 171**, with the corresponding source offset and the fully decoded rune sequence's IoC.

| GP29 key projection | Decrypt sign | Screen survivors | Best offset | Best full score | Best recovered IoC |
| --- | ---: | ---: | ---: | ---: | ---: |
| `byte mod 29` | −1 | **49** | 80,729,433 | **−4,345** | 0.03899469 |
| `byte mod 29` | +1 | **37** | 8,744,086 | **−6,338** | 0.03760202 |
| `floor(29*byte/256)` | −1 | **40** | 76,590,451 | **−8,056** | 0.03624174 |
| `floor(29*byte/256)` | +1 | **45** | 54,045,637 | **−6,628** | 0.03695427 |

The highest full-score candidate at offset 80,729,433 starts `ETOEURCFMBAETHHYSLHLEAANRDHEDEAEOTDEAUNOETCRLAOTCGRA...`. This is not coherent English runic prose; the similarly best three alternate projections are nonlinguistic. The strongest candidate IoCs, **0.0362–0.0390**, remain much closer to the uniform GP29 value `1/29≈0.03448` than to source-native English. No actual key was selected by a manuscript clue, no ciphertext run recovered an independent sentence, and no original-p0 decrypt is claimed.

A local positive source-native plant uses a different genuine Shakespeare 249-GP-rune passage encrypted under a hidden **offset 3301** into an independent 25,000-byte seeded pad. For **all four** projection/sign variants, the identical blind original-search routine finds the planted offset **rank 1 of exactly 1 screen survivor**, recovers all 249 runes exactly, and re-encrypts all 249 to the original synthetic ciphertext. These controls demonstrate the gate can recover a planted fluent GP-native passage while testing the same key interpretation.

## Decision and reproducibility

The entire scanned offset domain is covered **only for the original p0 249-rune body, fixed 64-rune threshold, two byte projections, both direct additive signs, and naturally ordered consecutive file bytes**. No arbitrary source offset within that finite family was omitted. This rejects the direct historic-pad candidate at the source-calibrated English/Latin/Old English language screen; it cannot exclude GP29 XOR, reversible derived keys, a source-selected offset with unusual/non-GP plaintext, a different page, clocks/resets, escaping, or more complex source transformations. Those extensions need a distinct author-visible cue before another expensive family expansion.

Reproducer: [`sims/lp2_56013_dense_direct_pad_sft.py`](../sims/lp2_56013_dense_direct_pad_sft.py). The [manual Windows workflow](../.github/workflows/lp2-56013-dense-source-pad.yml) completed [native-positive control run 43428064294](https://github.com/FlareZ123/liber-primus/actions/runs/43428064294) and [original exhaustive run 43428167730](https://github.com/FlareZ123/liber-primus/actions/runs/43428167730). The original run stores all four model summaries and up to 30 full-score-ranked source offsets per model in the `lp2-2013-56013-dense-source-pad-results` GitHub Actions artifact, SHA-256 of artifact ZIP **`a7a15d2e9de3cf1aafb403d6e6bbed08b5a5d38dfcf097f165060612ddca230f`** (90-day artifact retention). Results are reproducible from the permanently committed script and pinned input, even after the artifact expires.

## Original 2014/2016 source-selector gate (16 November 2026, Agent20)

A separate, **source-only** check has now tested the missing causal premise behind transferring this genuine 2013 byte operand to the 2014 LP2 manuscript. It examined the three original Freenode logs [pinned by Git blob identity](../resources/external/2014-cicadasolvers-freenode-log-corpus.md): `#cicadasolvers.freenode.log` (`bdd277c14f94c34b5ae714cd00c238065beeed4e`), `#33012014.freenode.log` (`a2880b1db31ce523599ef30ca2e55291bf295900`) and `#cicadasolvers.freenode.2.log` (`72634a9d071d32af767edbffc0493d810e88cd0d`). Their original SHA1 Git-blob identities and byte lengths were checked before any text search. Across **76,639 dated May–August 2014 lines**, a predeclared exact-string/fingerprint grammar found **zero mentions of `560.13` / `56013` / `DATA/560.13` or the historical content address, length/hash markers, and recovered XOR onion**. A separate broad cross-round grammar found 21 mentions of CicadaOS or 2013 key/pad/XOR reuse; eight had nearby LP2 context. These are lexical-search counts, not evidence that all possible unspoken or renamed key sources are absent.

The relevant **dated original conversation contexts** clarify the distinction:

- **4 May 2014, primary L166643–45**: `lvkm` asks whether anything remains unused from CicadaOS; `cluosh` replies `wisdom & folly`, **not `560.13`**. This is participant-directed exploration, not a Cicada-signed operation.
- **6 May, L169246–48**: `Lurker69` reports an unspecified header might point to the old CicadaOS and its `Wisdom and folly` files. Neither a byte address nor a GP29 receiver follows.
- **14 May, L178178**: `Mothwing` proposes reconsidering XOR because of broad thematic links between the current book and the 2013 puzzle, CicadaOS and the Parable. The statement supplies no `DATA/560.13` name, section, offset, serialization, GP29 transform, or reset rule.
- The all-date exact scan did recover **numerous January 2014 historical discussions** of `560.13` prior to LP2 publication. Especially **14 January L37281–83**, a participant quotes the 2013 *gematria.jpg* XOR and telephone-offset onion extraction; **15 January L43215–21** debates whether reusing 560.13 in that year's challenge is plausible. These date the prior historical operand and solver conjecture, rather than independently selecting its use against a yet-unreleased book.
- **11 January 2016, second log L246982–85**: `LuaKT` distinguishes prior 2013 phone-number XOR using `560.13` from a **speculative use of `560.17`** and the first seventeen pages. The proposed number-to-page link is the participant's idea.
- **16 March 2016, second log L311201–12**: `dotnotlock` suggests they *could try* `560.13` XOR while discussing a **761.mp3/twitter-file** operation, immediately adds that another clue would be needed, and gives no LP2 page/cipher input or successful result.

The original [May 2014 signed Stage11 reply](../resources/historical/cicada2014-stage11-message.asc) points to the image-delivery onion without naming this file or a key consumer. The [2016 signed guidance](../resources/historical/cicada2016-4gq25-outguess.asc) directs readers to LP2 words, meaning and numbers, but likewise does not name `DATA/560.13`, a slice/offset, or a byte-to-GP29 operation.

**Reproducibility and decision:** [CJS original-source scanner](../sims/lp2_2014_56013_source_link_sft.cjs) with independent p56-dated positive witness ran successfully in [GitHub Actions 43847293065](https://github.com/FlareZ123/liber-primus/actions/runs/43847293065). The all-date exact scan additionally distinguishes the early pre-LP2 and 2015–16 participant references from the May–August 2014 absence. The new source search gives **no author-selected LP2 byte consumer or testable new unknown-page key**. No fresh original-cipher search is warranted; the direct p0 family already has exhaustive offset coverage above. This is a bounded negative **on the historically available receiver premise**, not proof that the 2013 pad could never participate in an undiscovered method or that unpreserved correspondence contains no missing instruction.

**Next research decision:** retire direct `DATA/560.13` source-transfer work unless new original 2014/2016 material independently fixes a complete LP2 receiver. The source-only gate now addresses the missing historical premise as well as the direct p0 offset model.
