# Five-back ciphertext-conditioned GP29 bijections: original plaintext-compatibility gate

**Result (21 November 2026; Agent44):** a new, exact all-secret symbol-equality invariant excludes four finite **stationary, reversible** five-back architectures as complete native-English GP29 word-local decoders for the authentic LP2 manuscript. No original plaintext, historical key, generator or destination has been recovered. This is a scoped cryptanalytic constraint, not a solution or a statement that Cicada used these architectures.

## Why test this architecture?

The five source-visible red words on p7, the separately measured excess of within-word five-position matches, and clear p57's instruction to shed word circumferences give a human a reason to examine **a five-position within-word cipher state**. Earlier original-input tests constrain literal additive five-back drivers, fixed five-phase maps, and assorted affine feedbacks. The question here is more permissive: could an arbitrary **unknown alphabet** selected by the actual **ciphertext rune five positions earlier** be a reversible unknown-message cipher?

For each original complete printed word, preserve word and rune order. The first five ciphertext runes may have any secret per-word initialization. At positions j ≥ 5, suppose

    C[w,j] = sigma[s](P[w,j]),    s = (C[w,j-5], optional length(w), optional j mod 5).

Each sigma is **any** secret permutation of all 29 GP runes and is reused across source words with the same state. No additive, linear, prime, source-key or glyph-value restriction is imposed. The four independently frozen state families are:

1. preceding five-back ciphertext glyph only;
2. five-back glyph and the printed word length;
3. five-back glyph and position modulo five;
4. all three.

These classes permit 29, up to 406, up to 145, and up to 2,030 independent hidden alphabets, respectively. Only classes realized by the corpus are measured. Different entire books, page-dependent secret maps, hidden time clocks, earlier plaintext feedback, and nonbijective/length-changing encoders lie outside the test.

## Why this eliminates every secret key in the named family

Fix a state s. Every decoded plaintext glyph is obtained by the **same bijection** sigma[s] inverse. Thus, for every pair of eligible occurrences in this state,

    [C_i = C_j]  iff  [P_i = P_j].

Summing equal-symbol pairs within each state yields a statistic that is **identical for every possible secret key**, including every one of the 29! alphabet permutations in every context. The test requires no key guessing, fitted English words or inverse optimization. The first five ciphertext symbols per printed word are treated as unconstrained and excluded.

The exact canonical original source yields 2,105 eligible positions out of 12,956, with all 2,896 complete printed words and all 32 page-spanning words parsed without artificial word boundaries. Source-native GP word pools use the repository's authenticated solved-LP1 and clear-p57 orthography, including ING and IO representations.

## Original observation and genuine inverse-positive calibration

| Secret permutation state | Original realized classes | Pair comparisons | Equal pairs | Original equality rate | Lowest of 600 independently encrypted native-English controls |
| --- | ---: | ---: | ---: | ---: | ---: |
| C five positions earlier | 29 | 76,844 | 2,657 | 0.03457654 | 0.07815173 |
| C five earlier + word length | 239 | 11,871 | 415 | 0.03495914 | 0.08048493 |
| C five earlier + position modulo five | 142 | 22,131 | 756 | 0.03416023 | 0.07574188 |
| C five earlier + length + position modulo five | 656 | 4,881 | 175 | 0.03585331 | 0.09915131 |

For **each** of the four models, 200 independently drawn word-length-matched original-source-native English books from each of Shakespeare, Gibran and Emerson were encrypted with new arbitrary secret 29-symbol permutations in the appropriate classes. The first five glyphs of each word received arbitrary secret shifts. Every trial produced an actual encrypted ciphertext; this was not an unencrypted frequency comparison. Each model's exact forward and inverse pass recovered **all planted plaintext**, and the grouped ciphertext-vs-plaintext equal-pair invariant was independently checked on the first full synthetic plant. Across **2,400 encrypted controls**, zero had an equality rate as low as the original, for all four state families.

The smallest native-original separation is over twofold for the basic state family, and larger when word shape or phase is supplied to the secret mapping. Corpus-specific GP orthography and the finite donor vocabulary are controls, not universally representative of all conceivable LP2 plaintext. In particular, the original might be deliberately letter-balanced, multilingual, compressed, synthetic or double-encrypted. That possibility cannot be rejected by the current result.

There is no meaningful recovered plaintext in this experiment: all possible secret key choices produce the *same equality-pair count*, and the original has the approximately uniform-symbol collision signature rather than source-native GP English within these classes.

## Decision

**Retire stationary five-back ciphertext-conditioned GP29 one-rune bijections with a globally shared alphabet per declared visible state** as a direct route to source-native LP2 plaintext. This strengthens earlier affine-only tests without making the stronger claim that every five-position cipher or every manuscript-wide state machine has been excluded. To revisit, require an independent original-source rule specifying a genuinely new state (for example, a page-specific secret, nonbijective escape, or external input) together with its reconstructible inverse and an untouched original-cipher prediction. An arbitrary fitted alphabet per word would dissolve the invariant and merely postpone the missing-key question.

**Reproduction:** [Node22/CommonJS read-only original-source SFT](../sims/lp2_fiveback_classperm_original_sft.cjs); [successful Windows GitHub Actions run 44958155959](https://github.com/FlareZ123/liber-primus/actions/runs/44958155959). Initial deterministic seed 0x33015131. The program reports all exact counts, source-specific native distributions, every positive inverse, and seed. No GitHub workflow was added.
