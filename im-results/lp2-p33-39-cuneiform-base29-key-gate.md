# p33–39 cuneiform BASE29 outputs as a key: bounded negative

**Agent 16, 20 November 2026.** This is an intermediate rejection of two simple consumers, not a recovered plaintext or a claim that the BASE29 connection is irrelevant.

## Source-constrained premise

The p33–39 cuneiform section supplies the numerical inputs **1033** and **3301**. The repeated header raster and its page scope are documented in [the p33–39 cuneiform raster-reuse gate](lp2-p33-39-cuneiform-raster-reuse-source-gate.md). The signed 2013 Cicada TCP-server specification defines `BASE29` with alphabet `0123456789ABCDEFGHIJKLMNOPQRS` and explicitly prints only `BASE29(3301) = 3QO`. The March 3 participant transcript records `BASE29 1033 → 16I`; the January 26 participant transcript records `BASE29 30 → 11` and returns a participant-side handler. Neither participant log is PGP-signed as a whole; the March NEXT signature authenticates only its terminal payload. The `30 → 11` response is a two-digit witness against fixed three-character framing. The Jan26 handler parses decimal integers and emits minimal-width positive outputs; its zero/negative behavior is participant-specific, not official protocol semantics. See [the signed server source and reconciled vectors](../resources/external/2013-tcp-server-signed-source.md) and [the structured transcript index](../resources/external/2013-tcp-live-test-vectors.json).

Mapping those base-29 digit values directly to GP29 indices is an inference, not an instruction explicitly stated by either source. It yields:

| Base-29 output | GP29 indices | GP29 transliteration |
|---|---:|---|
| `16I` | `[1, 6, 18]` | `UGE` |
| `3QO` | `[3, 26, 24]` | `OYA` |
| `16I3QO` | `[1, 6, 18, 3, 26, 24]` | `UGEOYA` |

The p33–39 ciphertext contains **1,680 runes, 378 complete words, and 40 F runes**. Its length is divisible by both 3 and 6. That makes the two three-symbol outputs, and their six-symbol concatenation, a plausible short key candidate. The chapter is the fixed target; the key begins at phase zero and runs continuously across its page boundaries.

## Tests and results

The reproduction script is [`sims/lp2_p33_39_cuneiform_base29_key_sft.cjs`](../sims/lp2_p33_39_cuneiform_base29_key_sft.cjs). It reads the canonical LP2 corpus, transcription, and TextBlob word-frequency lexicon; no fitted phase, alphabet relabeling, page permutation, or key search is used.

The first test treats each candidate as a repeating additive GP29 key, in both directions. Word boundaries remain at their original positions.

| Key | Direction | Dictionary words / 378 | Coverage |
|---|---|---:|---:|
| `16I3QO` / `UGEOYA` | `P=C−K` | 27 | 7.14% |
| `16I3QO` / `UGEOYA` | `P=C+K` | 25 | 6.61% |
| `3QO16I` / `OYAUGE` | `P=C−K` | 27 | 7.14% |
| `3QO16I` / `OYAUGE` | `P=C+K` | 23 | 6.08% |
| `16I` / `UGE` | `P=C−K` | 26 | 6.88% |
| `16I` / `UGE` | `P=C+K` | 21 | 5.56% |
| `3QO` / `OYA` | `P=C−K` | 29 | 7.67% |
| `3QO` / `OYA` | `P=C+K` | 27 | 7.14% |

The untransformed ciphertext has 22 dictionary hits (5.82%). The decoded strings remain nonlinguistic; the small coverage changes do not constitute plaintext evidence.

The second test applies the established p56 F-transparent rule: plaintext F passes through without consuming a key symbol. A phase-state reachability test, independent of English scoring, finds **no complete legal inverse** for any of the eight fixed-key/sign combinations:

| Key | Direction | First impossible rune offset | Cipher rune | Containing ciphertext word |
|---|---|---:|---|---|
| `16I3QO` | `P=C−K` | 20 | G | `FTEOEEAAIASG` |
| `16I3QO` | `P=C+K` | 89 | J | `JL` |
| `3QO16I` | `P=C−K` | 162 | G | `XTHGD` |
| `3QO16I` | `P=C+K` | 34 | D | `YDBTR` |
| `16I` | `P=C−K` | 38 | U | `UJH` |
| `16I` | `P=C+K` | 141 | J | `EPJOWUEANGW` |
| `3QO` | `P=C−K` | 71 | Y | `AJAEGYMWD` |
| `3QO` | `P=C+K` | 71 | Y | `AJAEGYMWD` |

Finally, the six- and three-digit sequences were used as ordinary column-rank keys for the corresponding 6- and 3-column transpositions, in both inverse directions and both header orders. None of these outputs admits a complete segmentation using the same TextBlob GP29 lexicon. This is only a bounded rejection of that simple columnar interpretation, not an exhaustive transposition search.

## March 2013 BASE29/DH command-transfer gate (#2557, 24 November 2026)

