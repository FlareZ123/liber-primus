# Cross-source selector audit: LP2 lag-five and adjacent-doublet structure

**Agent48 · 20 November 2026 · Director Issue #1981**

**Decision: close negatively at the source-selector gate.** The original stream has a real word-boundary/lag-five structure, but no authenticated source currently selects a complete reversible stateful cipher for it. No unknown plaintext, key, or destination is recovered.

## Observed constraint

The canonical LP2 stream contains 12,956 runes in 2,896 printed words. It has 86 adjacent-equal pairs (63 within words, 23 at word boundaries) and 104 within-word lag-five equalities among 2,105 eligible comparisons. The page-conditioned bigram null gives about 72.5 lag-five matches (upper tail approximately 0.0006). A separate fixed-cipher word-length shuffle retains every rune and its order but moves complete word cuts; the original boundaries still carry an excess of fifth-back returns. These are distinct constraints, not a cipher identification.

The result is compatible with a word-local codec, deliberate placement of word boundaries, or editorial/source process. The fixed-cipher boundary test does not distinguish those explanations. See the [page-Markov/lag-five gate](lp2-original-lagfive-conditional-page-markov-gate.md) and [fixed-cipher wordbreak gate](lp2-fixedcipher-wordbreak-lagfive-source-gate.md).

## Two strongest source-motivated models

### 1. Five-phase, word-reset additive state

The most economical candidate is a five-phase additive transform reset at each printed word:
\[
P_{w,j}=C_{w,j}-K_{j\bmod 5}\pmod{29}.
\]
The possible source cues are the five black dots on p7, the five numbered wisdom passages on p33–39, the five-value 2014 magic-square center/sum packet, the 2013 BASE29 instruction, and the 2016 emphasis on words.

The missing selectors are decisive:

- The p7 dots do not specify a traversal, five key symbols, five phase permutations, or a reset instruction.
- The 2014 square values have no authenticated mapping to a per-rune key or selected ordering. The p33 cuneiform BASE29 conversions (1033 → 16I; 3301 → 3QO) are numeral conversions, not a key schedule; direct additive consumers fail on the original p33–39 body.
- The 2016 wording makes printed words relevant, but does not say to reset a period-five clock at every word.

This is not a new search opportunity. The existing source-constrained gate already tested the natural p7 pentagram additive keys and five-rail alternatives against both lag-five and adjacent-repeat constraints. The additive variants fail the joint native-language control; five-rail transpositions fail the exact-word and joint-control tests. The all-secret five-tap linear-feedback search also excludes the stated global and chapter-local linear families. See the [source-constrained encoder decision](lp2-lagfive-source-constrained-encoder-gate.md), [five-tap spectral exclusion](lp2-fivetap-fullsecret-spectral-native-gate.md), and [p33 BASE29 key gate](lp2-p33-39-cuneiform-base29-key-gate.md).

### 2. p50 32×8 state/direction transducer

A second plausible-looking interpretation treats the p50 numerical object as 32 states by 8 directions: 32 is \(2^5\), 8 is the number of compass directions, and the 2016 signed message says that numbers provide direction. The 2013 BASE29 command might appear to offer an output alphabet.

But a reversible transducer requires a source-selected state representation, input-to-direction mapping, table-cell semantics, state update, initial key/seed, reset clock, and inverse. The source supplies none of these. Treating a table entry as both a next state and a GP29 output would be an invented encoding, not a reading fixed by the artifact.

The existing p50 base-60/successor-graph study explicitly classifies the byte and pointer readings as hypotheses. Its direct source-word-pair consumers do not reproduce the p0 marker key or recover unknown plaintext. It should remain a provisional navigation result, not be promoted into a stream cipher. See the [p50 functional-graph report](lp2-p50-functional-graph-2016-wordmap.md) and [2016 source-selector gate](lp2-2016-p50-p55-43unit-source-selector-gate.md).

## Historical and solved-page controls

- The authenticated 2013 TCP-server message specifies BASE29 numeral conversion and one worked DH exchange (\(p=23,g=5,a=6,b=15,A=8,B=19,K=2\)). It describes a participant-selected base and secret for each DH request. It does not specify a per-rune PRNG, a lag-five recurrence, or a stream-cipher clock. In particular, \(g=5\) is not an instruction to use a five-symbol feedback register. The tuple also predates the Cicada message in ordinary cryptography teaching material. See the [signed 2013 protocol audit](../resources/external/2013-tcp-server-signed-source.md).
- The 2016 signed map wording supplies a semantic prompt about words, roads, and direction, but no radix, address function, state update, reset, or key.
- The solved p56 page provides a genuine prime/totient additive cipher with a transparent-F rule and a continuous prime clock. Tested global, page-reset, and chapter-reset transfers do not decode the unknown pages. A word-local clock would be a new rule and does not inherit the p56 positive control without independent source evidence. See the [p56 transfer gate](lp2-p56-globalconjugation-two-longword-allsecret-original-gate.md).
- The clear p57 parable supports the p55 circumference/word-interior partition; it does not select a lag-five clock or five-phase key.

## Decision and reopening condition

Neither candidate supplies all five required elements—state, update, clock/reset, key source, and output mapping—from an independently observable source. The lag-five and adjacent-doublet statistics alone cannot choose those elements. No language-score optimization or blind p40–p55 search was run because neither model passes the source-selector gate.

Close Issue #1981 as a bounded negative. Reopen only when an original artifact selects a complete reversible operation and its key/state convention, or when a frozen source-derived rule predicts previously untouched plaintext without using language scores to choose the route. Do not expand generic five-phase permutations, arbitrary five-tap recurrences, or an unconstrained 32×8 state table.
