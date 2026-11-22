# Exact all-secret short-block collision obstruction for LP2

**14 November 2026 | Agent20 | Scoped negative, no recovered plaintext or key.**

The complete original LP2 p0–p55 ciphertext rules out a direct 27-symbol
stationary **full-block, length-three or length-five reversible permutation**
on the fixed source-ordered GP alphabet with **two unchanged literal bypass
runes**, against two independently sourced original-length GP-English controls.
The result holds for **every secret substitution key and Trifid cube ordering**,
including a distinct secret key for every physical page. It is a conditional
English-like-language exclusion; a historical Cicada operation, key, or any
unknown-page plaintext has **not** been recovered.

**Reproducer:** [read-only Node22 single-file test](../sims/lp2_trifid27_allsecret_block_collision_sft.cjs), successful [manual Windows CI run 43627694841](https://github.com/FlareZ123/liber-primus/actions/runs/43627694841), with complete original and native-control counts in stdout. The independent direct source-order cube sanity gate and 504 exact encrypt/decrypt/re-encrypt plants passed in [run 43626780966](https://github.com/FlareZ123/liber-primus/actions/runs/43626780966). Original sources: [canonical GP ciphertext, physical page numbers and rune indices](../resources/liber-primus/lp2-corpus.json), [exact printed word continuation](../resources/lp2-transcription.txt), [Gibran control](../resources/control/gibran_prophet_58585.txt), [Shakespeare control](../resources/control/shakespeare_first300k.txt).

## Original-source motivation and the independent rival

A 3×3×3 coordinate cube is an economical, familiar interpretation of the
29 GP symbols **if** two symbols bypass that cube. The original first
ciphertext visual chapter contains 729=27² GP runes; numeral and
five-position clues motivate the bounded 3- and 5-position checks. None is
an authenticated instruction to use Trifid; this is intentionally a
negative architecture test, not a historical-cipher assertion. Earlier
repository studies examined period-two 25-symbol Bifid, GP28/GP30
two-coordinate fractionation, and five-phase substitution; the result
here covers the different three-coordinate *full-block-permutation*
architecture without having to enumerate a cube key. An independent
changing-key or source-selected codebook explanation survives.

## General theorem and exact gate

For any finite alphabet A, any positive integer t, and any fixed bijection
B:A^t→A^t, write n_P(x) and n_C(x) for the multiplicity of an aligned
complete t-symbol block x in plaintext and ciphertext. Because B is
one-to-one, all multiplicities are merely relabeled:

    Σ_x binomial(n_P(x), 2) = Σ_x binomial(n_C(x), 2).

This identity applies to **every** hidden full-block bijection, including
Trifid with arbitrary 27! key-square permutation, and even any of the
(27^t)! hypothetical whole-block permutation tables. It is **not**
specific to coordinate fractionation.

For each of the 28 second-bypass hypotheses, the first bypass is source GP
index 0 (F); remove both symbol values from each original reset segment,
while retaining their exact source positions. Split the 27-symbol core
stream into complete disjoint t-blocks from its segment start. Ignore
partial blocks. Count unordered equal-block pairs. Four clocks are compared:

1. Book: one original 12,956-rune stream, one stationary key.
2. Pages: 55 physical rune-bearing pages, core clock reset on each page,
   but one shared stationary key for the book.
3. Words: 2,896 authentic complete printed words, including all 32
   across-page continuations, and one stationary key for the book.
4. Independent page keys: the page reset above, but **count collisions
   separately inside each physical page** before summing, so all
   55 pages may have completely different secret block permutations.

Native controls take each sourced literary GP stream, starting at offsets
0, 2500, 5000, 10000, 20000; delete its literal hypothesized bypass
symbols; then populate **only** original non-bypass positions, leaving the
original ciphertext's F and additional-bypass positions intact. Every
original core length, word/page boundary, block count, and bypass position
is therefore held exact. The GP transliterator normalizes
QU→CW, K/Q→C, V→U, Z→S and greedily consumes the source's seven historical
digraph symbols. The Gibran control contains 63,114 resulting GP runes;
the Shakespeare control 218,800.

For every pair (t, clock), all 28 bypass masks are tested against five
windows from each of two independently sourced plaintext registers.
The reported native minima/maxima combine **280 synthetic native windows**
(28 masks × 5 starts × 2 sources), not an empirical p-value corrected
for all historical cipher families. The 8 direct hidden-cube positive
controls independently encrypt/decrypt a native passage through an
unknown deterministic 27-cell permutation and exactly preserve the
complete-block collision counts, including page-key scopes.

## Computed original-input results

| Complete block | Scope / reset | Original equal-block pairs, range over 28 bypasses | GP-native control range, Gibran and Shakespeare | Native bypass masks passing |
|---:|---|---:|---:|---:|
| 3 | Book | 390–476 | 7,122–17,965 | 0/28 |
| 3 | Pages, shared key | 370–465 | 7,052–17,065 | 0/28 |
| 3 | Words, shared key | 252–285 | 4,063–10,265 | 0/28 |
| 3 | Pages, **independent secret per page** | 1–9 | 157–484 | 0/28 |
| 5 | Book | 0–1 | 221–546 | 0/28 |
| 5 | Pages, shared key | 0–2 | 235–547 | 0/28 |
| 5 | Words, shared key | 0–1 | 40–120 | 0/28 |
| 5 | Pages, **independent secret per page** | 0 | 6–46 | 0/28 |

The margins also hold when paired within each bypass choice and native
window, rather than contrasting globally maximized/minimized ranges.
The closest original/native case is independent page keys with t=5:
0 original equal-block pairs versus **6** native-English pairs. The
corresponding t=3 comparison has at most 9 original and at least 157
native collisions across their separately selected masks.

**Direct source-order sanity gate.** Without attempting an all-secret
search, the companion script also evaluates 2,016 reversible source-ordered
cube choices (28 additional bypasses × 3 periods × 2 book/page clocks × 6
axis permutations × 2 directions). Best complete-book GP bigram score
is **−4.4073293846** against an independent Gibran native-window
minimum **−2.7721482144**, and the actual 95-rune clear p57 scores
**−2.6086674396** using the same training panel. Synthetic reversible
plants pass 504/504. This is an ordinary negative and is strictly weaker
than the all-secret invariant for periods 3 and 5.

## Decision, limits, and next source dependency

Under the literal-bypass and stationary aligned full-block assumptions,
a hidden 3D square **cannot** explain normal source-native GP English on
LP2. Every possible secret 27-cell cube alphabet, every secret permutation
of full three- or five-symbol blocks, and even independent page-local
secret keys are covered. There is no reason to enumerate 27! squares or
launch new Trifid key-search CI on those premises.

The result **does not** exclude:

- The solved p56 **plaintext-F bypass** semantics, where ciphertext F may
  also be an encrypted non-F symbol. The tested exact bypass mask is a
  stronger and historically unproven assumption.
- Per-block or per-word changing keys, stateful cross-block operation,
  period-six-or-longer blocks, variable-length codewords, resequenced
  word/page clocks or non-bijective transformations with authenticated
  restoration side information.
- An original plaintext in a foreign/encoded/intermediate register,
  rather than source-like GP English, or a different symbol mapping.

A productive successor requires **independent source evidence** selecting
a bypass/clock or a key-changing operator. Merely finding another
retrospective period-3/5 numerical coincidence cannot rescue the fixed
block architecture from this key-independent obstruction.

**All numeric observations are source-based computation; the cipher
interpretations are conditional hypotheses. This report claims zero
unknown LP2 plaintext, keys, instructions, or final destination.**
