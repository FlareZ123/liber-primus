# Exact first-order ciphertext-state row-codebook capacity

**Original-source, any-secret-table decision (13 November 2026, Agent31).** No plaintext or historical key is recovered. The 12,956 original unsolved LP2 runes contain 12,901 consecutive **within-physical-page** ciphertext pairs. Their fixed 29×29 transition matrix imposes a key-independent upper bound on how often *any* group of native GP29 or uncontracted Latin26 plaintext symbols could occur under a complete stationary, first-order **previous-ciphertext-state decoder**. All original-layout native-English control windows violate the GP29 bound for book-global, nine-visual-chapter-local and eight-phase codebooks; all uncontracted Latin26 controls violate the book-global bound. This is a finite control-family exclusion conditional on full row encodability, source word/rune order and plaintext register.

## Reversible family and exact all-secret theorem

Let `C_i` denote the unmodified original GP29 rune at a position with known original page-local predecessor `C_(i-1)`. Consider a lossless decipherment family

```
P_i = D_{s(i), C_(i-1)}(C_i)
```

where `s(i)` is a **precommitted** book-global, printed visual chapter, or eight-position clock state, and each `D` is an **arbitrary secret**, stationary, deterministic table from the 29 ciphertext symbols to a fixed plaintext alphabet of `A∈{26,29}` symbols. Each of the A plaintext symbols must be encodable at every reachable state, so every table is **surjective**. This permits homophonic output: for Latin26, three of the 29 ciphertext outcomes may be assigned as extra outputs for some letters. All table entries may be independently secret and have no arithmetic regularity.

For any chosen set `S` of `k` plaintext symbols, surjectivity requires at least `A−k` different ciphertext outcomes reserved for the other plaintext symbols. Therefore no more than `k+(29−A)` of the 29 ciphertext outcomes can map into `S` in one state. Let `M_t(a,b)` count actual observed, page-local `(C_(i−1)=a,C_i=b)` pairs in clock state `t`. Sort each row's 29 counts in descending order. For **every possible secret table** and **every choice of S**, the total decoded frequency obeys

```
count(P_i in S) <= B_A(k)
B_A(k) = sum over all t,a of the largest [k+29-A] counts in M_t(a,*)
```

The formula grants the cipher a different optimal assignment in every state and for each proposed group of k letters. It is deliberately favorable to the cipher, as the maximizing assignments for different groups need not be consistent with one another. It is an exact computational upper bound with zero key search. At source page-initial positions, the previous rune is unspecified; we exclude those **55 symbols** from both the source transition matrix and all controls. The runeless physical p50 supplies no cipher symbols.

**Family boundary:** State can be the immediately preceding printed ciphertext rune, plus the specified *public* book/chapter/phase clock. Each table must encode the complete fixed A-letter alphabet. This result does not constrain a page-varying secret alphabet, additional hidden keystream, previous-two-rune history, syntax-conditioned rules, restricted per-state alphabets with external side information, unprinted plaintext boundaries, or radically different plaintext register. It is an exact exclusion under these assumptions, rather than a claim about all cipher mechanisms.

## Frozen original source and capacity

Source: `resources/liber-primus/lp2-corpus.json`, physical p0–p55, 55 rune-bearing pages, 12,956 runes, exactly 12,901 eligible within-page transitions. The visual chapters are source-fixed as pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, and 54–55, previously recorded in `workplace/integrated-original-inversion-challenge.md`. Eight phases are `(page-local rune index−1) mod8`, with page-first excluded. No phase origin is inferred from decoded output.

| Independent secret row-table clock | State/preceding-rune rows | GP29 top1 | GP29 top5 | Latin26 top4 | Latin26 top5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| One book-wide table | 29 | **714** | 3,135 | **4,232** | **4,759** |
| Separate tables for nine visual chapters | 261 | **1,255** | **4,811** | 6,194 | 6,819 |
| Separate tables for eight page-local phases | 232 | **1,216** | **4,767** | 6,177 | 6,817 |
| Separate tables for chapter×eight-phase | 2,014 | 3,040 | 9,829 | 11,499 | 12,004 |
| Separate tables for every printed page | 1,590 | 2,735 | 9,169 | 11,259 | 11,930 |

These upper bounds permit every secret alphabet assignment; extra state increases the available capacity. The chapter×phase and page-row cases are shown to prevent overinterpreting the book-level exclusion. A capacity **above** a natural-English frequency is necessary but does not imply an actual table can encrypt/decrypt that control word sequence.

## Original-layout English controls and decisive violations

Independently heldout text from `resources/control/shakespeare_first300k.txt`, `gibran_prophet_58585.txt` and `emerson_essays_2944.txt` is encoded twice: source-calibrated native GP29 (the empirically attested `ING→ᛝ` and `IO→ᛡ` are single runes) and uncontracted Latin26 letters. Contiguous control windows contain the original 12,956 symbols, sampled with fixed stride 6,478. Each window receives the **identical original 55 page lengths**, with the first symbol of each page removed from counting. For each control, we select its most frequent one, four, or five symbols *after* its counts are computed; the theorem applies to **any** group, so choosing each strongest group does not tune the cipher.

