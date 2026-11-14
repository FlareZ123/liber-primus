# LP2 physical p3–7: a historical GP-prime checksum identity, with no authenticated inverse

**Status (14 November 2026; Agent 1): exploratory source-original arithmetic, a fixed-label-permutation comparison and a negative historical-cipher consumer. No unknown-page plaintext, author key, selected operation or destination is recovered.** Reproducer: [single runnable Node.js source test](../sims/lp2_p3_p7_809_761_1033_source_gate_sft.cjs). The numerical identities are *one postselected checksum equality* expressed twice, not independent corroborations.

## What a contemporary solver could recognize

The original 2014 LP2 source has a red-initial/rubric and red-thirteen-dot terminator pattern delimiting a physical five-page chapter **p3–p7**. This grouping is independent of numerical searches: it is a top-level unit in the [source-image chapter map](lp2-global-original-visual-section-map.md). A solver already possesses the 2013 29-rune Gematria Primus legend with its ascending prime weights 2 through 109. Earlier puzzle stages used prime sums of *complete* printed clues to check meaningful numbers. It is therefore inexpensive to test the full printed chapter's rune-prime sum once its physical boundaries have been recognized.

Source-canonical whole-page totals, without dropping headings, punctuation-adjacent runes or page endings:

| LP2 physical page | Printed GP29 runes | GP-prime-weight sum |
| --- | ---: | ---: |
| p3 | 217 | 11,462 |
| p4 | 261 | 12,998 |
| p5 | 263 | 14,383 |
| p6 | 196 | 10,581 |
| p7 | 208 | 11,251 |
| **Entire p3–p7 chapter** | **1,145** | **60,675** |

### The page-local 761 operand is independently readable

The original image [combined scan 24.jpg](../resources/liber-primus/24.jpg), physical LP2 **p7**, closes this five-page chapter with a **separately red 14-rune footer**, followed lower down by exactly **five large black filled dots**. The five intact printed footer words, read without changing their physical order, have rune counts **[2,4,3,2,3]**. Their GP-prime sums are **[96,248,69,156,197]**, so their complete red-rune sum is exactly **766**. The image independently displays **five printed words and five black dots**, giving the provisional numerical reading:

\[
\text{GPprime(red terminal)}-\text{number of black dots}
=766-5=\mathbf{761}.
\]

This is a **source-local method to notice the 2013 MP3 number** directly within the same chapter whose full original rune sum is60,675. The printed word boundaries, fourteen-rune span and five-dot motif are independently visible before doing arithmetic; the difference operation was **selected after observing the match**. The original source has no instruction identifying five dots as a subtractive key. Furthermore the same chapter contains five physical pages, and the independently published values **761 and809 are the 135th and140th ordinary primes**, five prime successors apart. These repetitions of five make a human solve-path reconstruction plausible, but they are correlated observations and cannot establish authored intent or recover a key on their own.

The SFT reads the original printed word separators in the canonical transcription, verifies all **14** red glyph identities against the unmodified p7 ciphertext indices, checks all five word sums and the exact 766−5 relation, and explicitly labels the original-image dot count as hand-adjudicated. The associated original image must be consulted for the five large black dots; they are different from the nearby **thirteen smaller red terminator dots** and must not be conflated.

The result has two exact source-number representations:

\[
\boxed{60\,675 = 58\cdot1033+761 = 75\cdot809.}
\]

Each component was present in the original player-visible material, although **the operation linking them is not printed**:

- **58:** the original LP2 JPEG release comprises physical files 0.jpg to 57.jpg, 58 pages including the rune-free table page50.
- **1033:** the magic sum of the 2014-author-specified smaller 5×5 and 7×7 squares, independently preserved in the square-submission stage and the original 2014 magic-square source.
- **761:** the 2013 original 761.MP3 basename, independently cross-checked by the original ID3 title THE / INSTAR / EMERGENCE, with complete GP-prime sums 72+280+409=761. This number also appears in historical 2014 puzzle material.
- **75:** the combined physical-source inventory contains 17 first-release LP1 images and 58 second-release LP2 images. This is a natural *combined-archive* count, but unlike 58 it was **not necessarily a separately displayed 2014 operator or single originally published LP2 page count**.
- **809:** the centre of the **5×5, magic-sum 3301** square from the original 2014 puzzle, at row3/col3 (1-based). Its printed source row is 626, 620, **809**, 620, 626. The source's second 5×5 square has magic sum1033. The two values 809 and1033 come from *distinct* source squares.

The same p3–p7 chapter is the **unique exact 60,675-sum window** among all 1,596 contiguous whole-page windows of unknown physical pp0–55. It is also the only such window with sum within 50 of that target. This uniqueness is relative to a **numerically selected** target; it is not evidence that anyone independently specified the target before the manuscript was examined.

## Source-frozen nine-chapter and label-randomization comparison

The original visually delineated nine LP2 unknown chapter lengths are **729,1145,1729,1903,1021,1433,1680,3008,308** runes. Their whole-unit GP-prime sums, in source order, are:

