# All-key Hill-4 with prime whitening or latent literal F

## Source choice
p15 original 4x4 Fibonacci-prime square, red9/red11 and black-body origins 0,9,20; p56 genuine prime-minus-one clock and native F holds. These suggest independent inverse families, not a proven composition instruction. Plain all-consuming Hill already bounded in lp2-projective-hill4-inverse.md. This work explicitly extends it along two different axes.

## Prime whitening (ordinary consuming symbols)
Let q_i = (prime(i+1)-1) mod29, reset at the chosen complete block start. For inverse row direction r normalized projectively, evaluate r·C + m q_{4i+j}, all 25,260 directions and 29 m per output lane j (arbitrary per-lane post-whitening multiplier after affine inversion, including zero). Also evaluate r·(C+m q_block) for every shared m and direction (pre-whitening). Arbitrary nonzero scale and offset leave row histogram energy invariant. Triangle inequality across lanes gives all-key pooled IoC upper bounds even without enforcing independence. Arbitrary fringe runes allowed. Across origins 0/9/20 and four phases each, maximum post .0407429722443, pre .0410876516184, far below native reference. Native plant: exact 1600 GP runes from solved sections separate from the training sections, arbitrary full-rank H, independent multipliers [3,19,5,17], offsets [1,11,7,5]. Fit first 1000, select maximal row-energy projection per lane then fit scale/offset using unigram top16 and exhaustive bigram combinations; all 600 heldout and all fit runes correct. This does not cover consuming-clock holds combined with whitening.

## Latent literal-F block inverse (no prime whitening)
At ciphertext 0, either consume it normally or emit literal F and leave the consuming block clock unchanged. All consumed outputs must be nonzero. Build a DAG on physical positions: an explicit single hold at zero, or an edge consuming four values and skipping any interior zero subset. For each of 25,260 projective r and all 812 scale/offset pairs, maximize row-wise rounded unigram log likelihood over all DAG paths. Use ceil(10000 log p), multiply each row emitted log weight by 4, include each held F log weight once in each row score. Allow arbitrary 0..3 initial fringe and terminal fringe with <=3 nonzero ciphertext symbols. Thus every valid complete matrix inverse and its *shared* hold path is bounded above by one quarter of the sum of four row maxima. Allowing independent paths, phases and fringes per row is a relaxation. Greedy maximum-weight independent projective basis gives the tightest such row-sum bound; normalized scores per physical rune.

| Origin | All-row relaxed score upper |
|---|---:|
| p15+0 | -3.48269570415134 |
| p15+9 | -3.48502740232313 |
| p15+20 | -3.48782955390335 |

Training 1125 exact native runes from warning, welcome, wisdom, jpg229, p56,p57; separate 1854-rune koan/loss/later koan score -2.9841885; native concatenated 1883-rune windows -2.99722 to -2.97286 (overlap training). This is an exact upper bound on the stated finite inverse and score, not a universal theorem of language. Native plant of 1600 exact runes, 23 true literal F and 47 ordinary generated ciphertext zeros, no whitening, arbitrary H and offsets. All four true inverse rows recovered from first 1000, row ordering fixed by native bigram score on fit, exact full-matrix DAG backtrace gives 1000/1000 fit and 600/600 withheld. The remaining final incomplete consuming block is copied in the plant convention.

## Reproduce
`node sims/lp2_hill4_prime_hold_sft.cjs`, requires C++17 g++/MinGW and OpenMP; compiler can be set with CXX. C++ native scans ran locally on Linux and JS recovery executed separately; final consolidated wrapper not independently executed in Windows CI. Raw summary lp2-hill4-prime-hold-output.json. No novel original plaintext. Shared Hill4 + latent F is incompatible with native scores; fully private matrices and simultaneous latent-F/prime whitening are not included in this bound.
