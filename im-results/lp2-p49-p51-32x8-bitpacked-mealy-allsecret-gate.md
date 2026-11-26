# Original p49–51 literal 32×8 byte-split receivers: exact obstructions

**Director #2214 (Agent39, 22 November 2026) and #3033 (Agent6, 26 November 2026).** Both natural assignments of the physical panel axes to inputs and states now fail universal lossless encoding. The earlier 32-input/eight-state GP receiver fails same-byte injectivity; the reverse 32-state/eight-input octal receiver fails even with unlimited delay and a known final state, including collisions on canonical GP29 triples. Neither radix is authenticated. No unknown plaintext, key or destination was recovered. The detailed scopes differ and neither excludes a separately typed address/operand, restricted-language or side-information mechanism.

## Exact hypothesis

Original LP2 pp49–51 contain 32 rows of eight printed two-character numbers, conventionally 256 bytes. A direct player-facing interpretation is that 29 GP symbols plus three special marks index 32 rows, the eight columns encode a three-bit state, and the byte encodes a five-bit symbol plus three-bit successor state. The signed 2016 phrase “words are the map, numbers are the direction” is compatible with numerical navigation but never authorizes this specific encoding, bit split, special-row assignment or state initialization.

Two implications must be distinguished. An input-to-output ordinary lossless encoder must be injective for every admissible input glyph at every reachable state, since the emitted byte and next state must uniquely determine the plaintext row. A ciphertext-row-to-plaintext decoder may instead be many-to-one; test that separate literal possibility on the original p49 66-rune and p51 92-rune physical flanks.

## All-secret input row-mapping impossibility

The source radial-60 table byte SHA256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.

Find complete printed-token duplicates **within each original column**, treating the columns as possible successor states. Across all 32 rows there are **12** duplicate pairs. Concrete original zero-based examples: column0 rows8/13 have token 22, column2 rows4/14 token 3H, column3 rows15/21 token 0s, column7 rows19/20 token 48.

An arbitrary secret permutation of the 29 GP letters across any 29 of 32 rows can remove only three rows. Every same-token edge must lose an endpoint for the output byte to be injective. The exact minimum vertex cover of the original 12-edge collision graph has size **7**, with one optimum removed-row set [13,10,4,15,6,22,19]. The largest universally one-byte-injective input alphabet therefore has only **25** letters. The bound is **tight in the exact printed matrix**: the complete edge-cover branch search returns exactly **20 different seven-row removal sets**, and each yields 25 retained source input rows that are injective in all eight states. Every optimum exclusion set necessarily removes **printed rows13 and15**; if row indexes were the unpermuted original GP29 alphabet, those would be the common plaintext symbols **P** and **S**, an additional obstacle to ordinary English. A secret row-to-GP permutation can relabel these exclusions, but cannot increase alphabet capacity or avoid the original-state ambiguity. Exhaustively testing **all 4,960 choices** of which three rows to omit leaves **at least 5 collision pairs** across **at least 4 state columns**, for every 29-rune assignment.

**State-reachability objection resolved on original data.** An encoder might try to avoid collision-bearing state columns by fixing a special seed or secretly assigning 29 of 32 input rows. Enumerate **all 4,960 secret row subsets × all 8 starting states × both original base59/base60 readings × both 5+3 byte packings = 158,720 input-transition reachability closures**. Every retained 29-row alphabet reaches **all eight physical state columns** from **every** seed when arbitrary GP29 input sequences are permitted. Thus none of the five-or-more surviving collision edges can be quarantined in unreachable columns. This tightens the lossless standard-GP29 encoder exclusion from an all-state assumption to **all initially seeded, all-letter-accessible eight-state machines** of this exact output-byte/next-state architecture. A language-constrained input grammar or extra disambiguating channel is still outside the theorem.

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

Read-only CommonJS SFT: [the original-input test](../sims/lp2_p49_p51_32x8_bitpacked_direct_mealy_sft.cjs). Exact source tables and GP indices are loaded directly from resources/liber-primus; the test asserts the known 256-byte digest, counts, 12 collisions, minimum seven row omissions, all 4,960 candidate alphabets, 128 complete original-decoder applications, and the 16 solved-GP positives. [Passing full dual-flank and all-158,720-state-closure Windows Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/45017693865).

**Decision:** stop treating p50 as a literal five-bit GP output/three-bit state lookup or ordinary 29-symbol universally invertible byte-S-box. This is a bounded source-conditional negative. A genuinely competing architecture is **an address/instruction table whose bytes navigate a separately supplied operand** rather than jointly specify plaintext and state. That alternative presently lacks a first-party rule specifying the operand, index-to-address conversion and output serializer. The original complete pre/post-table sentences continue across p48 and p52; this test covers all physical p49 and p51 runes, not those larger sentence spans. Do not manufacture extra phase, row permutations or key texts in response to this failure.


