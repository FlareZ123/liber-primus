# LP2 p28–p31: original-player clue and prime-length inverse gate

**Scope:** Director issue #946; Agent 2; 14 November 2026. **Classification:** source-verified original-page geometry, provisional clue interpretation, and a bounded fixed-key-reuse negative. **No recovered plaintext, authenticated key, cipher, or final destination.**

## What a 2014 player can actually see

The four consecutive source JPEGs are **45.jpg–48.jpg**, physical LP2 **p28–p31**, after the wing page p27 (44.jpg) and before the tree page p32 (49.jpg). The original full-resolution images show four ordinary, evenly set **12-line** black rune text blocks, with minor punctuation and no page-local diagram, large numeral, visibly red heading/rune, singled-out key word, or direction instruction. Word spaces, printed line breaks, and page boundaries are visible. The adjacent wing/tree drawings could mark a narrative grouping, but they specify no rune operation.

This source-only reading was frozen **before** surveying preexisting speculative route files. It yields two ideas at most:

1. **Prime-run page geometry.** Counting runes gives p28=**269**, p29=**277**, p30=**263**, p31=**269**. All four counts are prime, and no other original p0–p55 four-page window consists entirely of prime lengths. The outer pages are exactly equal in count. In the relevant source-visible puzzle tradition, prime numbers invite attention, but there is no printed instruction here to *count* runes, choose a modular stride, use page length as a key, or apply the p56 totient cipher. A pure prime-length transposition cannot turn these near-uniform rune histograms into ordinary GP prose, because it preserves each histogram.
2. **Line beginnings/ends.** The four pages offer 4×12 visible line openings or endings, but the starts themselves are ordinary runes, with no contrasting ink, arrow, numbering, repeated geometric guide, or evidence that an acrostic is intended. A reader can construct numerous line-order, column-order and forward/backward pickups, none independently selected. We therefore did not tune them against the ciphertext.

The first idea suggests one sharply defined, modest original-cipher check. An **identical additive GP29 keystream** reused with an unchanged rune index clock on equal-length p28 and p31 would cancel in the page difference:
\[
C_{28,i}=P_{28,i}+K_i\pmod{29},\quad C_{31,i}=P_{31,i}+K_i\pmod{29},\quad C_{28,i}-C_{31,i}=P_{28,i}-P_{31,i}\pmod{29}.
\]
This uses the known historical GP29 additive family as a *conditional comparison*, not a claim that the authors selected that family or reused its key.

## Exact original-cipher gate

- Canonical source: [original LP2 image mapping](../resources/liber-primus/README.md), [rune-index arrays](../resources/liber-primus/lp2-corpus.json), [printed text lines](../resources/liber-primus/lp2-transcription.txt), and [original clear native-GP LP1 transcription](../resources/transcriptions/lp1_wulfic_canonical.txt).
- **Prime-length run:** among p0–p55 the only consecutive four-page window with all four rune counts prime is **p28–p31**. The count vector is [269,277,263,269]; both p28 and p31 have **zero adjacent repeated runes**, p29 has four and p30 two.
- **Selection-aware comparator:** of the 35 original **12-line physical pages**, 11 have a prime rune count. Under the explicitly hypothetical null that those **11 prime-count labels** are uniformly reassigned among the **same 35 12-line page positions**, the exact probability that preselected p28–p31 are all prime is **0.006302521**. Allowing *any* four physically consecutive eligible pages to attract attention raises the exact probability to **0.063943178**. This preserves the page-layout eligibility mask but not source chapter dependence or the page-count distribution; it is a selection-bias calibration, **not** a probability of Cicada intent.
- **Exact fixed-clock equality sites:** p28 and p31 agree only at zero-based rune positions [1,7,44,96,248,253], **6/269**. The GP29 difference histogram, residues 0–28, is [6,10,6,5,8,11,13,6,10,14,7,8,9,12,12,10,10,8,10,9,6,9,8,16,3,9,11,11,12]; Pearson chi-square against uniform is **24.5576208** (28 d.f., upper-tail approximately 0.652). The 229-position development interval has four equalities; the disjoint final 40-position descriptive interval has two. Neither interval is a decrypted-plaintext holdout.
- **Source-native language calibration:** six first-party clear GP source groups [3,8,9,10,11,14] contain 1,001 genuine GP glyphs, preserving original ING/IO orthography. Their pooled single-rune collision probability is **0.060234471**, predicting about **16.20** equalities in 269 independent GP-native prose positions under identical keystream cancellation. A simple independent-position binomial benchmark places **6 or fewer** at **0.00283585**. Native positions are not i.i.d. and the first-party samples have language/topic variation, so this is a bounded discriminator rather than a calibrated historical cipher likelihood.
- **Planted positive control:** two disjoint 269-rune original clear-GP source windows, encrypted under the *same* explicit deterministic additive key (17i+3) mod29, cancel algebraically and have **21/269** direct matches. This tests the implementation and source encoding, not the historical key.

