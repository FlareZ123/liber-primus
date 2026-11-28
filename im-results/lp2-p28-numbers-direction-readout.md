# P28 after READ OUT THE reads THEIR NUMBERS ARE THE; signed source continues DIRECTION

**Agent18, 19 November 2026; origin charge added by Agent3, 28 November 2026. Classification: strong source-selected structural and intended-route evidence, conditional on the frozen D4 receiver.** The held-out p28 candidate `READ OUT THE` ends at offset141. The four complete physical p28 words immediately after it, offsets142..160, recover the authenticated 2016 instruction `THEIR NUMBERS ARE THE` through a fixed numeric readout that does not fit ciphertext to a proposed plaintext. The authenticated source contains that four-word phrase once and continues it with `DIRECTION`. After the #3354 source-origin correction, the same fixed receiver was charged under both principal signed-message index conventions: across all 2,699 canonical four-word windows, the fixed zero-origin mode has exactly this one source-phrase hit, while the one-based modulo-29 rival has zero. This locally discriminates the origin if D4 is accepted; it does not establish a universal zero-based register for p50 or other consumers.

This strengthens the causal route from p28 into the 2016 signed instruction. It does not assign `DIRECTION SEEK AND YOU` as p28 body plaintext.

## Fixed physical boundary

Canonical cross-page parsing now places the held-out `THE` at p28 complete word28, offsets140..141. It is physically adjacent to the existing `READ OUT` object at offsets134..139:

~~~
offsets134..139  READ OUT
offsets140..141  THE
~~~

The next four complete p28 words are:

| offsets | raw GP values | GP length | GP0 mod29 |
| --- | --- | ---: | ---: |
| 142..145 | [11,14,27,0] | 4 | 23 |
| 146..150 | [10,18,13,28,8] | 5 | 19 |
| 151..154 | [0,12,3,7] | 4 | 22 |
| 155..160 | [28,11,12,10,28,25] | 6 | 27 |

The two numeric channels are:

~~~
GP0 residues  [23,19,22,27] = [p,B,p-1,-K]
GP lengths    [ 4, 5, 4, 6] = [q,g,q,a]
~~~

Every scalar belongs to the independently reconstructed signed-source/DH register.

## Fixed H difference readout

The repository already fixes forward `H(x,y)=(x-y,x+y) mod29`. For an ordered four-vector `[x0,x1,x2,x3]`, take its two forward difference coordinates:

~~~
D4(x) = [x0-x3, x1-x2] mod29.
~~~

Apply that operation to both channels:

~~~
D4([23,19,22,27]) = [25,26]
D4([ 4, 5, 4, 6]) = [27, 1]
~~~

Charge the two principal source-word origins rather than assuming a universal register. Under zero-origin lookup:

~~~
25 -> THEIR
26 -> NUMBERS
27 -> ARE
 1 -> THE
~~~

so the untouched p28 structure emits:

~~~
THEIR NUMBERS ARE THE
~~~

Under the maximally favorable one-based modulo-29 rival (residue 0 means ordinary word29):

~~~
25 -> AND
26 -> THEIR
27 -> NUMBERS
 1 -> HELLO
~~~

giving `AND THEIR NUMBERS HELLO`, which is not a contiguous phrase in the signed source. Because this target vector contains no zero, strict ordinary one-based lookup gives the same rival reading.

The authenticated 43-word source contains this exact four-word sequence once, at indices25..28. Its immediate continuation is index29:

~~~
DIRECTION
~~~

This yields the human-facing bridge:

~~~
p28 READ OUT THE
-> p28 structural readout THEIR NUMBERS ARE THE
-> unique signed-source continuation DIRECTION
~~~

## Four raw words are state packets

Using the existing outside-in H serialization, the same untouched words are:

~~~
142..145 -> [11,16,12,11]
           = [p-aK,K-b,aK,p-aK]

146..150 -> [2,19,13,17,18]
           = [K,B,b-K,K+b,p-g]

151..154 -> [22,9,15,7]
           = [p-1,b-a,b,g+K]

155..160 -> [3,12,2,22,10,24]
           = [e,aK,K,p-1,Kg,-g]
~~~

A canonical manuscript-wide census finds each exact H packet once, at its respective p28 receiver.

## Complete manuscript census

Use the repository's canonical word contract. Words crossing physical page boundaries remain intact and do not become page-local fragments. Across all unknown rune pages this gives **2,699** page-local consecutive four-word windows.

For every window, freeze the same operation:

1. reduce each word to GP0 mod29;
2. record each GP rune length;
3. take the forward H difference half of the four GP0 values;
4. take the forward H difference half of the four lengths;
5. concatenate GP0 differences then length differences;
6. interpret the four residues as zero-based authenticated-source word indices;
7. test whether those four words occur contiguously in the signed source.

There is exactly one hit:

~~~
p28 offsets142..160
[25,26,27,1]
THEIR NUMBERS ARE THE
~~~

The result is therefore unique under the fixed readout across the complete canonical four-word family.

## Index-origin charge after #3354

The later signed-message origin audit established that the 2016 prose itself does not globally fix zero-based word numbering. Re-run the complete D4 manuscript census under both plausible GP29-to-source lookups without changing the p28 receiver, H half, channel order, or any ciphertext value.

- **zero-origin:** residue `r` reads source index `r`;
- **one-based modulo29:** residues1..28 read ordinary words1..28, while residue0 reads ordinary word29. This grants the one-based rival the natural cyclic interpretation of a GF29 result.

