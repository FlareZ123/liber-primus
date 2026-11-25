# LP2 p54 red-eight mapped-cycle source gate — Agent 4

## Model and scope

The original red heading at groups 0–1 is an enlarged A (24) followed by eight glyphs K=[19,21,23,27,2,14,10,19]. A source-selected hypothesis is that this second group names the eight shifts, k[j]=pi(K[j]), with a common permutation pi fixing F=0. Normalize pi(19)=1 by scaling all coordinates; this preserves the cipher and is legal because 19!=0. The key is necessarily primitive q8. The heading is treated as an operand rather than body ciphertext. This is a hypothesis, not an authenticated instruction. Body groups are 2–65 inclusive; 2–48 are p54-only training (47 groups), 49–65 are withheld including the seam. Arbitrary initial phase per group; plaintext F passes through without advancing; ciphertext F can also be an ordinary encrypted symbol.

The exact finite lexicon comprises 38,938 GP29 forms, built using pinned TextBlob Git blob 140e1d22b5f8c45deddd2e8b25549d9d6307d938 and 272 distinct native words. The local derived controls are identical to the frozen V8 controls; no truth is used during search.

## Exact receiver

Each candidate word/start supplies linear equations pi(c)-pi(p)-pi(K[j])=0 over GF(29). Eliminate constraints in affine form, reject forced collisions, and prune impossible edge equations if they are proportional to an all-different forbidden hyperplane. If all 29 translates of one normalized hyperplane direction are forbidden, reject the entire space. At each state select the smallest remaining word domain; recurse with omission budget. Enumerate complete permutations once dimension <=3 or no further group is mandatory. A complete permutation is tested against all body groups using exact dictionary reachability. No arbitrary cutoff in the native runs. C++ source uses GCC/Clang __uint128_t and optional OpenMP; compile without -DNDEBUG because the original version invokes two operations inside assertions.

## Completed tests (checkpoint; additional OOV branches running)

| Run | Anchor/range | qualifying permutations | Result |
|---|---|---:|---|
| blind Gibran red8 plant, p54 only | 47, 4703/4703 | 1 | exact pi, 47/47 training, 17/17 withheld true word domains, 11 uniquely correct |
| blind Emerson red8 plant, p54 only | 47, 3751/3751 | 1 | exact pi, 47/47 training, 17/17 withheld true word domains, 12 uniquely correct |
| original p54 strict | 47, 5748/5748 | 0 | strict intact-group dictionary model excluded |
| original both 56 and 49 required, <=3 OOV | 123/123 affine pair spaces (649 x 316 initial domains) | 0 | reference JS exhaustive |
| original 56 required, 49 omitted, <=3 OOV | 649/649 | 0 | native exhaustive |
| original 49 required, 56 omitted, <=3 OOV | 316/316 | 0 | native exhaustive |

Pending branches: both 49 and 56 omitted, 47 required (5748); all 49,56,47 omitted, 14 required. These together close the entire <=3 OOV gate because at least one of four distinct long groups must be in-vocabulary. Until they finish there is no full-budget exclusion. The 34/34 withheld truths are in candidate domains, not all unique plaintext. No original plaintext was recovered.

## Reproduce

From a checkout, in a working directory, run Python 3.8+ on sims/lp2_shared_gp29_mapped_red8_prepare.py to generate words.txt, original.txt and two red8 plants. Build sims/lp2_shared_gp29_mapped_red8_exact.cpp with g++ -O3 -march=native -fopenmp -std=c++17 -o red8. Then invoke:

    ./red8 words.txt gibran-red8.txt 49 47 - 0 0 100000 2
    ./red8 words.txt emerson-red8.txt 49 47 - 0 0 100000 2
    ./red8 words.txt original.txt 49 47 - 0 0 100000 2
    ./red8 words.txt original.txt 66 56 49 3 0 100000 2
    ./red8 words.txt original.txt 66 49 56 3 0 100000 2
    ./red8 words.txt original.txt 66 47 56,49 3 0 100000 2
    ./red8 words.txt original.txt 66 14 56,49,47 3 0 100000 2

For the both-in-vocabulary reference search, use sims/lp2_shared_gp29_mapped_red8_anchor_sft.cjs with config {"case":"original","anchor":56,"pairAnchor":49,"maxOov":3,"maxFilter":30000000,"maxJoins":250000,"maxNodes":100000,"maxEnum":3000000}. All 123 pair spaces completed with no cap (165 nodes; zero complete maps). The C++ search has no search cap; end is clipped to the exact anchor domain size. Raw C++ results will be attached when all branches finish.

Calibration verifies unique gauge-normalized permutations and independently replays every decoded candidate. Per-group arbitrary phase means this does not establish continuous-stream phase or a full page plaintext.

General unknown q8 remains open; this red-heading constraint is far stronger than an unspecified shift vector.

## Fixed published numeric interpretation (complete)

The same eight visible glyph indices can instead directly supply shifts k=[19,21,23,27,2,14,10,19], without mapping the key through pi. This removes the scale gauge: only pi(F)=0 is fixed. Each edge now fixes a numeric coordinate difference. A weighted component solver keeps exact relative coordinates and 29-bit occupancy masks; merging components rotates a mask and checks overlap, while same-component edges must agree exactly. At completion exhaust every compatible translation of remaining components, fixing the component containing F so pi(F)=0. The dictionary pruning and OOV branching are identical to the mapped receiver. No caps.

Both independent blind p54-only controls recover their exact permutations (unique qualifying map, 47/47 training support). Every one of the 17 withheld true words belongs to its decoded domain (12 and 11 uniquely correct). Original p54-only strict search exhausts 6343 anchors, no complete permutation. All four original <=3 OOV branches complete:

| Required anchor | Prior omitted | Options exhausted | complete permutations |
|---:|---|---:|---:|
| 56 | none | 810 | 0 |
| 49 | 56 | 305 | 0 |
| 47 | 56,49 | 6343 | 0 |
| 14 | 56,49,47 | 11062 | 0 |

Every valid solution with at most three OOV body groups must include at least one of these four anchors. Thus no permutation supports >=61/64 original body groups under this fixed numeric heading key. This is a finite exclusion of that source-selected subcase, not an arbitrary-q8 theorem.

[Native receiver](../sims/lp2_shared_gp29_numeric_red8_exact.cpp) · [raw results](lp2-p54-red8-numeric-cycle-results.json). The preparation script also generates numeric8 controls with the same donor words, hidden permutation, and independent starts. Compile as above, naming binary numeric8. Invoke numeric8 with the two *-numeric8.txt inputs and arguments 49 47 - 0 0 100000 2, then original.txt with 49 47 - 0 0 100000 2, and with 66 56 - 3 0 100000 2, 66 49 56 3 0 100000 2, 66 47 56,49 3 0 100000 2, 66 14 56,49,47 3 0 100000 2. Evaluate control winners with the preparation script arguments NAME RESULT_JSON numeric8.
