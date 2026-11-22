# P15's 18 one-rune words reconstruct all sixteen-state R16 source keys: no prose

**Agent 3, 22 November 2026. Original-cipher finite full-key recovery attempt and matched planted recovery.** The standalone [source-exact CommonJS runner](../sims/lp2_p15_r16_chapter_seed_recovery_sft.cjs) [passed on Windows Node22, Actions 44988190990](https://github.com/FlareZ123/liber-primus/actions/runs/44988190990). The four source-motivated chapter-local models generated **approximately 126,500 exact complete secret-state candidates each**. All high-ranked original-p15–22 inversions remain close to 1/29 symbol coincidence, while the genuine hidden-key GP-native plant is recovered at rank 1 in all four controls. No LP2 unknown plaintext, author key, cipher method or continuation was recovered.

## Why this is a real original decryption search

The unaltered physical LP2 p15–22 chapter starts at global rune position **3603** and has **1,903 ciphertext runes** in **437 authentic printed words**. The chapter's p15 opening prints sixteen numbers in a 4×4 Fibonacci-prime square; original physical pp49–51 print a separate 256-unit numerical table whose GF29 polynomial factors with a complementary monic degree16 factor:

`R16 = 13 + 20X + 26X² + 12X³ + 6X⁴ + 2X⁵ + 13X⁶ + 26X⁷ + 6X⁸ + 26X⁹ + 11X¹⁰ + 7X¹¹ + 15X¹² + 11X¹³ + 17X¹⁴ + 25X¹⁵ + X¹⁶.`

The cofactor is a genuine mathematical operand. A sixteen-stage LFSR is an inexpensive, historically human-plausible use of it, but no source chooses that operation. The earlier whole-book R16 test [exhausts all 29^16 states](lp2-p50-r16-allsecret-singleton-gate.md) and excludes an ordinary-English **uninterrupted global** stream. A chapter reset is distinct, independently motivated by the sixteen-number p15 opening and its original decorative chapter boundaries. This test **recovers feasible seeds from the actual original 1,903 ciphertext**, rather than enumerating a few hand-picked p15 integer seeds.

The 18 original *one-rune words* lie at exact chapter-local zero-based rune coordinates:

`[135,180,278,403,539,545,573,614,630,755,871,1030,1096,1148,1191,1650,1716,1733]`.

Their original GP29 cipher values are:

`[26,23,9,10,17,28,10,16,4,16,13,7,4,2,17,28,25,9]`.

Under the explicit native-English and unmodified-word-boundary hypothesis, each plain singleton is A or I. The model grants **every** secret 16-state register seed, every phase, and an **arbitrary fixed unknown plaintext alphabet permutation** sigma:

`C_i = sigma(P_i) + K_{clock(i)} (mod29)`.

Both R16 and reciprocal R16 are tested. Each register advances either once per rune or once per complete printed word, independently reset at the start of chapter p15; no p56 plaintext-F rule is projected onto this chapter. All 18 singleton value constraints are solved with field-linear algebra.

## Seed reconstruction and actual language readout

The source's first 16 singleton coefficient rows are independent over GF29, allowing the 16 unknown register values to be eliminated exactly. Fixing the first singleton as secret-label A only swaps names of the two unknown plaintext symbols, and loses no assignment. Exhaustively consider **2¹⁷ = 131,072** A/I label assignments; each reduces the final two original singleton constraints to a 2×2 GF29 system for the two arbitrary secret GP29 values sigma(A),sigma(I). The search includes every valid singular/free-value assignment, with uA=uI forbidden because sigma is bijective. In this source input there are zero consistent singular assignments, so each of the following rows counts *every full key satisfying all 18 original singleton constraints*.

Rank the **271** prechosen scattered original chapter runes by the **key-invariant GP29 frequency collision score** after subtracting each recovered key. A fixed unknown alphabet permutation cannot change this score. The best **1,500** candidates per model are then decoded over the entire untouched **1,903-rune** chapter, with no dictionary fitting. These 1,500 constitute a ranked subset; the full-chapter maximum across *every* feasible key was **not** exhaustively computed and no absolute exclusion theorem is claimed.

| Original chapter R16 orientation | Reset clock | All complete singleton-consistent keys | Best 1,903-rune decoded collision rate among 1,500 candidates |
| --- | --- | ---: | ---: |
| Printed factor | Rune | **126,540** | **0.0354871632** |
| Printed factor | Word | **126,562** | **0.0352716641** |
| Reciprocal factor | Rune | **126,544** | **0.0351843594** |
| Reciprocal factor | Word | **126,548** | **0.0351141841** |

These scores cluster near the uniform GP29 baseline **1/29 ≈ 0.03448276**, rather than a clear native-GP English register. The original top candidates do not yield a stable contiguous English message. Under this explicit test, the original ciphertext has no promising key in the entire author-source-motivated *language-ranked sample*. The unranked keys are an acknowledged gap; a cipher with resegmented text, a binary register, dynamic substitution, a different original language, or no simple additive layer lies outside this branch.

## Exact planted recovery calibrates the search

Create a full 1,903-rune GP-native test plaintext by cycling the independently clear 95-rune original p57 text and replacing all eighteen original singleton positions with alternating literal GP A and I. Cipher it with a fixed nonidentity GP29 substitution sigma(p)=2−p mod29 and the hidden sixteen-value seed xj=(7j+3) mod29. The result obeys the same chapter word shapes and reset. The solver sees only the ciphertext and original 18 singleton coordinates; it enumerates all feasible secret states and ranks the decodes with exactly the original scoring.

In all **four** model variants it reconstructs the **exact 16 hidden key values and both secret alphabet values**, places the genuine planted key at **rank 1** after full-chapter scoring, and recovers the 1,903 source-native plaintext runes. The native GP plaintext's index of coincidence is **0.0720866328** in all cases. A repeated p57 paragraph plus explicitly placed singleton words is a controlled high-repeat fixture, not an independent sample of natural English prose; its role is ensuring the recovery engine can find an actual source-native embedded message with the same constraints.

## Cryptanalytic decision

The fully reconstructed p15-local R16 source model is unlikely to explain the original chapter as ordinary GP-native plaintext under a fixed output alphabet. This is a **reproducible original-cipher candidate search**, independent of arbitrary starting-key guesses. The strong global-state exhaustive contradiction remains separately recorded in [the full-book R16 all-state gate](lp2-p50-r16-allsecret-singleton-gate.md); the present p15 result is a full-key reconstruction plus high-recall *ranked* plaintext screen, rather than an exhaustive full-text language theorem.

Further 16-value seeds, clock offsets or alphabet Caesar shifts inside this source LFSR branch cannot add a new source instruction. A meaningful continuation requires an independently author-selected changing-value operation, plaintext-dependent feedback, an authentic outside pad, or a previously unknown plaintext crib that yields a locked original-cipher prediction. Do not treat this negative as proof the true creator used R16 or that all GP29 chapter-rekeyed ciphers are impossible.

**Executable:** `node sims/lp2_p15_r16_chapter_seed_recovery_sft.cjs`. The SFT asserts the original 1,903-rune chapter and eighteen exact source anchors, enumerates all label patterns including singular edge cases, reconstructs all original candidate keys, and performs four separate native-positive tests. [Windows PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44988190990).
