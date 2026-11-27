# Shared q8 across LP2 — strong long-group receiver

## Decision

No single common GP29 permutation and primitive eight-shift schedule can support at least 17 of the 20 most restrictive original long printed groups in the specified 40,751-form vocabulary, even with arbitrary independent word-start phase, literal plaintext-F holds, arbitrary effective alphabet and no word-order requirement. This is an exact conditional exclusion of a shared-key model, not all eight-phase ciphers. It does not imply that the same 20 groups are genuine words or that at most three are out of vocabulary. Chapter-private shifts and other boundary interpretations remain possible.

The input is [the frozen long-group profile](lp2-q8-shared-global-strong-anchor-profile.json), derived from corrected operational text and the canonical corpus (12,956 runes, 2,896 complete groups, 187 length≥9). All line/page carries are joined. The 20 fit groups contain 235 runes; the other 167 long groups contain 1,649 runes and are not used to constrain action search. They were used in choosing which long groups to fit by their local domain sizes, so they are algorithmically held out rather than fresh manuscript evidence. Selection is computational, not a creator clue. The strongest candidate words are constrained by local same-phase bijectivity and all-identity/all-nonidentity shift consistency, allowing every F path. E.g. p16 group833 `inopg3sise5sg` has 20 possible forms; p38 group2089 `l95f9nc9fa5r` has 42; p54 carry group2879 has 81. Those are necessary domains rather than plaintext candidates selected by independent instructions.

## Exact inverse

The [receiver](../sims/lp2_q8_shared_global_strong_anchor.cpp) (blob `163af25b05b855c80aa3fdd07d2a8eae4ffb58a3`) uses the terminal receiver's weighted GF29 graph, phase/scale gauge, linear elimination, MRV edge domains, affine disequality and moment-root sieves, exact permutation packing and independent final support check. Model: for nonzero P, C=pi^-1(pi(P)+k_j mod29), increment j; for P=F, C=F and no phase increment; pi(F)=0 and k is primitive period8. All per-word starts are permitted. The first nonidentity anchor edge sets k0=1 by global phase rotation and nonzero scaling. At most three OOV among the fit20 guarantees at least two supported among the first five strongest groups; choosing their first two supported indices yields ten disjoint branches. Earlier unselected anchors are excluded and charged against the budget. No language score or beam discards graphs.

Reproduce with C++17 g++ -O3 -pthread and the committed TextBlob dictionary (same spelling register as locally installed package):
```
g++ -std=c++17 -O3 -pthread sims/lp2_q8_shared_global_strong_anchor.cpp -o global_anchor
./global_anchor resources/control/english_wordfreq_textblob.txt 2026 300 2 167 168
for a in 167 168 169 170; do
  for b in $(seq $((a+1)) 171); do
    ./global_anchor resources/control/english_wordfreq_textblob.txt 0 120 2 "$a" "$b"
  done
done
```
The process exits nonzero for no candidate; distinguish complete exhaustion (`timed=0`, full seed count) from interruption.

| First two supported profile indices | Seeds completed | Nodes | Graph joins |
| --- | ---: | ---: | ---: |
| 167,168 | 20/20 | 314 | 139 |
| 167,169 | 20/20 | 611 | 661 |
| 167,170 | 20/20 | 41 | 0 |
| 167,171 | 20/20 | 1,479 | 952 |
| 168,169 | 40/40 | 5,721 | 11,467 |
| 168,170 | 40/40 | 153 | 0 |
| 168,171 | 40/40 | 4,933 | 6,164 |
| 169,170 | 81/81 | 1,401 | 42 |
| 169,171 | 81/81 | 12,025 | 60,192 |
| 170,171 | 114/114 | 5,139 | 154 |
| Total | **476/476** | 31,817 | 79,771 |

All `found=0 timed=0`; 46,749 anchor pair tests, 18,204,218 option tests, 44 affine sieves (43 rejected), one shift completion, zero complete permutations survived. No original action or held plaintext.

Blind seed2026 sampled independent frequency-weighted GP dictionary words of all 187 original lengths, arbitrary hidden pi and primitive q8 shifts, random word-start phases and no OOV in this branch. The receiver recovered the exact effective action and all 167/167 held true words, with 2/364 primary seeds completed before success, four DFS nodes, 18 packed permutations and zero fit OOV. This is a constructive synthetic control for long-group geometry; it does not match the original F/doublet profile, actual language continuity, or selection-induced domain sizes. It does not prove unique true word inversion or supply an original key.

This result complements the [terminal q8 exact dual-anchor exclusion](lp2-shared-gp29-cycle-action-calibration.md). It rules out the specified cross-chapter single-key fit, while retaining the more general independent chapter-key/shared alphabet hypothesis and arbitrary OOV allocations beyond the chosen 20. No unknown LP2 plaintext has been recovered.