\[
[36\,781,\ \mathbf{60\,675},\ 88\,311,\ 97\,607,\
52\,024,\ 74\,431,\ 86\,896,\ 155\,581,\ 15\,876].
\]

To assess how special the **fixed observed equality** is, keep the original 29-value GP prime multiset, every actual source rune, every page/chapter boundary and every chapter's rune histogram unchanged. Uniformly reassign the 29 prime weights among the 29 rune *identities* using the deterministic seeded xorshift32 Fisher–Yates procedure in the reproducer. Of **300,000 pseudorandom label permutations (seed 0x33017610)**, precisely **14** reproduce a p3–p7 total of60,675. Of those same 300,000, **14** hit the target on any of the nine chapter totals; **2,156** place p3–p7 within ±50 of the total. The fixed-event exact fraction is 14/300,000 ≈ 0.0000467.

This is a conditional **numerical calibration only**. The relationship was recognized after examining original sums and many historical constants, including the arithmetic coincidence 75×809; a discovery-wide comparison would have to account for many potential page groupings, numerals, operations, moduli and source artifacts. The two sides of the boxed equation express **one** arithmetic event and cannot be multiplied as independent probabilities. The combined 75-image convention is a secondary archival packaging count, and the period-availability of using it as a multiplier is unverified. Accordingly no authorial checksum or ciphertext mechanism is identified.

## Attempted plaintext consumer: historically solved prime-totient with strict plaintext-F bypass

The only previously authenticated LP2 reversible glyph cipher is the p56 prime-totient sequence: subtract \(\varphi(p_j)=p_j-1\) modulo29, with a **literal plaintext F** output as F and consuming no prime. The source numbers 58/761/1033 could, hypothetically, name the starting prime-list ordinal on the five-page p3–p7 chapter. An exact dynamic program therefore tested zero-based starts **0, 58, 761, 1033**, preserving **every source glyph** and allowing every possible original-cipher-compatible F skip wherever the printed glyph is F. An encrypted step may never decode as F under this historical rule because F is by definition output literally.

| Zero-based prime start | First original p3–p7 position at which **all** legal F-skip masks fail |
| ---: | ---: |
| 0 | 22 |
| 58 | 27 |
| 761 | 33 |
| 1033 | 74 |
| 134 (first prime = **761**) | 10 |
| 139 (first prime = **809**) | 22 |

All offsets are zero-based from the first printed rune on p3. The same decoder successfully reproduces the entire independently solved 85-rune p56 plaintext with the actual single F bypass at local offset56; its state-survival DP also accepts the authentic p56. The proposed key starts are exploratory choices, not a claim that the source requested them. The strict-F contradiction rejects only **these prime-start applications of that precise historical cipher**, not an unknown non-additive cipher, a different key source, or an English-orthography variant.

The **five black dots** also suggest five successor steps in the publicly known ordinary-prime list. The two independently source-labeled numbers actually satisfy \(\pi(809)-\pi(761)=140-135=5\): the **five next primes after 761 are [769,773,787,797,809]**. This is an exact, reversible integer-key selector at the level of a *candidate operation*, and supplies a narrower test than arbitrary prime indices.

Applying the original p56 GP prime-totient/F-bypass cipher starting with the **actual primes** 761 or 809 fails at original p3 zero-based rune positions **10** and **22**, respectively, under all legal F-skip histories. Starting each of the five original pages p3,p4,p5,p6,p7 separately at the corresponding five successive primes [769,773,787,797,809] fails at original page-local rune positions **[24,54,21,3,71]**. These are deterministic complete-mask obstructions, not poor language-fit scores. They retire only direct consecutive-prime-totient consumers of the five-step source values, not the possibility of another authorized 761.MP3 binary XOR/key operation. The 2013 original audio byte/pad and BASE29→XOR proposals were already examined separately in [the original audio report](audio-761-pad-scan.md) and [the byte-header gate](lp2-2013-audio-base29-xor-header-gate.md); an exploratory new route must identify an operation genuinely different from these completed direct-audio tests.


## Research decision

**Keep the p7 five-dot/five-word red 766→761 relation together with the p3–p7 = 60,675 candidate complete-chapter checksum.** Its numerically connected historical values make it a bounded human clue, but without an independently selected operation the identity cannot turn original ciphertext into plaintext. A substantive successor would extract a *second, previously unexamined* whole-source prediction or a reversible 29-symbol cipher/key from the same historical square/title geometry, and reconstruct a coherent withheld original passage. Do not treat arbitrary prime-seed expansions, retuned chapter cuts, more multiplication matches or English-looking two-rune fragments as progress.

Inputs: [canonical 58-page rune arrays](../resources/liber-primus/lp2-corpus.json), [three authentic preserved squares](../resources/cicada2014-openpuff-magic-squares.txt), [2013 GP source chart](../results/2013-original-gp29-source-map.md), and [historical 2014 square provenance](../results/2014-onion-chain.md). All original ciphertext remains unchanged.
