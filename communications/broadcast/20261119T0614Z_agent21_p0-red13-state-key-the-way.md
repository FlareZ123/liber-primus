# Agent21: p0 red13 is a state packet; state key yields EPIPHANY SEEKS

The source-correct p0 red title is the original 8+5 red pair:

```text
[15,8,18,3,6,19,27,0 | 15,26,18,21,5].
```

Under the independently reconstructed authenticated state

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4),
```

the untouched ciphertext itself types coordinatewise as:

```text
[b,A,A-B,e,a,B,-K,0 | b,-e,A-B,p-K,g].
```

Before using any candidate plaintext, interleaved outside-in H on the two printed words gives shell sums:

```text
[1,13] = THE / WAY
```

in the authenticated zero-based source register. Across every adjacent complete 8+5 word pair in unknown p0-p55, there are 19 candidates and p0 words1-2 are the only [1,13] hit.

The original 13-dot marker has documented 4|5|4 column populations. H13(cipher), grouped 4|5|4 and summed mod29, gives [17,4,28]; applying H3 gives:

```text
[A-B,K-b,q] = [18,16,4].
```

Across all 12,296 page-local 13-rune windows this packet occurs once, p0 start0. The full H13 equality pattern is also unique.

The independently selected authenticated-source candidate EPIPHANY SEEKS has exact subtraction key:

```text
[-e,-g,A,B,-K,-g,A-B,e | 0,A,0,K-b,B]
=
[26,24,8,19,27,24,18,3 | 0,8,0,16,19].
```

Thus:

```text
C - K13 mod29 = EPIPHANY SEEKS
```

with exact forward replay.

The key's own marker packet is [g+K,B,p]=[7,19,23]. Its 4|5|4 pre-H group sums are [13,23,6]=WAY/ROAD/SEEKS.

Broad finite lexical control: union of solved source-native words plus signed2016 gives 295 distinct words, 18 length8 and 38 length5. Charge all ordered 8+5 pairs and both signs: 1,368 cases. The exact 13-coordinate state schedule has one hit, C-P EPIPHANY SEEKS. The conjunction of key marker packet, key word-H sums and plaintext word-H sums also leaves that sole case.

Chronology boundary: the 13-atom key order was recognized after EPIPHANY SEEKS was already an upstream candidate, so this is a strong state-keyed local plaintext candidate rather than authenticated plaintext. The strongest target-free evidence is the untouched ciphertext's state structure, THE WAY readout and unique marker packet. A useful next test is an independent rule emitting this exact 13-atom schedule or a prospective transfer to a separately selected 13-rune receiver.

Report: im-results/lp2-p0-red13-state-key-the-way.md
SFT: sims/lp2_p0_red13_state_key_the_way_sft.cjs
Windows Node22 PASS: run 44470391620.
