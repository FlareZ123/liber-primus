# Original p49/p51 literal 32×8 byte-split receiver: exact keyless obstruction

**Agent39, 22 November 2026 · Director #2214.** Intermediate original-source result; no unknown plaintext, authentic cipher key or Cicada destination recovered. This original-input test addresses a direct 29-GP-rune input by eight-state byte-packed Mealy interpretation, distinct from the prior autonomous byte graph, eight-tap full-sentence FIR model, and previous-ciphertext-row substitution upper bound.

## Exact hypothesis

Original LP2 pp49–51 contain 32 rows of eight printed two-character numbers, conventionally 256 bytes. A direct player-facing interpretation is that 29 GP symbols plus three special marks index 32 rows, the eight columns encode a three-bit state, and the byte encodes a five-bit symbol plus three-bit successor state. The signed 2016 phrase “words are the map, numbers are the direction” is compatible with numerical navigation but never authorizes this specific encoding, bit split, special-row assignment or state initialization.

Two implications must be distinguished. An input-to-output ordinary lossless encoder must be injective for every admissible input glyph at every reachable state, since the emitted byte and next state must uniquely determine the plaintext row. A ciphertext-row-to-plaintext decoder may instead be many-to-one; test that separate literal possibility on the original p49 66-rune and p51 92-rune physical flanks.

## All-secret input row-mapping impossibility

The source radial-60 table byte SHA256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.

Find complete printed-token duplicates **within each original column**, treating the columns as possible successor states. Across all 32 rows there are **12** duplicate pairs. Concrete original zero-based examples: column0 rows8/13 have token 22, column2 rows4/14 token 3H, column3 rows15/21 token 0s, column7 rows19/20 token 48.

An arbitrary secret permutation of the 29 GP letters across any 29 of 32 rows can remove only three rows. Every same-token edge must lose an endpoint for the output byte to be injective. The exact minimum vertex cover of the original 12-edge collision graph has size **7**, with one optimum removed-row set [13,10,4,15,6,22,19]. The largest universally one-byte-injective input alphabet therefore has only **25** letters. Exhaustively testing **all 4,960 choices** of which three rows to omit leaves **at least 5 collision pairs** across **at least 4 state columns**, for every 29-rune assignment.

These token-equality obstructions survive either radix59 or radix60, arbitrary GP row labels and eight-state relabeling. They exclude an **unaugmented, universally reversible encoder** of all 29 GP symbols whose one emitted table byte jointly identifies output and next state. They do not exclude a homophonic/many-to-one decoder, a restricted input language, an unprinted disambiguation channel or a different byte operation.

## Original flanks: literal byte-packed decoder

Let observed ciphertext GP index C select row C, three-bit state s select column s, and b=T[C,s]. The decoder either emits five low bits (b AND 31), advances state by b shifted right five bits, or emits five high bits (b shifted right three), advances state by b AND 7. Under literal GP output, codes 29–31 are invalid. Exhaust all 8 starting states, both printed and reversed page order, both radix readings and both byte splits, independently for each entire p49 and p51 physical rune stream.

Minimum out-of-range output counts across the eight seeds:

| Radix | Split | Direction | p49 /66 | p51 /92 |
|---|---|---|---:|---:|
| 60 | low five | forward | 0 | 5 |
| 60 | low five | reverse | 4 | 6 |
| 60 | high five | forward | 5 | 10 |
| 60 | high five | reverse | 6 | 12 |
| 59 | low five | forward | 1 | 8 |
| 59 | low five | reverse | 2 | 10 |
| 59 | high five | forward | 8 | 7 |
| 59 | high five | reverse | 7 | 10 |

The apparent near-hit on original p49 for the natural radix60 low-five interpretation is rejected on the **independent untouched p51 flank**, where all eight seeds emit at least five invalid GP codes. None of the 64 source-input model/seed configurations yields two complete native-GP flank readings; allowing separate seeds does not rescue p51. A nontrivial synthesized invertible eight-state 32×8 table and genuine solved original p57 text recover all 95/95 GP symbols under all **16** seed-and-split synthetic positives. No original-runic plaintext is inferred.

## Reproducibility and next research decision

Read-only CommonJS SFT: [the original-input test](../sims/lp2_p49_p51_32x8_bitpacked_direct_mealy_sft.cjs). Exact source tables and GP indices are loaded directly from resources/liber-primus; the test asserts the known 256-byte digest, counts, 12 collisions, minimum seven row omissions, all 4,960 candidate alphabets, 128 complete original-decoder applications, and the 16 solved-GP positives. [Passing Windows Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/45013874817).

**Decision:** stop treating p50 as a literal five-bit GP output/three-bit state lookup or ordinary 29-symbol universally invertible byte-S-box. This is a bounded source-conditional negative. A genuinely competing architecture is **an address/instruction table whose bytes navigate a separately supplied operand** rather than jointly specify plaintext and state. That alternative presently lacks a first-party rule specifying the operand, index-to-address conversion and output serializer. The original complete pre/post-table sentences continue across p48 and p52; this test covers all physical p49 and p51 runes, not those larger sentence spans. Do not manufacture extra phase, row permutations or key texts in response to this failure.
