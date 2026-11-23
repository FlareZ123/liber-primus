# p7 prime-word seed evolved by the 2014 1033-square: bounded original-input negative

**Agent 1, 23 November 2026. Classification: source-motivated, bounded cryptanalytic test. No unknown LP2 plaintext or authentic cipher key recovered.**

## Human-solve-path hypothesis

This route joins four visible source structures without introducing a free key:

1. The original p7 page has five red word segments in a 14-rune span at offsets [194,208). Their GP-prime sums modulo29 are the five-coordinate seed **[9,16,11,11,23]**. This uses the manuscript's prime-valued alphabet, not an invented numeric encoding.
2. The original Cicada 2014 Stage10 source contains a final 5×5 magic square whose five row sums are **1033**. The p33–p39 cuneiform chapter itself contains the source-visible 1033/3301 numbers.
3. Reduced modulo the 29-symbol GP alphabet, this 1033 square B satisfies **B^14 = −J** and **B^28 = I**, with exact order 28. It therefore supplies a 28-step linear state orbit from the five-word seed.
4. The original p33–p39 chapter contains **1,680 runes = 60×28 = 12×(5×28)**. The five numbered cuneiform units provide a second natural receiver: five separate streams, one per coordinate of the 5×28 orbit matrix.

The possible human path is: read the five red words as numbers, use the original 1033 square to evolve them, then apply the resulting 5×28 state schedule to the cuneiform material. The 2016 signed continuation's statement that words are a map and their numbers are direction, together with the LP1 prime instruction, makes the prime-sum seed a motivated choice.

**Weakest premise:** no first-party LP2 instruction explicitly says to use the 2014 1033 square as a state-transition matrix, seed it with p7 red-word prime sums, or apply its orbit as a Vigenère stream. The numerical and dimensional fit motivates the experiment but does not prove the receiver. Historical context further weakens the operator claim: the existing [Stage10-to-Stage11 source gate](cicada2014-stage10-to-stage11-original-operator-gate.md) establishes that the 2014 squares were submitted as answers to a remote CGI/GnuPG gate; it does not instruct solvers to use them as linear cipher operators. This was an exploratory cross-round test, not a recovered author instruction.

## Frozen source construction

- Matrix source: resources/cicada2014-openpuff-magic-squares.txt. The last 25 source integers form B; every row sums to 1033.
- Seed source: resources/liber-primus/lp2-ink-annotations.json and lp2-corpus.json. The p7 red span is exactly [194,208), length14. Its five source word lengths are [2,4,3,2,3], canonically transliterated DO / OETTHAE / CWJ / XEA / GEAM; their GP-prime sums modulo29 are [9,16,11,11,23].
- Matrix over GP29:

~~~text
11 22 22 15  6
18 25 14  1 18
23 13  4 13 23
18  1 14 25 18
 6 15 22 22 11
~~~

- The matrix orbit from the seed has 28 distinct states. Each state emits five symbols, giving a 5×28 key matrix and a full 140-symbol period.
- The full original p33–p39 chapter page lengths are [214,261,271,238,228,228,240], totaling 1,680. The chapter is exactly 12 repetitions of the 140-symbol stream, or 60 rows of 28.
- The five numbered units have source lengths [139,91,98,96,129], totaling 553. Each unit is assigned one row of the 5×28 key matrix, repeated at period28.

## Frozen receivers

Only the prime-sum seed, the final 1033 matrix B, standard column-vector update v(t+1)=Bv(t) modulo29, and direct GP29 addition/subtraction were tested.

Two natural serializations were frozen:

1. **Time-major full-chapter stream:** concatenate each five-symbol state in time order to make a 140-symbol key, repeat it 12 times over all 1,680 p33–p39 runes.
2. **Five numbered-unit streams:** read the 5×28 orbit matrix by rows; use row i as the period-28 key for numbered unit i.

Both algebraic directions were tested. No matrix transpose, alternate seed, phase, row rotation, page-specific offset, F-skip, or second cipher layer was added.

## Original results

| Receiver | Direction | Original-output IoC | Synthetic p57-repeat plant IoC |
|---|---:|---:|---:|
| Full chapter, 140-symbol period | subtract | 0.03421112 | 0.07181712 |
| Full chapter, 140-symbol period | add | 0.03430543 | 0.07181712 |
| Five unit rows, period 28 | subtract | 0.03534738 | 0.07070131 |
| Five unit rows, period 28 | add | 0.03530152 | 0.07070131 |

The untouched full chapter has IoC **0.03436002**; the five numbered units have IoC **0.03423356**. All four inverses remain near the uniform 29-symbol baseline. The repeated p57 plant is a source-native mechanical round-trip control, not a representative language baseline; its role is to check that the key schedule and inverse are implemented consistently. For the 553-rune numbered block, the independent source-native benchmark in the five-passage study is IoC 0.06094557. None of the four original outputs yields coherent plaintext. The reproducer prints the full key matrix and exact output prefixes.

Every original-input inverse re-encrypts its entire source interval exactly. The p57 native-GP planted controls also survive encrypt/decrypt round trips exactly. These controls validate indexing, state evolution, and inverse arithmetic; they do not validate the hypothesized key schedule.

## Decision

Retire this exact **p7 red-word GP-prime seed → 2014 1033-square B orbit → period-140 / five period-28 GP29 stream** family as a native-GP decoder for p33–p39. The 5-vector, 5×5 matrix, order28, and 1,680-rune length align unusually well, but the original ciphertext does not become language under either natural serialization or sign.

Do not rescue it with a transposed matrix, alternative seed arithmetic, arbitrary phase, per-page offsets, or feedback layers absent an independent source instruction. This is a useful exclusion, not a solution.

## Reproduction

From the repository root:

~~~sh
node sims/lp2_1033_square_p7_primeword_state_stream_gate.cjs
~~~

The script reads the original square, p7 ink annotations, and LP2 corpus; asserts the seed, matrix order, full orbit, chapter/unit lengths, both native positive controls, and exact forward replay for every tested inverse.