| Corpus | GP29 windows | Minimum top1 GP29 | Minimum top5 GP29 | Latin26 windows | Minimum top4 Latin26 | Minimum top5 Latin26 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | 32 | 1,419 | 5,134 | 34 | 4,482 | 5,337 |
| Gibran | 8 | 1,438 | 5,214 | 9 | 4,715 | 5,633 |
| Emerson | 48 | 1,503 | 5,343 | 51 | 4,778 | 5,743 |
| **Source upper bound, book-global** | | **714** | **3,135** | | **4,232** | **4,759** |
| **Source upper bound, GP29 chapter-local** | | **1,255** | **4,811** | | | |

**All 88 native GP29 controls** violate the strongest single-letter upper bound for both book-global and individually-secret visual-chapter (as well as eight-phase) tables. Their top-five frequencies also exceed the optimistic chapter and eight-phase row capacities. **All 94 Latin26 controls** violate the book-global top-four and top-five capacities. A first-order 26→29 decoder can use homophones and thereby evade the *single letter* bound, but cannot overcome the 4- and 5-letter capacity violations without further state or another type of mechanism.

Unlike a heuristic language score, no choice of the forbidden secret tables can reproduce these control distributions with the unmodified original ciphertext. The result does not exclude an unknown original plaintext whose statistics differ enough from these finite corpora. Repeated-key and step-zero marker tests in [the predecessor investigation](lp2-latin26-wordlength-repeat-K-marker-hypothesis.md) are strictly weaker than this all-secret bound for complete static first-order row codebooks.

## Exact public-phase clock envelope

The unmodified source admits a second, stricter question: what if the author intended a **short, page-local, public rune-index phase clock** with a separate arbitrary, complete secret row codebook for each phase? For each fixed period `T=1,…,20` the same exact row upper bound was applied to **all group sizes k from 1 through A**, independently for every one of the 88 GP29 and 94 Latin26 control windows. A control survives the *necessary frequency conditions* only if its highest-ranked k-letter total is within capacity for **every k**. Surviving the envelope does not construct a consistent table or prove an authentic plaintext.

| Fixed page-local period | GP29 control windows satisfying every bound, out of 88 | Latin26 windows satisfying every bound, out of 94 |
| --- | ---: | ---: |
| 1–8 | **0** at every period | **0** at every period |
| 9 | 0 | **14** |
| 10 | 0 | **77** |
| 11–12 | 0 at both periods | **94** at both periods |
| 13 | **2** | 94 |
| 14 | 14 | 94 |
| 15 | 42 | 94 |
| 16 | 50 | 94 |
| 17 | 78 | 94 |
| 18 | 86 | 94 |
| 20 | 88 | 94 |

This supplies an original-cipher-state **complexity lower bound** against the pinned English register: an unrestricted **GP29** previous-ciphertext row-codebook with a page-local period of **12 or less** cannot fit any of the 88 windows even by an optimistic letter-inventory allocation; for **Latin26**, every period of **eight or less** fails all 94 windows. First inventory survivors are **T=13 for GP29 (2/88)** and **T=9 for Latin26 (14/94)**. Period 13 is numerically near Cicada's frequent thirteen-mark imagery, but that **does not authenticate a 13-phase encryption**, and 86/88 native GP controls still fail the necessary test at T13. A secret page-specific key or additional, independently advancing state can evade these bounds.

## Independent correctness controls and continuation

The SFT `sims/lp2_firstorder_row_capacity_sft.cjs` asserts the complete source matrix and capacities, the original-layout windows, and every reported inequality. It also constructs independent native-GP29 and Latin26 **positive plants** of 12,956 plaintext symbols each, using the fully reversible 29-state row injection `C_i=(11P_i+7C_(i−1)) mod29` with per-page starting state7, and exact inverse `P_i=8(C_i−7C_(i−1)) mod29`. Every symbol round-trips; both plants automatically satisfy the computed row-capacity theorem. A correct implementation therefore accepts genuine members of the family while rejecting the incompatible original distribution.

**Verified executable result:** [manual Node.js 22 GitHub Actions run 43409436466](https://github.com/FlareZ123/liber-primus/actions/runs/43409436466), successful with full positive controls and original input. The no-key-search upper bound is analytical; CI is the executable arithmetic check.

**Research decision:** a *complete first-order cipher-state-only stationary table*, even one with different all-secret substitutions in each of the nine observed visual chapters or eight page-local phases, is a poor route to ordinary source-native GP English. Latin26 is already incompatible with a single book-wide codebook against these original-layout controls. Further table/key sweeps in these families cannot remove the proven source-control count mismatch; a new original clue must identify changing state, additional history, a distinct plaintext register, or a different inverse before such work is warranted. The puzzle remains unsolved.
