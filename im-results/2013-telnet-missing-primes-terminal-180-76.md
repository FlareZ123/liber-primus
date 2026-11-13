# 2013 telnet missing-prime interval versus the LP2 terminal 180/76 division

**Status:** a new, conditional cross-round source-size correspondence and a finite **negative** direct-key test. No recovered unknown plaintext, authenticated key, or cipher.

## A possible human solve path

A newly recovered **original participant PRIMES transcript**, [Pastebin xGY4pbHV](2013-first-onion-primes-xGY4pbHV-original-source.md), now fixes the original visible output rather than relying on later reconstructions. The 1,387-byte first-hand source (SHA-256 591b3cf337c803eef76a16466fa6ebc711aa1f0a3b26d1520573abda89889a94) contains **284 primes**, listing the first 20 through 71, then primes 201–464 from 1,229 to 3,301. Thus exactly **180 consecutive primes, ordinals 21–200 and values 73–1,223**, are absent. A separate 14-Jan-2013 anonymous list of those missing numbers independently supports the contemporary observation; neither participant document is a signed original server implementation or proves Cicada intentionally omitted them.

- Community transcript: [Possible hints never used, “missing primes on telnet”](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md#missing-primes-on-telnet).
- New contemporaneous participant witness: [Pastebin “Missing Primes Cicada 3301”](../resources/external/2013-01-14-missing-primes-pastebin.md), displayed creation date 14 Jan 2013; it lists all 180 omitted primes but is not a raw Telnet response or signed instruction.
- Independent *later archive transcription*: [neuroretransmit's telnet README](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md#primes). It agrees on the gap and two doubled spaces but ends at **3,299**; the newly recovered first-hand **2013 paste actually ends at 3,301**, settling the source-observation discrepancy. Neither participant document constitutes a signed server packet capture.
- Independent historical description: [The Telnet Prompt](https://uncovering-cicada.fandom.com/wiki/The_Telnet_Prompt) cites the exact **xGY4pbHV** PRIMES paste, now recovered with original source hash and 284-number sequence ([exact source and SFT](2013-first-onion-primes-xGY4pbHV-original-source.md)). The different **6srsAN1E** paste contains only the missing-primes list.
- The original LP2 printed numeral table has 32×8 = **256** cells. Its outer one-cell perimeter contains **76 = 2(32+8)−4** cells and the rectangular interior contains **180 = 30×6** cells.
- One independently noticed terminal composition is p53's 179 runes followed by the oversized p54 initial Ac (GP index24), making **180**, while p55 has exactly **76** runes. **A competing and independently established framing also has 180:** the 85 solved runes of p56 followed by the 95 clear runes of p57. Both alternatives are documented in [the existing circumference research](terminal-grid-circumference-knownplain-gate.md). No source instruction chooses between them.
- Restricting the historical prime list to the **first 256 primes** creates another exact split: the missing ordinals 21–200 contain 180 primes, and the visible ordinals 1–20 plus 201–256 contain 20+56=**76** primes.

This gives a concrete, if retrospective, possible assignment: **omitted 2013 primes ↔ terminal interior**, **visible early primes ↔ p55 perimeter**. A solver could in principle make both connections from player-visible source numbers, if the first-onion server genuinely emitted this participant-preserved output. The selection of the first 256 primes is motivated by the table only after seeing both artifacts, and the geometric-to-rune assignment was already under investigation before the telnet connection. These are independent source lengths, not independent evidence that Cicada designed the link.

## Source-selected nine-prime GP tail gives 29² (Agent9, 13 November 2026)

The participant-preserved January 2013 first-onion PRIMES response prints the first **20** ordinary primes, ending at 71, then omits the 180 primes numbered 21–200. The independently published Gematria Primus alphabet uses the first **29** primes. Consequently the **nine missing GP prime labels**, chosen by the *historically documented* 71→1229 gap without fitting a rune cutoff, are **73, 79, 83, 89, 97, 101, 103, 107, 109**. They sum to **841 = 29²**, whose square root equals the GP alphabet size. Among all **29 nonempty suffixes** of the GP prime list, this is the **only perfect-square suffix**.

This is a newly recognized cross-round reason a historical player might notice the already-established GP29 quadratic-extension field GF(29²), separately supported by the p3 red quadratic and p50/H/G algebra. It provides **no actual GP plaintext, key, field operation, or author-selected consumer**. The prime-list witness is a participant capture, not a Cicada-signed message. The suffix-square may arise from pure prime arithmetic, and both the field operation and summation of the nine values remain conjectural. The already documented 180/76 prime gap, terminal-grid and GF841 Reed–Solomon original-cipher negatives below are unchanged. A productive successor must find an independently signaled original operation using the field rather than search more arbitrary field phases.

## A separate 2013 anchor: the PARABLE number's prime factors

A distinct historical item makes the telnet omission worth investigating without adding speculative ciphers. The archived **2013 Cicada OS `AUDIO/761.MP3`** has an ID3 `Parable` number **1,595,277,641**, which independently equals the product of the **three prime-weight clause sums** of the later solved p57 PARABLE body. This identity was established before this investigation; see the [public pnotisdev analysis](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) and [existing 2013 telnet/Parable SFT](../sims/cicada2013_parable_reversal_ring_sft.cjs). The novel question here is how those already anchored primes intersect the historically omitted interval.

| Solved p57 clause | GP prime-weight sum | Prime ordinal | In 2013 telnet omitted interval? |
| --- | ---: | ---: | --- |
| Red heading PARABLE | 449 | 87 | Yes |
| Body clause 1 | 1,259 | 205 | No |
| Body clause 2 | 1,031 | 173 | Yes |
| Body clause 3 | **1,229** | **201** | **No: first displayed after gap** |

Exactly **1,259 × 1,031 × 1,229 = 1,595,277,641**. Consequently, a solver possessing only the 2013 audio metadata and the prime list could reconstruct the omitted factor directly: **1,595,277,641 ÷ (1,229 × 1,259) = 1,031 exactly**. Both divisors are among the first five printed primes after the telnet gap (positions first and fifth). The quotient 1,031 is prime and absent from the list, so this is a finite, checkable historical source-to-source recovery; it still does not decode any unknown LP2 rune. The telnet source resumes at 1,229, making one independently documented 2013 audio factor the **first surviving prime immediately after the 180-prime omission**. The next factor 1,259 is the fifth prime printed after the gap, and 1,031 lies inside it. The heading 449 also lies in the gap. These are original source-number intersections, now asserted in the [reproducer](../sims/lp2_telnet_prime_gap_terminal_sft.cjs). The interval could have drawn attention to the prior Parable factors, but no surviving instruction demonstrates this was Cicada's intention. The relationship does not determine an order, key, numeral encoding or reversible map on unknown LP2 ciphertext. Its strongest objection remains historical post-selection: the factor identities and the missing-prime interval were separately investigated before their intersection was noticed.

**Decision:** This overlap is a more causal clue to examine than an arbitrary 180-number list. A useful successor would establish whether contemporary puzzle participants noticed an explicitly player-visible instruction to use the missing prime interval with the already supplied 2013 Parable number. Absent that, do not turn the 1,229 boundary coincidence into new additive-state parameter scans.

## 2013 telnet double spaces: ambiguous neighbor selector, not a source-selected C/D·IA key

The newly recovered **original participant** PRIMES paste fixes two source-level spaces between `29`/`31` and `3257`/`3259`. The archived first-onion README labels them “double spaces at 29 and 3257,” and its linked reconstructed server explicitly appends two spaces after the values 29 and 3257. The whitespace is therefore a delimiter between neighboring primes; the transcript does not, by itself, prove whether a solver should select the left or right token.

The documented `NUMBER` command is conditional. If both `n` and its decimal reversal are prime, it returns `+`; if `n` is prime and its reversal is composite, it returns the reversed value and its factors. Consequently:

- `NUMBER(31)` returns `+`, **not 13**.
- `NUMBER(3259)` returns `9523` with divisors `[1,89,107,9523]`.
- If the selector attaches to the values after which the server inserts the extra spaces, `NUMBER(29)` returns `92` with divisors `[1,2,4,23,46,92]`, and `NUMBER(3257)` returns `+` because 7523 is prime.

The earlier `31→13 (GP C)` is not a command output. The `D·IA` pair is obtained only if one chooses the *following-neighbor* interpretation of the 3257/3259 separator. The archived server is a reconstruction, not an authenticated original capture; the D·IA selector is therefore a conjecture, not a source-selected key.

### Retrospective black continuation: LP (not a source-selected readout)

Under the conditional following-neighbor interpretation, the GP pair `D·IA` occurs in red spans at p53:143 and p54:3, each followed by `TH`. The same pair also occurs in black ciphertext at p54:90 and p55:38, followed by `L` and `P`. The p55 occurrence begins at the exact 76-rune midpoint. The two black continuations therefore spell `LP`, and the previously noted 2014 square-center prime differences also give `LP`.

These are real ciphertext and arithmetic observations, but their connection is retrospective: the double-space delimiter does not force selection of 3259, `NUMBER(31)` does not emit `C`, and the `LP` continuation was noticed after choosing `D·IA`. Do not treat `C·D·IA`, `D·IA·TH`, or `LP` as an established 2013-to-LP2 instruction, key, or locator. Preserve the occurrences as a conditional motif only.

## Newly checked 264 = 8 + 256 source-layout extension (Agent41, 12 November 2026)

The independently preserved 8-Jan-2013 PRIMES transcript has **264 displayed primes after its 180-prime omission**, namely prime ordinals 201–464. Thus its visible tail is exactly **33×8 = 8 + 32×8** numbers. Within the original LP2 p40–53 visual chapter, the **original p40 rubric has eight red GP29 runes** and the complete pp49–51 table has **32×8 base60-value cells**. The order-frozen heading GP indices are `[0,9,19,26,6,23,25,8]`; their ascending-rune column order is `[0,4,7,1,2,5,6,3]`. The original last eight displayed 2013 primes are `[3229,3251,3253,3257,3259,3271,3299,3301]`, placing the double-spaced `3257  3259` boundary after the **fourth** of those eight values. The largest p40 heading GP index also occupies its fourth position. That positional agreement is a *retrospective, weak selector*, not a creator-authenticated mapping.

The eight surplus primes could be positioned **before** or **after** the numeric table; the source gives no preferred end or byte-to-prime conversion. To avoid inventing a fitted cryptosystem, a complete finite gate tested **both 256-prime contiguous tails** (ordinals 201–456 and 209–464) against the 256 printed table bytes reduced modulo29, either in printed order or with the heading's exact sorted-column permutation/inverse. For each of these six frozen alignments, **every stationary secret GP29 symbol-codebook** `f(prime mod29) = tableByte mod29` fails the original input: after fixing each output from the first occurrence of its input, at least **214** later positions contradict that output (range 214–224). Even optimizing all 28 invertible affine slopes and 29 intercepts gives only **18–21/256** exact matches, consistent with unrelated GP29 sequences.

A complete **256/256** positive plant using an independently chosen affine codebook `f(x)=7x+11 mod29` passes and independently recovers the known map. [Single-file original-source SFT](../sims/lp2_2013_tail264_p40_grid_sft.cjs). This rules out only *direct stationary GP29 mappings of the 2013 prime ordinal tail to the printed 2014 byte table* in these source-visible orders. It does **not** rule out a genuinely source-specified nonstationary transform, compressed payload, hash, unprinted key, or other third-party historical relationship. More importantly, no original instruction tells a player to reshape the 264 values or apply a rune codebook. **No unknown plaintext or authenticated key was recovered.** A specific authorial consumer is required before any follow-up cryptanalysis is justified.

## Exact limited decryption test

The reproducible [SFT](../sims/lp2_telnet_prime_gap_terminal_sft.cjs) constructs the 464 primes through 3301 and enforces the original boundaries. It extracts unchanged GP indices from [the canonical corpus](../resources/liber-primus/lp2-corpus.json):

- Interior ciphertext = p53[0..178] concatenated with p54[0], length 180.
- Exterior ciphertext = p55[0..75], length 76.
- Interior key = primes 21–200 in ordinary ascending order.
- Exterior key = primes 1–20 followed by 201–256, in historical reading order.

For each region, the *complete, predeclared direct key family* comprises prime value or φ(prime)=prime−1, forward or reversed order, and GP29 add/subtract. These are 8 interpretations per region, **16** original-input tests altogether. The operation is a hypothesis; the historical telnet source does not instruct the solver to use GP29 addition or subtraction. No fitted spaces, column order, crib shift, second layer, or keyed selection was allowed.

**Results of original-input execution:**

| Original region | Original IoC | Range of decoded IoC, 8 cases | Result |
| --- | ---: | ---: | --- |
| p53 + p54[0], 180 runes | 0.03333333 | 0.03370577–0.03656114 | No coherent GP plaintext |
| p55, 76 runes | 0.03789474 | 0.03052632–0.03789474 | No coherent GP plaintext |

All 16 variants preserve the full original rune array under exact forward reencryption. Native-GP plants from cyclic repetitions of the *already solved* p57 runes recover every rune with the same fixed keys, confirming arithmetic reversibility; these are implementation controls, not evidence of the historical mechanism. As a descriptive reference, the 95-rune genuine plaintext p57 has IoC **0.06270997**, but this is a different-sized sample and must not be interpreted as a calibrated p-value.

**Important false-positive trap:** one reversed, totient, additive p55 transliteration begins with the Latin string `SPONGEO...`. Its actual first five GP rune tokens are **S · P · O · NG · EO**, so the apparent substring `SPONGE` is produced by cutting the one-rune **EO** digraph. It is **not** the rune spelling of the word SPONGE, not a plaintext crib, and the remainder is nonlinguistic. The SFT records full rune-index outputs to prevent this ambiguity.

## Competing 180-rune framing: exact known-plaintext disconfirmation

The 180-cell table interior can also represent **p56+p57**, rather than p53+p54[0]. This alternate interpretation is especially valuable because the plaintext is known: p56's historically solved 85 GP runes and p57's 95 plainly printed runes. The [same SFT](../sims/lp2_telnet_prime_gap_terminal_sft.cjs) calculates the exact GP29 encryption shifts required at every one of those 180 original positions. The same eight direct prime/totient, forward/reverse, add/subtract interpretations are then compared to those required shifts *without language scoring*.

| Prime-key reducer / direction | Matches of 85 solved p56 rune shifts (best sign) | Matches of 95 clear p57 rune shifts |
| --- | ---: | ---: |
| Prime, ascending | 3 | 0 |
| Prime, reversed | 8 | 0 |
| φ(prime), ascending | 5 | 2 |
| φ(prime), reversed | 2 | 3 |

The eight sign-specific totals range from **2 to 8 of 180 exact required shifts**; no direct GP29 prime-gap pad reproduces this known 180-rune control. This rejects only a pad that is also supposed to explain *both* historically solved pages with the same direct arithmetic. It does not exclude a distinct cipher on the unsolved terminal pages or a different role for the prime interval.

## Independent printed-table numeric check

A separate, language-free source check asks whether the same split has an obvious **bytewise** correspondence with the printed table itself. Freeze the table's natural 30×6 interior row-major reading and the standard outer ring clockwise from the upper-left corner. Compare those 180 and 76 base60-decoded byte values with the two historical prime sets reduced mod256, using either the prime or its φ(prime)=prime−1. There is no fitted rotation or optimized correspondence.

| Original table region versus source key | Equality count | Pearson r |
| --- | ---: | ---: |
| Interior versus missing primes mod256 | 1/180 | −0.09733 |
| Interior versus missing φ(prime) mod256 | 4/180 | −0.09733 |
| Exterior versus visible primes mod256 | 0/76 | +0.10812 |
| Exterior versus visible φ(prime) mod256 | 0/76 | +0.10812 |

The 1, 4, 0 and 0 coincidences are consistent with unrelated bytes under this direct interpretation. This specifically fails to corroborate a literal prime-valued byte table. The historical base59 numeral-codec ambiguity does not provide a reason to optimize the byte interpretation after this negative result.

## Historically motivated native-byte XOR, exact full-grid test

The 2013 Cicada onion `clue` was decrypted by **XOR against an explicitly supplied historical file** (`_560.00`), so XOR is an actual creator-used operation rather than a cipher family imported without a puzzle precedent. The 180/76 mapping also naturally describes the **256 printed table byte cells**, independently of any runic message assignment. This selects one additional bounded experiment: place the omitted 180 primes in the **30×6 table interior row-major**, place the visible first-256-prime complement on the **perimeter clockwise starting upper-left**, reduce every prime modulo 256, and XOR each original byte with its assigned key byte. The table is read in its printed, unpermuted row-major order. See [SFT](../sims/lp2_telnet_prime_gap_terminal_sft.cjs).

Of the original **256** printed source bytes, **103** are printable ASCII (0x20–0x7E). After the source-locked XOR, only **89** are printable ASCII, with **54** letters or spaces, four spaces and one NUL. The recovered first 95 bytes rendered with nonprintables as `.` begin:

`....j.o......e..4.dL...J$O&.....4.h...D ....9."e.......{.{.Ps.Y.Q......Y......[i.A.D ..|..c.]..`

No English plaintext, file signature, or recognizable contiguous message appears in the full original output. The source program prints all 256 recovered bytes as hex for independent assessment, exactly re-XORs to the original bytes, and recovers a constructed 256-byte ASCII plant under the same frozen key and layout. This **rules out the single literal native-byte XOR** interpretation of this source mapping as ordinary uncompressed English, not compressed/encrypted/multilayer data and not an arbitrary other perimeter order. The source-linked prime list still lacks a creator-authenticated instruction selecting this mapping, so there is no reason to multiply variants.

## Uniform decimal-reversal pad is not the documented NUMBER output

The 2013 `NUMBER` service is not a uniform digit-reversal transform: it returns `+` for emirps and returns the reversed composite plus its divisors otherwise. The existing uniform reversal of every omitted/visible prime is therefore a hypothetical extension, not the command's actual output. Its frozen forward-order GP29 subtraction and table-byte XOR remain bounded negative tests, but must not be described as creator-selected. The p32 dimension compass use of `NUMBER(563)` and `NUMBER(569)` is different: their reversals 365 and 965 are composite, so the documented command returns the factors `5×73` and `5×193`.

## Adjacent prime gaps: 179/180 source-length test (negative)

The 180 omitted primes p21…p200 (73…1223) yield **179 internal adjacent gaps**, matching p53's 179 runes. Including the boundary gap 1223→1229 (p201, the first visible prime after the omission) yields **180 gaps**, matching p53 plus p54's enlarged Ac24. This is distinct from the already-tested 361-entry concatenation of missing primes and gaps, and from direct use of the 180 prime values.

A frozen direct GP29 test applied the 179 internal gaps to p53 and the 180 boundary-extended gaps to p53+p54[0]. It tested direct gap values and the natural half-gap values (`gap/2`), forward order, both addition/subtraction signs, with no reversal, phase, offset, or key fitting. The original outputs remain nonlinguistic: p53 raw trigram is **−4.23744**, while the best half-gap output is about **−4.447**; p53+p54 raw is about **−4.236**, while the best half-gap output is about **−4.441**. Shakespeare GP heldout controls score about **−2.33** and **−2.32** respectively. Every original re-encryption and every 179/180-rune native-English plant passes exactly.

The literal 180/76 table interpretation placed gaps (or half-gaps) row-major in the 30×6 interior and the 76 visible first-256-prime complement clockwise on the perimeter, then XORed the original 32×8 bytes. The outputs contain **105/106 printable bytes**, versus **103** in the original table, but neither is readable ASCII or a recognized file signature; planted ASCII controls recover exactly.

A cumulative walk using the 179 internal gaps as forward step lengths modulo179 visits only **136 of 179** positions. It is not a permutation; collision resolution would require an extra rule not selected by the source.

These tests reject the specified direct gap/half-gap additive pads, the 180-interior/76-perimeter gap XOR, and the literal cumulative gap walk. They do not refute the 180-prime/180-cell structural correspondence, the separate 361-entry sequence, or the p32 prime-gap compass hypothesis. Full reproducer and detailed metrics: [prime-gap difference SFT](../sims/lp2_telnet_prime_gap_difference_sft.cjs) and [report](2013-telnet-prime-gap-differences.md).

## 180/76 geometry split as a direct p50 byte key (bounded negative, 11 November 2026)

The 180/76 correspondence admits one additional fixed test. The p50 source is a 32×8 byte table: its interior is 30×6 = 180 cells and its perimeter is 76. The LP2 sequence p53 (179 runes) plus p54's enlarged red Ac24 initial (1 rune) is 180; p55 is 76. This matches the participant-reconstructed 2013 prime-list split (180 omitted, 76 visible). A plausible direct-key reading is therefore: p50 interior bytes, row-major, supply a one-to-one GP29 key for p53+Ac24; the perimeter supplies the 76-symbol key for p55.

The interior half is now tested with no phase, offset, or parameter search in both natural orders: (1) interior row-major and (2) the inner clockwise spiral after the 76-cell outer perimeter. Each order reduces its 180 bytes modulo 29 and applies both fixed additive directions to the 180-rune p53+Ac24 stream. The table byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The target/key lengths and planted 180-rune round-trips are exact. Against 22,517 held-out native-GP Gibran windows of length 180, the worst native score is -9.353989. Row-major C−K/C+K score -12.500389/-12.260663; inner-spiral C−K/C+K score -12.544365/-12.278393. All four are below every native window and none is language-like. Reproducer: [`p50_interior_180_key_p53_ac_sft.cjs`](../sims/p50_interior_180_key_p53_ac_sft.cjs).

A fixed geometric transposition was also tested: place p55 on the clockwise outer perimeter, p53+Ac24 in the clockwise inner spiral, then read the 32×8 grid row-major. Its 256-rune output scores -12.279357, below the worst of 22,441 held-out native-GP Gibran windows (-9.225320); zero native windows score at or below it. The inverse placement control is exact. This rejects the simple spiral placement as well; the reproducer reports both the additive-key and transposition gates.

The complementary perimeter→p55 half is already tested in [\`p55_table_perimeter_key_sft.cjs\`](../sims/p55_table_perimeter_key_sft.cjs): both table encodings, byte-mod29 and scaled29 projections, and both signs fail the held-out native-language gate. Thus the direct 180/76 additive-key interpretation is rejected on both halves, and the fixed spiral placement is also negative. This does not falsify the geometric correspondence itself, but any further use of it needs an independent source instruction selecting a different reversible operation; another tuned byte transform or arbitrary transposition is not justified.

## Direct paired-residue lookup impossibility on the 180 known terminal runes (12 November 2026)

The source-size hypothesis has a further test that eliminates **every secret stationary 29×29 lookup**, independently of guessing a cipher table. Align the **180 omitted primes 73–1223** with the original p50 **30×6 interior bytes, row-major**. Suppose the corresponding 180 known GP29 plaintext runes (historically solved p56, then originally clear p57) are generated by *any* one fixed function

`P[i] = F(B[i] mod 29, prime[i] mod 29)`.

This source-register hypothesis is deliberately more generous than an affine, additive or multiplicative decoder: all **841 possible outputs of F can be secret and arbitrary**. Still, whenever the same residue pair occurs twice, its plaintext rune must be identical. In the actual source there are **166 distinct input pairs among 180 positions**, and **14 repeated input pairs demand different output runes**. Two are enough to rule out the complete memoryless lookup model:

| Original interior index | Printed row, column (zero-based) | Grid byte | Omitted prime | Shared input residues | Established p56 GP plaintext |
| ---: | --- | ---: | ---: | --- | ---: |
| 33 | (6,4) | 86 | 251 | (28,19) | **18** |
| 52 | (9,5) | 144 | 367 | (28,19) | **1** |

This contradiction occurs **entirely inside p56**, so even giving p56 and p57 independent secret lookup tables would not rescue the model. The p57 cohort contains **two further within-page conflicts**. A direct p50-minus-omitted-φ(prime) decoding reaches only **4/180** known plaintext positions (and 5/180 printed-ciphertext positions), so it has no direct decipherment advantage either.

**Stronger whole-byte obstruction:** granting the decoder the **entire printed eight-bit table byte**, with only the historically motivated prime residue mod29, still cannot reproduce the source plaintext by any stationary secret function `F(B,prime mod29)`. There are 179 distinct full-byte/prime-residue pairs across 180 input positions, and the remaining exact duplicate is fatal: interior index21 has printed byte **54**, omitted prime **181**, required known plaintext GP index **4**; interior index86 also has byte **54**, omitted prime **587**, and requires GP index **24**. Both primes are congruent to **7 mod29**. One unambiguous duplicated full-byte input rules out an arbitrary **256×29** stationary lookup, not just the original 29×29 residue-reduced family. This particular contradiction crosses p56/p57; the preceding 29×29 contradiction stays independently inside p56.

Two simple source-quotient refinements are also excluded without inventing a key. Adding the parity of the printed-byte quotient `floor(B/29)` leaves **9 conflicting repeated input states**. Adding the parity of the prime quotient `floor(prime/29)` leaves **all 14 conflicts**: for every omitted prime, the prime and modulus29 are odd, so the parity of its quotient is uniquely determined by the parity of its residue. The latter “extra bit” is mathematically redundant. These fixed negative distinctions sharpen the requirement for any successful nonstationary decoder; they do not favor an arbitrary hidden-state rescue.

This result is a bounded **source-paired necessary-condition exclusion**, not a new explanation of the prime gap. It leaves open full unmodded byte and prime registers, a varying-state mapping, other original source orders, and a possible unrelated role for the 2013 omission. It supplies no unknown plaintext. Reproducer: [standalone CJS SFT](../sims/lp2_2013_omitted180_prime_terminal_gate_sft.cjs), passed the original [manual source run 43312071794](https://github.com/FlareZ123/liber-primus/actions/runs/43312071794) and the strengthened [full-byte/quotient regression 43316107233](https://github.com/FlareZ123/liber-primus/actions/runs/43316107233), both with an exactly invertible planted 180/180 GP29 affine relation.

## What would change the decision

The 180-prime omission remains a plausible cross-round source observation, but it does not itself specify a decipherment. Direct prime/totient-prime pads, the isolated 179/180 adjacent-gap pads, the literal 180/76 gap-byte XOR, the cumulative gap walk, the direct p50 interior/perimeter mod-29 additive-key split, the fixed 180/76 spiral transposition, and the original 180-known-symbol **arbitrary stationary GF29 pair-codebook** all fail their frozen tests. The double-space D·IA/LP interpretation is selector-dependent; `NUMBER(31)` returns `+`, not `C`, and the archive's reconstructed server appends extra spaces after 29/3257.

Do not extend these branches with arbitrary moduli, offsets, reversals, collision rules, or language-fitted parameters. A useful continuation requires a genuinely source-selected non-additive/path operation or a new independent clue that predicts plaintext, not another serialization of the same prime list.
