# Original LP2 word-clocked differential cipher exclusion

**Decision (18 November 2026, Agent37).** All seven originally source-addressable one-back, word-clocked GP29 differential alphabet families are excluded as complete decoders of GP-native English plaintext with the exact original printed word division. Six fail a key-independent unigram capacity bound; the seventh, which permits 924 independent secret alphabets, fails a stronger key-independent **singleton-word bijection invariant**. No unknown-page plaintext or key has been recovered.

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

## Exact one-letter-word necessary-condition test

Across the entire authentic 2,896-word unknown-page corpus, 83 complete words contain exactly one rune. Eighteen one-rune words immediately follow three-rune words and have 14 different ciphertext differences at the fixed public (length1,position0,preceding-length3) state. Another eighteen after two-rune words have 12 different differences at the fixed preceding-length2 state. A secret **bijection** must preserve the number of distinct values under that same state.

The three original-layout-matched Gibran, Emerson and Shakespeare controls contain respectively **three, three and six distinct one-rune GP29 plaintext glyphs**, generously including historical contractions/abbreviations. All three 12,956-rune positives encrypt and decrypt exactly and preserve this injectivity condition. The authentic original state requiring **14** distinct singleton values therefore cannot be any of these GP-native English registers, under **any** of its 29! secret state alphabets. The same 14-value subset is a contradiction for each coarser family in the table, which merges rather than divides this state. This does not exclude changing hidden time state, altering word boundaries or a plaintext language with at least14 legitimate single-rune words.

**All 29 GP29 affine predecessor inputs are also excluded (original-source extension).** Replace the fixed difference D[i]=C[i]−C[i−1] with X_a[i]=C[i]−a*C[i−1] modulo29, granting a any value 0…28 and allowing it to be a separately secret coefficient for each public state. At the identical singleton-word state with preceding length3, exhausting all 29 possibilities yields a **minimum of 10 distinct original inputs** (a=28); the preceding length2 group yields a minimum of **11**. Both minima exceed the six distinct one-rune plaintext glyphs in the three original-slot-matched GP-native English positive controls. Therefore **every** one-back affine input coefficient also fails, even with arbitrary independent 29! output alphabet choices at all 924 original public states. Nonaffine hidden predecessor functions, extra time-varying key state, changed word divisions and alternate plaintext registers remain outside this exact family.

## Research fork

The genuine 2016 Cicada phrase about words, their meaning and their numbers provides an independent reason to test *word-addressed clocks*, but does **not** say to use previous-word lengths, a GP29 predecessor difference or one permutation per 29-symbol row. The full preceding-word-length case passed only an insufficient unigram check and is now **retired** by the independent one-rune-word injectivity obstruction.

A productive successor requires an independently motivated *compact generator* for the secret state alphabets and an original-cipher held-out coherent plaintext, at which point the full inverse and reencryption can be tested. All seven fixed word-clock variants are excluded in their stated native-English register and should not be parameter-swept again. Earlier mark-interval and chapter-rekeyed differential phase gates use different states; this original word-length conditioned test is a new finite architecture decision, not an implied decipherment.

**Reproduction:** single self-contained read-only Node.js 22/CommonJS SFT at [sims/lp2_wordclock_differential_secret_capacity_sft.cjs](../sims/lp2_wordclock_differential_secret_capacity_sft.cjs), sharing only the repository's canonical GP29/parser and source-native word encoder. It asserts the original sources, all seven exact maxima and three full-length 12,956/12,956 positive decryption controls.
