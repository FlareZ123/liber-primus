# Spacing-independent synchronization gate for prior-consuming-plaintext table (#2643)

## Key-independent theorem

Freeze C=P+T[s] mod29 for P≠0, s←P; literal plaintext F=0 emits 0 and preserves s. A single common arbitrary T, free chapter-initial state. No spaces or printed-group assumptions. In any physical plaintext window (x0,x1,...,xn) with x0≠0, after x0 the state is exactly x0 regardless of incoming state. Every subsequent output, including literal F, is then a deterministic function of that window. Thus each pair of equal eligible (n+1)-rune plaintext windows forces a pair of equal n-rune ciphertext windows at the corresponding +1 offsets. Sum unordered pair counts. This survives arbitrary F holds, unknown primers, and even arbitrary deterministic consuming output maps. It is not the prior intact-word q1 CSP or the all-consuming page-history result.

## Original and continuous native prose

Canonical p16–22 (1744) and p40–53 (3008), independently analyzed. Count all overlapping suffix-output windows after an initial physical rune, within each chapter. The plaintext count uses only windows starting non-F. Native controls are continuous windows from the pinned Shakespeare, Gibran and Emerson source-native GP encoder, fixed half-length stride; no original word positions, no word-shape matching. n=4 is the primary gate; other n values are descriptive. The same GP spelling reproduces actual p57 95/95.

| Pages | n=2 | n=3 | n=4 | n=5 | n=6 |
|---|---:|---:|---:|---:|---:|
| 16–22 | 1894 | 70 | 2 | 0 | 0 |
| 40–53 | 5536 | 201 | 11 | 0 | 0 |

| Pages | Source | Windows | Min repeated plaintext 5-window pairs | Excluded by primary n=4 |
|---|---|---:|---:|---:|
| 16–22 | Shakespeare | 247 | 84 | 247 |
| 16–22 | Gibran | 70 | 173 | 70 |
| 16–22 | Emerson | 367 | 53 | 367 |
| 40–53 | Shakespeare | 143 | 390 | 143 |
| 40–53 | Gibran | 40 | 502 | 40 |
| 40–53 | Emerson | 212 | 201 | 212 |

These are all-key, spacing-free exclusions of the tested continuous native registers, not an unconditional theorem about every possible plaintext.

## Constructive finite-source inverse and controls

For a candidate native prefix, literal F must emit zero; every other transition after the first consuming plaintext directly determines T[previous consuming plaintext]=C−P mod29. Contradictory assignments reject the candidate. T[0] implements a free initial shift and is not a recoverable internal row. Exact scan of 684 fixed donor windows on first 1024 original p16–22 runes: 684 fail the primary collision bound; 0 compatible source/table witnesses. No original fit to freeze if zero. This is a finite-source plaintext-location attack, **not unrestricted blind language/key learning**.

Three hidden-table plants use independently selected contiguous donor windows from that same fixed candidate bank, with independently seeded maps. The true location is withheld but included in the candidate bank. All unobserved map rows freeze to zero rather than being fitted from suffix. Exact latent-F Viterbi counts all paths for that frozen map using a language model trained only on the genuine solved native sections (not the literary donor passages). The independent continuation uses a different literary author and same table/initial shift. Random transparent-F additive pad controls use the same source texts.

| Source | Prefix fits | Observed rows exact | Frozen suffix recovered | Independent chapter recovered | Random-pad fits |
|---|---:|---:|---:|---:|---:|
| Shakespeare | 1 | 25/25 | 698/720 | no path/3008 | 0 |
| Gibran | 1 | 24/24 | 716/720 | no path/3008 | 0 |
| Emerson | 1 | 27/27 | 711/720 | 3002/3008 | 0 |

All latent path counts and observed-row/primer identifiability are in the raw JSON. The prefix candidate source is included in the finite bank, missing rows are arbitrary frozen choices, and some ambiguous literal-F paths cannot be uniquely identified. No claims of general hidden-table recovery from arbitrary unknown prose. The all-key collision result does not depend on this source-bank calibration.

Decision: retire the stationary one-consuming-predecessor model as a direct ordinary native-GP prose explanation for these two original chapters within the tested register. A genuinely different, independently source-selected state/clock/transport is required. No new unknown LP2 plaintext or authentic key recovered.

[CommonJS reproducer](../sims/lp2_plainprev_fhold_spacingfree_sync_sft.cjs) · [Raw results](lp2-plainprev-fhold-spacingfree-sync.json). Executed in connected V8, no Windows CI claimed.
