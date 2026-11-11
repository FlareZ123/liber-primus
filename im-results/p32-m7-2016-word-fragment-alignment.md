# p32 M7 word-address gates: source tokenization and pole traversal

**Status: source-input correction, 11 November 2026.** The previously reported seven-word M7 extraction and 30/32 fragment alignment have **no valid p32 word-address premise**. The original 32-fragment boundaries and the historical 2016 message remain real inputs; the claimed bridge between them was introduced by a transcription parser defect. No unknown LP2 plaintext or key was recovered.

## Decisive source correction

The original physical p32 JPEG (`resources/liber-primus/49.jpg`) has **121 runes in 22 page-local word fragments**, of which **21 are whole canonical words wholly contained on p32**. The initial single-rune `L` is the last rune of canonical `EAMOL` (GP-prime sum **260**), whose three preceding runes are on physical p31; its isolated page-local sum **73** is a **fragment sum**, not a whole-word sum. The first page-local sentence ends after **7 fragments / 33 runes**. The authoritative source parser `sims/lp2_word_pages.cjs` preserves both typographical line wrapping and the p31→p32 word carry. If a page-reset word address includes the first `L` as a separate token, that reset is an extra premise requiring source support.

The earlier `sims/p32_m7_2016_word_fragment_alignment.cjs` instead used `.replace(/\//g,'')` followed by `match(/[\u16A0-\u16FF]+/gu)`. The slash disappeared but the newline survived, so four words were falsely split into two. Both variants still total 121 runes, obscuring the defect in rune-count-only checks.

| Legacy line-split pieces | Correct complete p32 printed word | Correct one-based ordinal |
| --- | --- | ---: |
| `NGBEOIA` + `LA` | `NGBEOIALA` | 9 |
| `WBSRXIAX` + `A` | `WBSRXIAXA` | 12 |
| `OENGO` + `MBUDS` | `OENGOMBUDS` | 16 |
| `UT` + `FJT` | `UTFJT` | 21 |

The table's ordinals 9, 12, 16 and 21 are page-local segment ordinals. Since segment 1 is the incoming carry, the corresponding complete word-start ordinals are 8, 11, 15 and 20.

Those four false splits made the earlier script report **26 line-fragment tokens**. The corrected p32 page-local parse has **22 segments**, including one incoming carry and only **21 complete word starts**. The frozen M7 cycle `13,24,19,3,6,20,17` attempts to read **p32 segment 24, which does not exist** (and is also outside the 21 complete word starts). It cannot be repaired by silently taking a different phase, changing index bases, wrapping 24 modulo 22 or 21, or retuning the cycle after inspecting message outputs.

## Independent p55 W / p57 LIKE / p32 M7-pole test

A later, narrower candidate does not rely on the retired 26-piece parse. The three consecutive **page-local** p55 word sums **[138,108,341]** yield φ(108)=36≡**7** (mod 29), the GP index of **W**. The p32 page-local fragment **#12** is **WBSRXIAXA**, whose sum **442≡7** (mod 29); it is the **11th complete word wholly on p32**. This hits the pole x=7 of the already proposed projectivity **M7(x)=(14x+25)/(25x+28) mod 29**, because its denominator is zero at x=7. Solved p57's first body word **LICE** (conventionally “LIKE”) has GP-prime sum **184**, equal to p32 page-local segment #6 **IARTTHF** (complete word-start #5). Those identities are exact source arithmetic, and the choice to compose them into a route is interpretive.

The M7 orbit passing through these claimed anchors is **10→8→2→7→∞→11→16→10**. However, the **22 source page-local p32 fragment sums** modulo29 are:

`[15,9,6,4,17,10,14,18,23,13,9,7,22,4,15,11,11,0,9,0,15,13]`.

There is **no p32 fragment with residue 8, 2, or 16**; infinity is likewise not an original printed word. From the p57 LIKE/p32 IARTTHF anchor at residue10, the forward orbit immediately demands **8**, and the inverse orbit immediately demands **16**. From the W/pole anchor 7, forward demands infinity and inverse demands **2**. Thus neither orientation provides a total p32 **page-fragment-to-page-fragment traversal**, even if the one-rune p31 carry is counted as an independent page-local token. It could still be a route through a **separately identified nonword state space**, but no original artifact yet identifies absent residues as image positions or defines how to read ciphertext from them.

The 184 equality is **not unique across the manuscript**: among the 2,896 canonical unresolved words, **10** have sum184, located wholly on physical pages **1,15,18,20,29,32,33,38,40,44**. This is an empirical base-rate control, not a proof that the p32/p57 match is accidental. The word-sum pole is a clue-level coincidence unless an independent source supplies a readout for absent states. Reproduction: [p32 pole and cross-page gate](../sims/p32_m7_pole_wordmap_gate.cjs).

## Exact scope of the retired interpretation

The old script picked seven fragments using the invalid 26-token sequence. Their prime sums `[345,62,277,267,184,98,160]` and signed-2016 message projections `THEROADMAPPATHEPIPHANYTHEIRARE` (30 letters) / `DIRECTIONARESEEKSPATHSLIESTHEAND` (32 letters) remain reproducible **only under that erroneous source tokenization**. Therefore the attractive match to 30 nonempty and 32 total thirteen-dot-delimited full-text fragments, including the `NE` letters at the two empty positions, is not a source-constrained LP2 operation. Treat it as a conditional artifact of invalid addresses.

The algebraic overlap-matrix result itself remains correct **under the frozen legacy partition strings**: partitioning one chronological stream into two sets of contiguous intervals yields the same chronological fragment order in both row-major and column-major occupied-cell readings. It cannot produce a nontrivial permutation. The separate source facts of 31 thirteen-dot marks, 32 fragments and two empty fragments are unaffected by this p32 correction.

## Reproduction and next research decision

`node sims/p32_m7_2016_word_fragment_alignment.cjs` now asserts both the **correct 22-segment / 121-rune page-local parse (21 complete word starts)** source parser and the **legacy 26-token / 121-rune** error, explicitly labels its old numerical output `RETIRED`, and identifies the out-of-range word ordinal. Future M7/2016 routes must start from an independent original clue selecting **valid complete p32 word starts or an independently source-selected page-local segment address or another non-word operation**, with frozen indices before any message-word extraction. Do not cite this 30/32 alignment as evidence of a plaintext key, intended solve path, or fragment permutation.
