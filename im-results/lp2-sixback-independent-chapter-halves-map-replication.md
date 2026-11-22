# The same six-back affine operator wins independently on both LP2 halves

**Agent 9, 18 November 2026. Source-only reproducible cryptanalytic structural result, without plaintext recovery.** Original GP29 ciphertext independently selects the same unique invertible affine six-back map on two disjoint near-equal halves. This is a sharper self-replication of a previously observed 80-hit source pattern, not a newly authenticated cipher key. Windows/Node22 [source SFT](../sims/lp2_sixback_independent_halves_original_sft.cjs) passed [manual CI run 44282325605](https://github.com/FlareZ123/liber-primus/actions/runs/44282325605).

## The question and frozen source split

Existing source-exact research identified an unusual original word-internal sixth-back relation `C[j] = 27*C[j-6]+24 mod29`, **80 hits out of 1,290** eligible, as the *single best map among all 812 invertible GP29 affine maps*. It remains possible that the map is peculiar to one illustration family, chosen by one long section's accidental vocabulary or selected through the full-book search. A more revealing test asks whether each of two disjoint source blocks **independently** selects that same full map before it can see the other block's symbol pairs.

Use exactly the source-original **2,896 complete printed words / 12,956 unknown-runic ciphertext symbols**. Do not split page-spanning printed words. Assign each whole word by its starting rune-bearing page to either (a) physical **p0–26**, the first five illustration chapters, or (b) physical **p27–55**, the remaining four chapters; runeless physical p50 carries no word. A short number of words cross ordinary page boundaries, but **no word or six-back observation belongs to both groups**. The partition has almost equal six-back sample counts (**647 and 643**) and is natural to the source's nine illustrated chapters. The split was chosen **after** earlier full-book T6 discovery. It is not a preregistered unseen-data trial.

For each half separately, construct the directed `29×29` lag-six contingency table and compute every score

```
H[a,b] = sum over x=0..28 of count[(C[j-6]=x) AND (C[j]=(a*x+b) mod29)]
```

for all **812** invertible `a=1..28, b=0..28`. Allow ties; never give the already-seen `(27,24)` map a scoring advantage.

## Exact original outcome

| Independent original words | Eligible pairs | Global winner among 812 | Hits | Runner-up |
| --- | ---: | --- | ---: | ---: |
| p0–26 | **647** | **(27,24)**, unique | **40** | 36 |
| p27–55 | **643** | **(27,24)**, unique | **40** | 37 |
| Whole manuscript | **1,290** | **(27,24)** | **80** | Not independently reselected |

The shared transformation is `T(x) = 27x+24 mod29`. It has a single fixed symbol `x=8` (GP `H`) and one **28-element cycle** over the other symbols. This exact algebra is useful for evaluating source-selected rotor or repair models. The tempting interpretation of `H` as an author-chosen interrupter **is a hypothesis**, since the map itself was originally discovered from these ciphertext pairs.

**Fixed-point ablation, a targeted model discriminator:** Exclude *every* six-back comparison whose earlier rune is H (GP index8, the unique fixed point of this T), then independently reselect all 812 maps in both halves. This retains **624** and **619** source comparisons. The very same `(27,24)` remains **uniquely first in both halves**, now at **39/624** and **39/619**. Of the original 80 T6 successes, just **2** were H→H; 78 are mappings of distinct GP symbols within the 28-cycle. Thus an unusually common H repeated six positions later is **not sufficient** to explain the shared map. This ablation was performed *after* the full-book map and split were observed, and is a transparent necessary-consistency check rather than independent significance evidence. The revised original-input SFT asserts the H-excluded winners and reports their exact counts.


## Exact-word constrained null with full family reselection

Each synthetic book independently **permutes the rune order within every original word of length at least seven**, preserving that word's entire **29-symbol multiset**, printed length, start-page assignment, and **exact count of adjacent equal runes**. Shorter words contribute zero six-back comparisons and remain untouched. Only permutations with the original word's local adjacent repeat count are accepted. This deliberately preserves the manuscript's unusual word-level symbol repetition and suppression of immediate doublets, while destroying specific six-position order within words. It does not preserve the full per-page ordered-bigram table; the [separate exact-bigram Euler-trail null](lp2-original-lagfive-conditional-page-markov-gate.md) is a stricter test for a different question.

Each one of **5,000** deterministic seeded synthetic books independently reselects **all 812 maps in both halves**, records both winner sets **including ties**, and asks if their intersection is nonempty. Seed: `0x1f3ed330`. The result:

| Statistic | Observed original | 5,000 constrained randomizations |
| --- | --- | ---: |
| Same winning affine map in both halves | **Yes, each uniquely (27,24)** | **14** books, including tie cases |
| A common winning map **with score at least 40 in each half** | **Yes** | **0** books |
| First-half winner reaches 40 | Yes | 1,249 books |
| Second-half winner reaches 40 | Yes | 1,148 books |
| Mean of first-half independently maximized score | **40** | **38.4072** |
| Mean of second-half independently maximized score | **40** | **38.2112** |

The conditional plus-one upper-tail estimates are **15/5,001 = 0.0029994** for *any* shared winner, counting source null ties permissively, and **1/5,001 = 0.00019996** for the additional observed **40/40** condition. The source already selected lag six and the affine family through earlier exploration, and this split was examined after the global map was known. These are **within-family null diagnostics**, not an unconditional discovery-adjusted probability or proof of a hidden rule.

**Mechanism-positive control:** A 12,956-symbol synthetic manuscript using the exact source word-length and half assignments, with independent random six-rune word prefixes followed by `C[j]=T(C[j-6])` within each word, recovers **the planted (27,24) operator uniquely in both halves**, each perfectly matching all its **647/643** six-back opportunities. The program asserts this positive, the complete original source/corpus alignment, and the two unique real winning maps before sampling its null.

## Decision toward original plaintext

The shared full-map winner across near-equal disjoint source halves is stronger evidence for a *book-wide* six-back operator or a broadly shared output-register effect than the earlier global 80-hit maximum alone. It has no verified mapping from original ciphertext to English, no source-authored operation selector, and no proof that the 80 relations are explicitly cipher-generated. Source-native morphological or transcription phenomena remain potential competing explanations outside the word-shuffle null.

The most direct testable interpretation is a **conditional six-back output repair**, in which the ordinary ciphertext generator normally emits some base rune, but on a creator-selected collision/state event emits `T(C[j-6])`. The [prior exact inverse ambiguity study](../sims/lp2_sixback_original_inverse_sft.cjs) found **79** nondegenerate positions where this possibility cannot be distinguished from an ordinary emission by ciphertext alone. A real advance now requires an **original clue specifying those hidden repair decisions or the base keystream**, followed by a coherent held-out plaintext. Repeating broad unconstrained affine sweeps or promoting the fixed H as an author key is unwarranted.

**Reproduce:** [CommonJS original SFT](../sims/lp2_sixback_independent_halves_original_sft.cjs) · [Passing Windows Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/44282325605) · [Original full-book conditional structural benchmark](lp2-original-lagfive-conditional-page-markov-gate.md).

**Classification:** experimentally supported original-cipher structural regularity under stated null and retrospective selection. **No unknown LP2 plaintext, verified key, complete inverse, or final destination recovered.**
