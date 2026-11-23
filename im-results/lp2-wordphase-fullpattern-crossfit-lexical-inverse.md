# LP2 word-local changing alphabets: complete equality-pattern crossfit and constructive inverse ambiguity

**Agent2, 23 November 2026. Independent full-pattern donor discriminator, reused exact word-orbit theorem, 12 leave-one-author-out comparisons, and a new quantitative original-cipher inverse ambiguity.** Status: intermediate architecture discriminator. All **56 unknown LP2 physical pages p0–p55** remain encrypted; no authentic unknown-page plaintext, author-selected cipher, historical password or destination is recovered.

## Decision toward plaintext

Independent rekeying at every printed word and every fourth rune phase is substantially less consistent with both ordinary GP-native English and raw Latin26 English than the aggregate collision count had suggested: in six independent author/register-held-out scoring comparisons of 1,500 length-matched synthetic books each, **only one of 9,000** matched donor-source books has a complete within-word phase-equality log likelihood as poor as the original. These are **conditional comparisons**, with correlated book resamplings and a preselected phase family; they do **not** logically exclude all possible English text, unusual author syntax or shifted word boundaries.

The same independent-per-word model with **five** phase alphabets remains possible on the word-pattern test. In an independent reproduction and explicit quantitative extension of [Agent31's existing all-word lexical-feasibility theorem](lp2-wordlocal-fivephase-allword-lexical-forcing.md), every one of the **2,896 original ciphertext words** has at least one entry in the pinned finite TextBlob English lexicon whose entire five-phase equality signature agrees, both under GP-native and under Latin26 spelling. Constructive **exact original-source decrypt→reencrypt at every one of the 12,956 original cipher runes** proves that this unconstrained five-phase model can emit many wholly invented but dictionary-valid readings. It cannot identify authentic plaintext without a *shared, source-given key/state law* or a withheld independent plaintext anchor. This is a precise identifiability obstruction and a rational stop against optimizing individual per-word keys.

## Input, family and exact all-secret invariant

The manuscript source is [original LP2 rune-index corpus](../resources/liber-primus/lp2-corpus.json), aligned **12,956/12,956** with the [continuous original rune-word transcription](../resources/liber-primus/lp2-transcription.txt) across **2,896 complete words**. The original **32 words carried across physical page boundaries** are rejoined. The numeric-only p50 provides no rune. All printed word boundaries, rune identities and source order remain unchanged. The historically visible five-word red p7 motif provides a possible human five-phase clue, **but no first-party text actually defines this substitution rule or its secret keys**. The alternative explanation is a genuine different cipher with a misleading five-position statistical echo.

Consider ciphertext word `w`, local position `j`, and period `m=4` or `5`:

`C[w,j] = sigma[w, j mod m](P[w,j])`

Each `sigma[w,r]` is a completely unconstrained **29-way bijection**, independent across every one of the 2,896 words and all m residue classes. No key-sharing, additive law, English grammar, arithmetic parameter, or source key is assumed. The same secret bijection operates at all positions of a single word with the same residue class. Two local positions with `i mod m = j mod m` therefore obey the **necessary and sufficient** identity `C[w,i]=C[w,j]` if and only if `P[w,i]=P[w,j]`. Conversely, if these equalities and inequalities agree for all same-phase pairs, construct each finite mapping from plaintext symbols to ciphertext symbols, then extend injectively over unused symbols to a full 29-way permutation. This exact all-secret *orbit criterion* and the sufficient secret-alphabet extension were already established independently by **Agent31 on 14 November 2026**, who also counted the four strongest source-word vocabulary bottlenecks in [the earlier all-2,896-word report](lp2-wordlocal-fivephase-allword-lexical-forcing.md). They are reproduced here as prerequisites to the **new crossfit score**, quantified all-word ambiguity lower bound and explicit original-cipher constructive replay. No other key-independent restriction on a single word exists.

The **canonical phase equality signature** assigns index 0,1,… to newly encountered symbols separately in each residue class, then interleaves these indices in source order. It captures the entire necessary-and-sufficient orbit. Under iid uniform GP29 rune labels, a fixed signature with `k_r` unique symbols at phase `r` and `n_r` phase positions has exact probability

`p0(signature | length) = product_r [(29)_(k_r) / 29^(n_r)]`

where `(29)_(k)` is the falling factorial. This probability is independent of any chosen arbitrary secret substitution alphabets.

## Complete-pattern donor discrimination

At each length, calculate the observed frequency of each canonical signature in **two** independently pinned literary donors. Preserve the length-specific empirical distributions and average their probabilities. The frozen smoothed score of a whole book is

`S = sum_words log{[0.8 * (p_author1(signature|length)+p_author2(signature|length))/2 + 0.2*p0(signature|length)] / p0(signature|length)}`.

The 0.2 uniform fallback is chosen before comparing original and donor samples; it keeps unseen rare patterns finite. Read the **third** donor as a held-out source, generate 1,500 whole manuscripts by sampling each original physical-word-length slot independently from that author's length-matched native real words. Repeat for all three possible held-out authors and both plaintext registers, with `m=4,5`. Shakespeare is `resources/control/shakespeare_first300k.txt`, Emerson is `resources/control/emerson_essays_2944.txt`, and Gibran is the body of `resources/control/gibran_prophet_58585.txt` from first `ALMUSTAFA` through before `*** END OF` (68,955 characters, excluding Gutenberg boilerplate). Exactly **2,893** original word slots are admitted per comparison; three original length14 words have no matching Gibran native words and are dropped identically in source and synthetic scores.

The GP-native register uses the independently established 29-rune spelling convention `QU→CW`, `V→U`, `K/Q→C`, `Z→S`, `ING→NG`, `IO→IA` and longest native-rune tokens. The Latin register uses each donor's uncontracted A–Z symbols (26 letters). Both count unchanged original ciphertext phase equality patterns, so their two donor models are competing assumptions about *plaintext*, not modifications of source ciphertext.

| Register / period | Held-out author | Unchanged LP2 S | Donor mean S | Donors S ≤ original / 1,500 |
| --- | --- | ---: | ---: | ---: |
| GP-native m4 | Shakespeare | −25.636411 | +12.196649 | **0** |
| GP-native m4 | Emerson | −29.865731 | +4.283887 | **1** |
| GP-native m4 | Gibran | −25.692265 | +25.420731 | **0** |
| Latin26 m4 | Shakespeare | −24.595104 | +24.242901 | **0** |
| Latin26 m4 | Emerson | −35.833068 | +15.130971 | **0** |
| Latin26 m4 | Gibran | −28.395390 | +32.690355 | **0** |
| GP-native m5 | Shakespeare | −3.698817 | +16.946235 | 4 |
| GP-native m5 | Emerson | −11.067042 | −2.793237 | **222** |
| GP-native m5 | Gibran | −4.876440 | +11.127628 | 12 |
| Latin26 m5 | Shakespeare | −7.636878 | +21.116335 | 2 |
| Latin26 m5 | Emerson | −13.966352 | +5.268986 | 28 |
| Latin26 m5 | Gibran | −7.611041 | +27.356358 | 0 |

These are conditional, *directional* comparisons against word-length-matched donor resamplings. The six original S values per m are dependent, because they score the same LP2 words. No global familywise probability is claimed for the 4/5-phase choice, the many historic mechanism searches, possible plaintext languages or period clocks. The four-phase result is a strong discouragement under ordinary tested English. The five-phase Emerson GP result is a genuine nonexclusion.

## Exhaustive original-word lexical satisfiability and constructive inverse

An independently **previously answered** exact question is: **Does there exist even one finite-dictionary native plaintext word that can exactly encrypt to each observed original word under fresh unrestricted phase keys?** [Agent31's prior report](lp2-wordlocal-fivephase-allword-lexical-forcing.md) already answered yes for all 2,896 words using pooled Shakespeare and TextBlob GP-native vocabulary, and identified four unusually constrained words (p13, p25, p36, p51). The present extension quantifies distinct finite-dictionary whole-book witnesses for **both raw Latin26 and GP-native** and constructs every word's actual full 29-way secret maps, rather than asserting newly discovered lexical existence. The pinned independent [TextBlob spelling lexicon](../resources/control/english_wordfreq_textblob.txt) has **29,157 distinct entries** in the executable. For each candidate word, compute both its native GP-normalized rune sequence and literal Latin-letter sequence, and group by its exact `length:signature` at m5. Query all **2,896 original LP2 ciphertext word signatures**. The results are exact finite combinatorics, without any inferred English phrases:

| Finite donor dictionary / five independently keyed phases per word | Original words without a witness | Smallest witness domain | Largest witness domain | Sum over words of log₂(domain size) |
| --- | ---: | ---: | ---: | ---: |
| GP-native 29-rune English | **0 / 2,896** | 1 | 4,380 | **29,219.84150033074** |
| Latin26 plain-English letters | **0 / 2,896** | 1 | 4,272 | **28,653.042772024448** |

For **each** actual ciphertext word, take its lexicon witness and construct each phase's plaintext→cipher rune table from matching phase positions. If a source plaintext symbol repeats in the same phase, the original repeats its ciphertext glyph, so the table is consistent. Distinct plaintext phase symbols correspond to distinct original glyphs, so it is injective. Fill the remaining unused plaintext and ciphertext rune IDs in sorted order to produce each full secret 29-permutation; invert it. The SFT verifies that decrypting the **unchanged original ciphertext** under these independently constructed secret maps recovers the chosen lexicon words, and that **reencrypting those words reproduces all 12,956 exact source glyphs**. It does this separately for both candidate Latin26 and GP-native word registers, despite the latter having 29 distinct GP symbols. These are deliberate mathematical *fake plaintext witnesses*. Their letters, phrases and keys have no verified Cicada authorship.

Since independently assigning any of the `d_w` matching dictionary words to each original position yields its own consistent complete 29-way secret tables, the original admits at least `product_w d_w = 2^(29219.8415...)` **distinct complete GP-native dictionary-word tapes** and at least `2^(28653.0427...)` **Latin26 dictionary-word tapes** under this exact unconstrained model. Many violate English syntax and semantics. This adds a numeric whole-book lower bound and explicit original-source inverse witness to Agent31's previously known **underidentification** result. It does not imply that the real cipher uses these tables. A merely grammatical-looking fitted sequence would also need an authentic independent key/clock and held-out plaintext validation. It cannot be treated as a new decipherment; the earlier four rare-word dictionary bottlenecks remain and should be attributed to Agent31.

For m4 a separately tested larger 13–14-letter English list contains legal witness patterns missing from the smaller TextBlob lexicon, so one missing conventional dictionary word cannot by itself prove the entire arbitrary-rekeyed m4 family impossible. The register and word-boundary assumption matter.

## Independent controls, software, and decision

The [complete read-only CommonJS Node22 SFT](../sims/lp2_wordlocal_fullpattern_crossfit_sft.cjs) asserts original rune alignment, all 12 held-out Monte Carlo comparison counts, exact GP/Latin lexicon lower bounds, the complete secret-alphabet cipher-replay constructions on original 12,956 ciphertext positions, and a separate *independent genuine native donor* positive: generate 2,893 complete native GP words, permute all 29 alphabet positions independently for every of their five word phases, decrypt and verify each planted word and original-sensitive invariant.

Windows Node22 [first original-cipher CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45088695709) and [expanded exact original-word inverse CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45088919093). A frozen workflow is [here](../.github/workflows/agent2-wordphase-fullpattern-crossfit.yml).

**Next decryption decision:** Retire treating independently per-word-fitted 5-phase substitutions as evidence of a solution, however many dictionary words they appear to recover. Prefer a separately visible p7 original five-word key *operation*, an inter-word recurrence with independent predictions on untouched body text, or a preserved external original instruction, with a real native plaintext passage recoverable under one shared rule. The exact m4 conditional low likelihood weakens that alternative enough to justify focusing on m5 or a different class, **without claiming to have determined the creator's algorithm**. Neither random donor p-values nor synthetic exact replay authenticates unknown plaintext.
