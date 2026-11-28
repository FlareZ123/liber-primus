# LP2 Atbash-of-predecessor marker: key-independent original-cipher exclusion

**Agent8, 28 November 2026.** **Decision:** a fully reversible and simple GP29 ciphertext-feedback family using the historically authentic **Atbash** operator to select the *previous-plaintext-dependent* repeat marker does **not** explain the original LP2 ciphertext as a direct continuous native-GP English text in either of the pinned independently supplied literary registers. The exclusion holds for **every changing, arbitrary, nonzero multiplicative key** in this precise class, without scoring any recovered plaintext, fitting a phase or assuming that manuscript printed words are genuine plaintext word breaks. **No unknown LP2 prose, key or destination recovered.**

## An independently motivated evolving exception law

Cicada's solved earlier passages genuinely employ the 29-rune Atbash reversal, `A(x)=28−x` with GP29 values `0..28`. Separately, the 12,956 original LP2 pp0–55 ciphertext runes have only 86 immediate identical pairs over 12,901 within-physical-page transitions. A simple human-applicable way to avoid a *globally fixed plaintext exception rune* is to define the zero-cipher-step symbol as the Atbash of the immediately **preceding plaintext** rune.

Consider the exact source-motivated, **new and unselected** architecture

```text
C[0] = P[0]
C[i] = C[i−1] + k[i] · (P[i] − (28 − P[i−1])) (mod 29)
k[i] ∈ {1,…,28}, for every i>=1.
```

Atbash is an authentic historical operator; the decision to place it on the previous plaintext, combine it with feedback this way, initialize with `C[0]=P[0]`, or allow any `k` is **not** in a first-party LP2 instruction. This is intentionally one bounded, falsifiable proposal rather than an exhaustive moving-marker search.

Because `k[i]` is invertible in the prime field, **for every possible secret key stream** the repeat condition is exact:

```text
C[i] == C[i−1]    ⟺    P[i] + P[i−1] == 28 (as GP29 integers).
```

For `k=1`, the inverse is `P[i]=C[i]−C[i−1]+28−P[i−1] mod29`. Other invertible `k[i]` change the nonzero symbols, **not** the zero-step event sites. This invariant does not care about printed hyphens, source words or punctuation at all: it applies to the entire runic plaintext stream, although physical page seams are excluded from the *count comparison* to match the original 12,901 opportunities.

## Exact source-native original test and language controls

Use the unchanged canonical p0–55 indices and the project's source-native GP tokenization (TH,NG,EO,OE,AE,IA,EA; solved `ING→NG`, `IO→IA`, K/C, V/U, Z/S). From the solved LP1 source use sections1,3,5,6,9–15, rejecting editorial continuation duplications; from the 2019 Gutenberg *Prophet* control retain only the **actual book interior** between its `START/END OF THIS PROJECT GUTENBERG EBOOK` markers (not its long legal license). No source tuning or ciphertext-derived key choice.

| Independently fixed source/control | Native GP29 runes | Atbash-adjacent pairs | Interpretation |
| --- | ---: | ---: | --- |
| Original unknown LP2 p0–55 cipher | **12,956** | **86 identical ciphertext pairs** on 12,901 same-page edges | Under candidate, **requires exactly 86** plaintext Atbash-adjacent pairs on those edges |
| Already solved Cicada reference | 2,648 | 82 Atbash-adjacent pairs in 2,647 consecutive edges | 3.098% of native-GP prose edges |
| Gibran *The Prophet*, Gutenberg book interior | 47,629 | 1,193 Atbash-adjacent pairs in 47,628 consecutive edges | 2.505% of native-GP prose edges |
| **Every contiguous 12,956-rune Gibran control window** | 34,674 windows, omitting the same 54 physical-page seam offsets within each | **minimum 285, mean 320.287, maximum 359** native Atbash pairs in 12,901 eligible edges | **0/34,674** full-length source windows has the required ≤86 events |

The full-window search is exact, not an iid random sample: all 34,674 overlapping start positions are evaluated with the **54 real original page-seam offsets** removed from each donor. The original physical p50 is rune-free and produces no extra seam; treating its zero-rune boundary twice would be an error. The source-native donor minimum **285** exceeds original **86** by 199 fixed event obligations. This rejects all residual nonzero-key schedules in the direct Atbash-predecessor model for each of these **finite authentic/literary comparison streams**. Overlapping source windows are correlated: `0/34,674` is not a model-independent statistical p-value, and other intentional registers, rune reorderings or an additional outer transform could escape it.

The `k=1` algebraic inverse reencrypts **all 12,956 original GP ciphertext runes exactly** and necessarily has 86 native-Atbash pair sites, but its resulting IoC is about **0.03445969**, not readable GP-native text. This round trip is **not** plaintext recovery. A separate planted native-GP passage is encrypted/decrypted exactly and its zero-step sites reproduce the required plaintext Atbash pairs.

**Scope and decision:** The source-authored *Atbash* itself is **not** evidence the author selected this feedback architecture. The experiment nevertheless closes a clear, small, source-led evolving-marker possibility, unlike the already rejected fixed-F mechanism and the separate p15 time-periodic Fibonacci-prime marker. Since the zero-step invariant is independent of all nonzero multipliers **and of printed word-break truth**, additional Vigenère key/phase/permutation sweeps cannot rescue this exact architecture on source-native direct prose. The unresolved alternatives are a different prior-state marker rule, extra layer/non-GP plaintext, lossy or variable-length transport, or authentic key/receiver material yet to be found; there is no justification for enlarging this already-failed model by tuned exceptions.

[Self-contained source-exact SFT](../sims/lp2_atbash_previous_plaintext_marker_gate_sft.cjs) reads the canonical original corpus, solved GP source, and independent pinned Gibran control; its mathematical counts and complete-window computation were executed independently in the live V8 analysis runtime. The standalone Node22 wrapper has not been separately run under CI. Related independent scopes: [fixed literal-F zero-step word-pattern gate](lp2_gp29_fzero_two_word_source_invariant.md), [time-periodic Fibonacci-prime evolving marker](lp2-fibprime-evolving-marker-original-source-gate.md), and [overall cryptanalytic constraints](../results/README.md).

