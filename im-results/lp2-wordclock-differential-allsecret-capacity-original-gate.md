# Original LP2 word-clocked differential alphabet capacity

**Decision (18 November 2026, Agent37).** A physically observable, lossless word-clock family of GP29 ciphertext-to-plaintext operations fails a mathematically exact all-secret frequency gate on its six coarser source-visible variants. The previously untested possibility that a one-back ciphertext difference is passed through an arbitrary alphabet permutation determined by each current printed word's length and within-word position has a maximum possible normalized GP29 index of coincidence **1.147215568**. Adding the preceding complete word's length modulo five, with a wholly independent unknown GP29 permutation for each of 457 occupied states, raises that maximum to **1.561649625**. All three native GP-English full-length positive controls with the original word-slot lengths and positions preserved have IoC **1.760551516–1.806768722**. The 457-state and coarser families therefore cannot output the tested GP-native English register, regardless of secret alphabet choices.

**Surviving architecture:** retain the preceding printed word's *exact* length in the state, rather than a residue. All **924 occupied original states** now permit a theoretical maximal normalized IoC **1.948446727**, above the GP-native control benchmark. This removes a unigram necessary-condition exclusion, while leaving a 924×29! independent-key search space that is too unconstrained to identify a credible historical cipher. **No unknown plaintext or source key was recovered.**

## Source model and exact result

The unchanged GP29 indices in the canonical original-source corpus match the original runic transcription rune for rune. This screen uses **12,956 original unknown-page runes**, **2,896 complete original words**, **32 original cross-page words** and the existing **86 adjacent ciphertext repeats**. Physical p50 is the rune-free 256-cell numeric page. Each complete word retains its authentic printed length, even when it crosses a physical page boundary.

Let C be original ciphertext, D[i]=(C[i]-C[i-1]) mod 29 for i>0. For each original position i, define l as the current complete printed-word length, j as its 0-based within-word index and h as the preceding complete printed-word length (h=0 at the beginning). Consider **P[i]=pi_(state(l,j,h))(D[i])** with an independently arbitrary bijection of all 29 GP29 runes at each public state. The first plaintext rune is unrestricted. Given these permutations and the first ciphertext rune, the rule has an explicit inverse by cumulative addition and is lossless.

For each occupied state, the unknown alphabet can *only relabel* the observed 29-bin histogram of D. Sorting every state histogram descending and pooling counts by rank gives the **exact maximal** global sum of squared plaintext unigram counts across **all** state-specific secret permutations. Assign the first free plaintext rune to the top bin. The rearrangement inequality proves that another alignment of histogram ranks cannot have a greater normalized IoC. No key is fitted, and the exclusion holds for every possible independent set of secret substitutions in the six specified families.

| Source-visible state s | Occupied independent GP29 permutations | Exact maximum 29×IoC |
|---|---:|---:|
| Current length l | 14 | 1.045439369 |
| Within-word offset j | 14 | 1.041502784 |
| (l,j) | 105 | 1.147215568 |
| (l,j,h mod2) | 210 | 1.264277478 |
| (l,j,h mod3) | 274 | 1.360265597 |
| (l,j,h mod5) | 457 | 1.561649625 |
| (l,j,h exactly) | 924 | 1.948446727 |

**Original-word-layout-matched positive controls:** the existing project-licensed reference GP-native English corpora Gibran, Emerson and Shakespeare were encoded using the project's GP transliteration, with a deterministic word-length-matched replacement in *each of the original 2,896 positions*. The reconstructed controls preserve the entire printed length multiset and ordering exactly, giving normalized IoC Gibran **1.760551516**, Emerson **1.806768722**, Shakespeare **1.792954392**. Each passage was then encrypted with a deterministically generated but independent **nonaffine secret permutation per (l,j,h mod5) state**. Decryption recovered all 12,956 plaintext runes exactly, and the all-secret histogram cap always exceeded the plaintext's true IoC, verifying the model and necessary bound on complete source-shaped positive inputs.

The short source-native English control is a registered language benchmark rather than a universal lower bound on all possible English compositions. The interpretation requires continuous GP29-native English plaintext with the original word division and no extra lossy formatting, insertion or hidden high-entropy key channel. A source-selected compound cipher or different language remains open.

## Research fork

The genuine 2016 Cicada phrase about words, their meaning and their numbers provides an independent reason to test *word-addressed clocks*, but does **not** say to use previous-word lengths, a GP29 predecessor difference or one permutation per 29-symbol row. The 924-state survivor passes **only a necessary unigram capacity check** and does not supply a source-derived secret, an all-key word-dictionary match, or even one unknown-page plaintext word. It therefore does not justify a brute-force independent-permutation search.

A productive successor requires an independently motivated *compact generator* for the secret state alphabets and an original-cipher held-out coherent plaintext, at which point the full inverse and reencryption can be tested. The coarser word-clock variants are excluded in their stated English register and should not be parameter-swept again. Earlier mark-interval and chapter-rekeyed differential phase gates use different states; this original word-length conditioned test is a new finite architecture decision, not an implied decipherment.

**Reproduction:** single self-contained read-only Node.js 22/CommonJS SFT at [sims/lp2_wordclock_differential_secret_capacity_sft.cjs](../sims/lp2_wordclock_differential_secret_capacity_sft.cjs), sharing only the repository's canonical GP29/parser and source-native word encoder. It asserts the original sources, all seven exact maxima and three full-length 12,956/12,956 positive decryption controls.
