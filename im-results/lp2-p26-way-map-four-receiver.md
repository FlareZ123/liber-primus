# p26 as the first unknown-cipher receiver of the WAY -> MAP table move

**Agent10, 19 November 2026. Classification: bounded unknown-cipher state-transition candidate. No continuous plaintext is claimed.**

## Upstream operation was fixed independently

Earlier in this invocation, the signed-2016 scaffold and p29 derivative route fixed `WAY`, and the p50 table supplied the table-wide unique composite:

~~~text
57 = GP0(WAY)
p50[57] = 1w
one west -> 56 = GP0(MAP)

p50[56] = 4E
0x4E = N
one north -> 48 = GP0(HERE)
~~~

The exact `57 -> 56 -> 48` two-stage operation is the only digit+cardinal then hex-cardinal composite anywhere in the 256-cell table. It also transfers to the solved WELCOME adjacency `WAY HERE`.

The solved phrase `FIND THEIR WAY HERE` independently authenticated the high-digit readout:

~~~text
GP0-address words into p50
take each printed high digit
interpret those digits as GP indices

FIND THEIR WAY HERE
 -> [0S,3H,1w,4D]
 -> [0,3,1,4]
 -> FOUR
~~~

The unknown-page test below opens no new operation.

## Unknown-cipher transition census

Parse the original LP2 transcription into source-visible rune words on pages 0–55. For each within-page adjacent word pair:

1. compute each word's canonical GP0;
2. open the current word's p50 token;
3. only if that token matches literal `[1-9][NSEW]`, move on the fixed 32×8 table;
4. test whether the destination equals the next ciphertext word's GP0.

There are:

~~~text
3,288 within-page adjacent word pairs
292 movement-eligible source words
2 exact next-state hits
~~~

The two hits are:

~~~text
p7  line5 words5-6:
24 --1n--> 16

p26 line10 words2-3:
57 --1w--> 56
~~~

The p7 hit is a useful negative control: it is not the independently fixed WAY/MAP state pair and it does not continue through the unique two-stage table composite.

## The fixed 57 -> 56 edge occurs exactly once in unknown ciphertext

Across all unknown-page adjacent words, the source-selected state pair `57,56` occurs exactly once:

~~~text
p26 line10 word2  CHISFIN  GP0=57  p50=1w
p26 line10 word3  POENG    GP0=56  p50=4E
~~~

So the literal token at the first word predicts the GP0 address of the next unknown ciphertext word:

~~~text
57 --1w / one west--> 56
~~~

This is a genuine transition on unknown ciphertext addresses. It does not rely on interpreting CHISFIN or POENG as English.

## The same p26 boundary window independently reads FOUR

A second, already authenticated readout hits the same location.

Across all pages 0–55 there are **3,176** contiguous four-word windows. The fixed p50-high-digit rule yields `FOUR = [0,3,1,4]` in four windows total, on pages 5, 23, 26, and 31.

The p26 hit is:

~~~text
p26 line9 word5      E         GP0 18 -> p50 0F -> high 0 = F
p26 line10 word1     SAOE      GP0 61 -> p50 3G -> high 3 = O
p26 line10 word2     CHISFIN   GP0 57 -> p50 1w -> high 1 = U
p26 line10 word3     POENG     GP0 56 -> p50 4E -> high 4 = R
                                                        ----
                                                        FOUR
~~~

Thus the only unknown occurrence of the exact `57,56` WAY/MAP address transition is embedded inside a four-word window that independently emits the same source-derived word `FOUR`.

The other three unknown FOUR windows do not contain the fixed 57->56 transition.

## Deterministic state48 continuation stops on p26

The fixed table continuation from the selected state56 receiver is still:

~~~text
56 --4E / hex N--> 48
~~~

If this is interpreted as a state lookup on the same unknown page, p26 contains exactly one rune-word whose GP0 is 48:

~~~text
p26 line4 word1
ciphertext transliteration EAMU
rune vector [28,19,1]
GP0 = 48
~~~

This is a clean nonlocal receiver selection, but the next frozen HERE consumer does **not** transfer. The established current-page `4D` rule requires rune offset48 to be the fourth D on the page. On p26:

~~~text
rune offset48 = L
D-count through offset48 = 1
~~~

so the literal self-index fails. Stop the p26 navigation branch there rather than changing the 4D semantics.

## Shared-secret word probe is insufficient

The FOUR -> DH bridge reconstructs shared secret `K=2`. Applying only the two sign choices of a constant GP29 K-shift to the uniquely selected state56 ciphertext word gives:

~~~text
POENG = [13,22,21]

+K: [15,24,23] = SAD
-K: [11,20,19] = JLM
~~~

`SAD` is readable English, but a complete manuscript control makes it insufficient for plaintext promotion. Across **795** unknown three-rune words and both signs of K, the stable TextBlob English lexicon accepts **41/1590** outputs. The selected SAD result is unique as SAD, but readable three-rune accidents occur at a non-negligible background rate.

A whole-p26 +K pass also does not produce sustained English. Preserve `POENG + 2 = SAD` only as a bounded candidate word probe, not recovered plaintext.

## Boundary of the claim

The table's second stage remains:

~~~text
56 --4E / hex N--> 48
~~~

but p26's next ciphertext word after the state56 word has GP0 `95`, not `48`:

~~~text
p26 line10 first four word addresses:
61, 57, 56, 95
~~~

Therefore p26 does **not** supply a three-word ciphertext chain `57 -> 56 -> 48`. The first edge transfers directly to adjacent unknown words; the `56 -> 48` step remains a table-state continuation.

Do not call `FOUR` recovered continuous plaintext on p26 yet. The all-high readout has four unknown-page FOUR hits across 3,176 windows, so the lexical output alone is insufficient. What distinguishes p26 is the conjunction with the independently fixed and globally unique 57->56 table edge.

## Decision

Preserve p26 line10 words2-3 as the first bounded unknown-cipher receiver for the fixed WAY -> MAP state transition:

~~~text
unknown p26 word GP0 57
 -> original token 1w
 -> literal west
 -> next unknown p26 word GP0 56
~~~

and preserve the enclosing `18,61,57,56 -> FOUR` boundary window as supporting evidence.

The next decisive step should derive a source-selected use of the p26 state56 receiver, identify why p26 is chosen independently, or predict a plaintext/state at another unopened position before inspection. Avoid treating the p7 movement hit or the four generic FOUR windows as equivalent.

## Reproduction

Windows Node 22 PASS for the complete receiver and negative-continuation gate: [run 44448501937](https://github.com/FlareZ123/liber-primus/actions/runs/44448501937).


Run:

~~~text
node sims/lp2_p26_way_map_four_receiver_sft.cjs
~~~

The SFT performs the complete unknown-word movement census, proves uniqueness of the 57->56 adjacent pair, enumerates all unknown FOUR windows, verifies the p26 line/word coordinates, tests the failed immediate 56->48 continuation, follows state48 to its sole p26 word and rejects the frozen 4D self-index there, and charges the K=2 SAD/JLM word probe against the full three-rune signed-K English background.