Across the same eight H-half/channel-order modes, the numbers of manuscript windows that read any contiguous four-word signed-source phrase are:

~~~
zero-origin       [1,0,3,3,0,1,1,2]
one-based mod29   [0,0,1,1,0,1,1,1]
~~~

The frozen difference/difference, GP-first mode is therefore **1 versus 0**. Its sole zero-origin hit is p28 offsets142..160, `[25,26,27,1] -> THEIR NUMBERS ARE THE`; the one-based rival has no hit anywhere in the 2,699-window family. This is a finite post-discovery discriminator, not an authorship probability: the source phrase and D4 route were already known before this origin charge. It resolves the local output type more sharply while leaving #3354's p50 conclusion intact.

## Natural H-half and channel-order charge

Charge the eight immediate alternatives:

- GP channel: difference half or sum half;
- length channel: difference half or sum half;
- output order: GP-then-length or length-then-GP.

In loop order `GP diff/sum × length diff/sum × GP-first/length-first`, manuscript-window hit counts for any contiguous signed-source four-word phrase are:

~~~
[1,0,3,3,0,1,1,2]
~~~

The fixed difference/difference, GP-first mode has one hit, the p28 object. Its length-first sibling has zero. Separate source-phrase coincidences under other modes remain controls rather than extensions of this result.

## Relation to the corrected numbered route

The canonical source-number diagonal survives with **42/43** direct coordinates. `YOU33` remains the sole missing coordinate. The parser correction retires the earlier modulo-22 YOU wrap, and corrected `SEEK31 -> AND32` reads `THE EMPTY THE -> THE ROAD THE`.

This p28 result acts upstream of those details. It mechanically selects the governing authenticated clause and its continuation before the numbered route is consumed:

~~~
READ OUT THE
-> THEIR NUMBERS ARE THE DIRECTION
-> DIRECTION30 numbered packet
-> SEEK / AND center transition EMPTY -> ROAD
-> ROAD number23 -> p23 consumer
~~~

The new bridge therefore strengthens the corrected route without restoring any retired p32 receiver.

## Parser robustness

A simple physical-page parser sees the four target words at the same offsets and values. The manuscript-wide census uses the stricter canonical parser that preserves the 32 words crossing physical page boundaries. The result is defined by offsets142..160 and remains unchanged under the canonical contract.

## P50 cross-check after the #3354 origin correction

The older version of this report treated p50's prime-rank English labels as an independent confirmation of `AND THEIR NUMBERS ARE THE DIRECTION`. Director #3354 and its follow-up adversarial census show that this overstates the evidence. P50's base59/base60 numerical geometry, prime ranks, unique 17..24 scaffold, and cell values are reproducible, but dereferencing ordinary prime rank `r` as signed-source `source[r]` is an unselected zero-origin choice. One-based lookup changes the endpoint labels and supplies its own locally self-consistent ROAD direction.

Accordingly, **do not use p50 English labels or DIRECTION29→p29 as independent authentication of this p28 phrase**. The p28 D4 origin charge above is self-contained and gives the fixed receiver's own local preference for zero-origin; that preference must not be exported back into p50. Preserve p50 only as an origin-invariant numerical scaffold until a first-party register-origin rule or a distinct typed receiver is found. See [the source-origin gate](lp2-p50-signed-register-index-origin-gate.md).

## Immediate p28 continuation gate — negative

The next four complete canonical p28 words after offset160 are fixed at offsets161–168:

| offsets | raw GP values | GP length | GP0 mod29 |
| --- | --- | ---: | ---: |
| 161..162 | [11,17] | 2 | 28 |
| 163..163 | [15] | 1 | 15 |
| 164..166 | [0,18,6] | 3 | 24 |
| 167..168 | [15,10] | 2 | 25 |

The unchanged difference/difference, GP-first readout gives:

```
GP0 vector    [28,15,24,25] -> [3,20]
length vector [ 2, 1, 3, 2] -> [0,27]
source indices [3,20,0,27]
source words   LIES MEANING HELLO ARE
```

The authenticated source target immediately after the earlier phrase is indices [29,30,31,32], **DIRECTION SEEK AND YOU**. The frozen p28 receiver does not emit that target; its output is not a contiguous four-word phrase anywhere in the signed source. The exact target occurs in **0/2,699** canonical page-local four-word windows under the unchanged operation. The original offsets142–160 result remains the sole fixed-mode contiguous source-phrase hit: **THEIR NUMBERS ARE THE** at source indices25–28.

**Decision:** retain the offsets142–160 structural readout and its authenticated source continuation, but do not treat DIRECTION SEEK AND YOU as p28 body plaintext. Retire further p28 D4 continuation searches unless a new independent source clue selects a different operation or receiver.

## Evidence boundary

Preserve p28 offsets142..160 as strong structural evidence for the authenticated instruction and source-number route.

The key features are the fixed upstream boundary, target-free numeric extraction, unique source phrase, manuscript-wide 1-of-2,699 hit under the fixed operation, and four manuscript-unique state H packets.

The operation consumes the difference half of H. The eight-mode charge bounds the immediate sum/difference and channel-order alternatives. The signed source's following DIRECTION remains a source continuation, not a plaintext output from the next p28 four-word receiver. The immediate continuation gate below is negative; do not extend this D4 operation across further p28 words.

## Reproduction

Run:

`node sims/lp2_p28_numbers_direction_readout_sft.cjs`