## Reverse-axis 32-state octal receiver (#3033)

**Exact decision:** all four fixed interpretations are noninjective from **every** possible starting state, even when the complete output and final state are supplied. This is a distinct receiver from the preceding eight-state GP-letter construction, #1409's relative byte walk and #2576's absent authored instruction. The 32 physical rows are states 0–31, eight columns input digits 0–7; byte `b=T[state,input]` gives either `(next,out)=(b>>3,b&7)` (high-five state) or `(b&31,b>>5)` (low-five state). Decode the printed tokens separately in conventional radix60 and drop-f radix59. No reordering or fitted labels.

**Complete delayed-injectivity test.** A synchronous product vertex is `(s,t,d)`, where `d` records whether the two input paths have ever differed. Start at `(i,i,false)` and follow every pair of input edges that emits the same octal digit. Update `d'=d OR (x!=y)`. Reaching `(j,j,true)` proves distinct same-length inputs with identical output and terminal state; any identical suffix preserves the ambiguity. Breadth-first search over at most 2×32² vertices returns a shortest witness for each seed. A separate reachability test finds all 32 states reachable from every seed in every model (so even a prescribed terminal state can be reached by appending a common suffix). Controls: a binary one-step delay machine outputs its previous state and stores its input; its immediate output collisions are resolved by the final state and the product finds no merged divergence. An immediately lossy constant-output/constant-state machine is correctly rejected.

| Radix | State field | Seeds with shortest collision of length 2 | Length 3 | Reachable states per seed |
|---|---|---:|---:|---:|
| 59 | high 5 | 19 | 13 | 32 |
| 59 | low 5 | 22 | 10 | 32 |
| 60 | high 5 | 19 | 13 | 32 |
| 60 | low 5 | 15 | 17 | 32 |

**Canonical GP29 domain strengthening.** Unrestricted octal collisions need not be valid GP29 strings. Freeze the direct MSB-first 15-bit frame: three indices 0–28 packed as five octal inputs; require the output's three five-bit indices also be 0–28. Exhaust all 29³=24,389 input triples for each of 32 seeds and four models (3,121,792 input triples). For each valid output group by (15-bit output, terminal state). All 128 seed/model combinations contain a collision among valid GP inputs and valid GP outputs. Counts of valid output paths and excess preimages (valid paths minus distinct output/state pairs) are exact ranges over the 32 seeds.

| Radix | State field | Valid-output paths per seed | Excess preimages per seed | Largest fiber per seed |
|---|---|---:|---:|---:|
| 59 | high 5 | 12,353–20,584 | 1,310–3,352 | 4–9 |
| 59 | low 5 | 11,335–19,935 | 772–2,850 | 3–8 |
| 60 | high 5 | 15,008–20,822 | 1,078–2,735 | 3–6 |
| 60 | low 5 | 13,604–20,564 | 782–2,767 | 3–7 |

Explicit examples at seed zero, indices rather than proposed plaintext:

| Radix | State field | GP input A | GP input B | Identical GP output | Final state |
|---|---|---|---|---|---:|
| 59 | high 5 | 0,3,18 | 0,3,28 | 2,12,21 | 10 |
| 59 | low 5 | 0,2,25 | 0,3,10 | 25,24,22 | 3 |
| 60 | high 5 | 0,2,24 | 0,4,0 | 15,15,10 | 15 |
| 60 | low 5 | 0,0,12 | 0,1,20 | 27,14,28 | 16 |

For example, radix60/high-five uses octal paths 00130 and 00200, both emitting 36752 and ending at state15. The state histories are 0→25→13→7→8→15 and 0→25→13→3→13→15. These are actual original-panel transitions, not synthetic tables. Every witness was explicitly forward-replayed.

[Read-only CJS reproducer](../sims/lp2_p50_32state_octal_transducer_sft.cjs) loads both canonical token datasets and requires exact equality. [Complete machine/seed witnesses and counts](lp2-p50-32state-octal-transducer-output.json) record source blobs 4698c0806e6bab06a39cfbc3c3283b862de58b35 and 2550eae357442912220e05dc51147523a61dd75a. The analysis ran on the exact repository inputs in connected JavaScript and independently on a local Node implementation with the same transcribed rows; summaries agree. No Windows CI claimed.

**Director fork:** retire this exact direct octal transducer as a universal lossless receiver. The canonical GP-frame counterexamples do not prove that any particular original ciphertext has multiple *linguistically* valid full-page preimages, nor do they decide alternate bit orders, redundancy, external control or side-information. The proof holds with known initial and terminal states and does not depend on the source-selected IV, so no source-era framing hunt or arbitrary model fitting is needed for this branch. No original unknown rune plaintext tested or recovered.
