# Source-selected repeat-deficit model gate (#2587)

The authenticated LP1 and LP2 p56 decoder convention is transparent plaintext F: P=0 emits C=0, and no key increment is consumed. The observed adjacent-repeat deficit does not authenticate a repeat-filter algorithm. The earlier first-difference linear-generator and keyless two-back results distinguish observations from an inverse. Two particularly simple transfers of the actual F exception into a strict anti-repeat encoder fail before any key search.

## Literal F bypass + non-F predecessor exclusion

Grant an arbitrary (possibly position- and key-dependent) mapping of 28 non-F plaintext symbols to the 28 ciphertext symbols unequal to previous ciphertext x. F emits literal 0. The cipher has 29 input choices. For x != 0, the 28 allowed non-F outputs include 0. To be injective, non-F outputs must occupy every one of those 28 positions, so some non-F input collides with the F output. Equivalently, reserving 0 leaves only 27 slots for 28 inputs. Thus this direct fixed-length transfer is not a lossless symbol decoder at a nonzero previous state unless additional information, output length or state-observation rules are specified. For x=0 the local mapping can be bijective.

Moreover, even granting a latent ambiguity decoder as in historical Vigenere/F-hold, literal F bypass + strict non-F predecessor exclusion predicts that all repeat ciphertext symbols equal 0. The exact original p0–55 GP29 pages contain 86 within-page equal adjacent pairs: only 4 are F, 82 are non-F. Repeat histogram in canonical GP order:
```
[4,2,4,4,2,1,5,6,2,4,2,4,2,1,6,3,2,0,4,2,3,2,4,2,1,7,2,2,3]
```
This exact contradiction is independent of key and state clock. No unknown plaintext assumptions are needed.

## Relative F bypass

Moving the exception from literal F output to zero step (C=x when P=F) restores 29-way local bijectivity if non-F inputs occupy the other 28 outputs. But it is not the historical transparent-F operation: for nonzero x it emits x rather than F. It also forces every original repeat to locate plaintext F, which is a special case of the already-tested all-29 fixed zero-marker family. Do not rerun that family. No source specifies an evolving sentinel, escape positions, or a reversible missing-repeat channel.

## Decision

The only independently authenticated exception does not supply a source-selected compact anti-repeat decoder: its literal transfer is impossible under the stated local bijection, and its relative transfer changes the historical operation and enters the previously excluded fixed-marker class. A one-symbol rejection filter is not authenticated by the 2013 protocol (see #2591). No source-selected compact candidate passes the entry gate, so no arbitrary keystream family, held-out planted key search, or post-fit transducer is justified. This closes the specified source-selection decision, not the possibility of an unknown stateful variable-length, key-dependent or layered cipher. Unknown plaintext/key: none.

Input: `resources/liber-primus/lp2-corpus.json`; count each equality of consecutive indices within physical pages <56. All histogram counts are exact. See [stationary difference](lp2-cumulative-difference-zero-symbol-gate.md), [fixed-marker](lp2-difference-allletter-capacity-source-gate.md), [two-back counterexample](lp2-28step-chain-keyless-lag2-counterexample.md).