The original images 50.jpg–56.jpg show the same two sexagesimal numerals (17,13) and (55,1), i.e. 1033 and 3301. The footer on physical p33 becomes a repeated header on p34–39. The five red numbered units are actually on **p36–38**, not five separate fields on p33: 139/91/98/96/129 runes, with item4 continuing across p37→38. The repeated emblem and five labels establish chapter scope and ordering, not a typed protocol trace.

The [preserved participant-side March log](../resources/historical/cicada2013-clientlog-1362290293-9.txt) gives the exact ordered command exchange below, including the observed `BASE29 1033 → 16I` response. The [signed January 2013 specification](../resources/external/2013-tcp-server-signed-source.md) independently establishes command semantics and its own `BASE29 3301 → 3QO` example. A separate January 26 participant log records `BASE29 30 → 11` and returns a CODE handler; that two-digit response resolves positive-output width but remains an unsigned participant witness. The signature on the March NEXT text authenticates only its payload, not the earlier numerical transcript. Prior work already analyzed the same DH3301 tuple and the [session census](../sims/lp2_2013_dh_session_census_sft.cjs); the new raw file is a local preservation of a known witness, not a new DH discovery.

| Wire value, in recorded order | Protocol type | Source-fixed from p33's two numerals? |
|---|---|---|
| 16I | BASE29 numeral representation of 1033 | Yes, **conditional on choosing BASE29**; digits [1,6,18] |
| 2757 | Participant-server-selected group base | No |
| 1264 | Participant-server public share, 2757^331 mod3301 | No |
| 2800 | Organizer/client public share, received by participant server | No |
| 1067 | Shared DH value, 2800^331 mod3301 | No |
| NEXT | Command carrying organizer-supplied text for storage | No LP2 ciphertext consumer |

The participant server sends 16I and 2757 1264, receives 2800, sends DATA 1067, then receives NEXT and the signed payload. Between BASE29 and DH the transcript contains four repeated participant-authored KOAN responses; these are not four organizer-authored stages. The five numbered LP2 units do not supply command tags, the private exponent 331, an integer serialization, or a rule that assigns any of the above values to an intact unit.

### Exact missing-state counterexample

Hold even more than the two manuscript numerals fixed: grant the recorded modulus 3301, participant base 2757, and organizer public share 2800. The signed protocol permits the participant to select its own secret. With secret 331 the transmitted share is 1264 and shared value is 1067. With secret 332, an equally admissible choice, the transmitted share is 2293 and shared value is 195. Both obey precisely the same protocol. For secrets 2..3299, there are **50 distinct shared results** even with the recorded public share held fixed. Conversely, with the actual participant secret 331 held fixed but client secret variable, there are **550 distinct shared results** in that same range; client exponents 11 and12 give public shares 2800 and1862 and shared results 1067 and1880 respectively. These are toy-protocol arithmetic controls, not LP2 key candidates.

Reproduce the exact finite ambiguity count (executed in local Python and separately in connected JavaScript on the preserved record):

```python
p, g, a, B = 3301, 2757, 331, 2800
assert 17*60+13 == 1*29**2+6*29+18 == 1033
assert 55*60+1 == 3*29**2+26*29+24 == p
assert (pow(g,a,p),pow(B,a,p)) == (1264,1067)
assert (pow(g,332,p),pow(B,332,p)) == (2293,195)
assert len({pow(B,x,p) for x in range(2,p-1)}) == 50
assert len({pow(pow(g,b,p),a,p) for b in range(2,p-1)}) == 550
assert (pow(g,12,p),pow(pow(g,12,p),a,p)) == (1862,1880)
```

This is an exact counterexample to the proposed deterministic handoff from the printed two numerals alone: even the command choice and most of the observed DH inputs do not uniquely specify 1067. The five ordered runic units could in principle supply the missing private/public state, but no independent source rule specifies their roles, nor a reversible mapping from variable-length native rune text to these fields. Merely counting 16I plus four integer fields gives five only by suppressing the private state, KOAN calls, control tokens and NEXT payload. Choosing them as five keys, positions, lengths, or base29 GP digits would invent the missing receiver.

**Decision for #2557:** stop before ciphertext scoring because the source-fixed typed mapping prerequisite fails. Even a positive period-availability result in #2556 would establish access to historical command semantics or the actual transcript, not the required LP2 item-to-field binding. A new independent original clue that fixes the full DH state and the recipient's inverse/serialization would justify a different test. The known DH23 route is outside this specific rejection. This is not a rejection of BASE29 or DH as general operations, and no original plaintext or key is recovered.

## Decision

Reject the direct repeating additive-key and simple columnar-key interpretations of `16I` and `3QO` for p33–39. The F-transparent result is decisive for those exact fixed-phase key schedules. Do **not** infer that the BASE29 conversion is a false clue: the outputs could still be addresses, selectors, or inputs to a different source-specified operation. The exact March BASE29/DH command-transfer branch also fails its typed mapping prerequisite; do not use the participant-generated state as an LP2 key without a separate source selector. No further cipher families or fitted phases are justified by the current evidence.

Reproduce with:

```sh
node sims/lp2_p33_39_cuneiform_base29_key_sft.cjs
```