**Result:** The original equal-length p28/p31 pairing is inconsistent with the simplest identical-global-keystream/no-bypass additive GP29 model if both unknown plaintexts have the independently observed native-GP English frequency register. A page-specific offset, plaintext-F key-clock skipping, changing state, nonadditive cipher or different underlying plaintext register is outside this gate. Retuning offsets or operations until a promising score emerges would remove the only original-source motivation.

## 18 November follow-up: the missing selector is now supplied by the p57/p50 route

The original conclusion above was correct for the page range in isolation: pp28–31 do not print their own operation. A later independent source route now changes the selection diagnosis.

Solved p57 reconstructs the p50 nested prime-count bracket under canonical GP0 word-sum addressing. In that same frozen mapping, `PARABLE → FIND → 28`, where the table token at FIND's address decodes to28 in both base59 and base60. The 2014 source distribution names LP2 files `0.jpg` through `57.jpg`, so `28` is a player-visible page identifier rather than a repository-only label.

This supplies a coherent **candidate** selection of physical p28. A later independent replication of the same GP0→table grammar gives byte28 a more tightly typed receiver as **p27 rune offset28**, because p27 is already selected by the historical `prime_echo` duplicate-word handoff. The p28 reading therefore remains secondary rather than uniquely forced. Its already-established rune count is **269**. The p50 bracket independently selects prime counting through `44=π(193)` and `46=π(201)`; applying the same operation gives **π(269)=57**, returning to the solved p57 instruction page. The whole unique prime-length run maps as `[269,277,263,269] → [57,59,56,57]`.

Conditioned on the page-number interpretation, this resolves the earlier **page/operation selector** blocker for the p28 count. The stronger current receiver for byte28 is p27:28, so the p28 loop is corroborative structure rather than the primary route. It does **not** supply a reversible cipher for the 269 p28 runes. The fixed-keystream negative in this document remains valid and should not be rerun. Further p28 decryption work still requires a source-selected reversible operation beyond “count the runes and take π.”

The consolidated current route is documented in [the p57/p50 bridge report](../im-results/lp2-p57-divinity-p50-center13-bridge.md) and reproduced by [its CommonJS SFT](../sims/lp2_p57_divinity_p50_center13_bridge_sft.cjs).

## Why this is still not a decoder

The new p57/p50 route now authorizes selecting p28 and applying π to its rune count. It still supplies no key values or reversible rune transformation for the 269 ciphertext glyphs. The earlier identical-keystream test remains a bounded negative and does not become a decoder because the page selection improved.

**Decision:** Preserve the prime-length anomaly as a secondary p57→p50→p28→p57 closure under the page-number reading of byte28. Continue to reject arbitrary prime-step transpositions, page-offset sweeps, and key schedules unless a further source instruction fixes a reversible operation on the p28 ciphertext.

**Reproduce:** [single-file original-corpus SFT](../sims/lp2_p28_p31_prime_length_sft.cjs). Run it with Node.js from the repository root. The SFT checks the complete p0–p55 page lengths, correct runeless p50 transcription offset, 12-line eligibility, exact permutation null, frozen difference sites, native GP frequency calibration and planted common-key positive control. It passed on original repository inputs with Node 22 / Windows in [manual CI run 43645516931](https://github.com/FlareZ123/liber-primus/actions/runs/43645516931) (job step 5).
