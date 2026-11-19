# P28 literal-DH fragment lengths self-encode the READ OUT center transform

**Agent15, 19 November 2026. Classification: source-visible structural support for the p28 READ OUT mechanism. This was discovered after the READ OUT candidate and therefore is corroborative rather than a prospective plaintext prediction. It materially reduces the freedom in the center transform and the one-based cube-layer interpretation.**

## Result

The unique literal-DH physical line on p28 has five printed fragments:

```text
DH | NPA | EORHNNGEAFNF | OMSN | EAAIUL
```

Their rune lengths are:

```text
[2, 3, 9, 4, 5]
```

The independently reconstructed state of this same line is:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
```

and the independently selected GP29 cube exponent is:

```text
e=3
```

The source geometry now supplies a compact self-description before any English scoring:

| source fact | value | relation |
| --- | ---: | --- |
| total line length | 23 | `p` |
| fragment count | 5 | `g` |
| physical line number | 6 | `a` |
| fragment 1 length | 2 | `K` |
| fragment 2 length | 3 | `e` |
| fragment 3 length | 9 | `e^2 mod28` |
| p28 page-center rune | 9 | GP index of `N` |
| fragment 4 length | 4 | `9^3 mod29 = 4`, GP index of `R` |
| fragment 5 length | 5 | `g` and the selected page-numbered word length |

The first four fragments contain exactly 18 runes. Their final rune is therefore line position18 and page offset134, the exact center of the 269-rune page. That center rune has GP index9. The fifth fragment begins at offset135 and is exactly p28 word28.

Thus the fragment-length geometry predicts the first decoded rune without a language model or dictionary:

```text
center N = 9
fragment-2 length = e = 3
9^3 mod29 = 4
fragment-4 length = 4 = R
```

The already fixed outer-H operation makes this prediction redundant inside the same source line. Fragment2 is `NPA`, whose outer pair gives:

```text
H(N,A) = H(9,24) = [14,4]
```

So fragment2 simultaneously supplies the exponent through its length **3** and the decoded center value through its H second coordinate **4**. Fragment3 length **9** equals the actual page-center rune value, while fragment4 length **4** repeats the H output. The complete source equation is therefore:

```text
(center value)^(fragment2 length) mod29
= 9^3 mod29
= H(fragment2 outer pair)[1]
= fragment4 length
= 4 = R
```

The exponent progression is also visible in the lengths:

```text
3 -> 9 -> 27   modulo28
 e    e^2  e^3
```

Fragment2 supplies 3 and fragment3 supplies 9. Continuing the same cube-exponent orbit once gives27, the exact exponent used on the five-rune word. The zero-index rival exponent9 is therefore present as the intermediate orbit state rather than the next state.

The selected word self-encodes the same exponent through the already fixed H operation. Its outer pair gives the DH public values:

```text
H(EA,L) = H(28,20) = [8,19] = [A,B]
```

Apply H once more to those labeled values:

```text
H(A,B) = H(8,19) = [18,27]
```

The second coordinate **27** now has three independent source descriptions:

```text
e^3 mod28 = 3^3 mod28 = 27
physical page number - 1 = 28 - 1 = 27
H(A,B)[1] = 27
```

Across the ten physical page-numbered five-rune words on unknown p0..p55, p28 is the **only** one whose twice-applied outer-H second coordinate equals `page-1 mod28`. This matched family does not use plaintext scoring.

Applying the already frozen transform gives:

```text
center: 9^3 mod29 = 4 = R
word28 [28,24,10,1,20]^27 mod29
       = [28,23,3,1,16]
       = EA D O U T

=> READ OUT
```

The inverse remains exact.

## Matched manuscript census

Reparse every unknown rune-bearing physical line on p0..p55, excluding runeless p50.

There are:

- **594** rune-bearing physical lines;
- **145** lines of exactly23 runes;
- **45** lines of exactly23 runes with five printed fragments;
- **4** such lines at physical line number6.

Across all594 lines, the exact ordered fragment-length sequence

```text
[2,3,9,4,5]
```

occurs **once**: p28 line6.

It is also the sole occurrence whose first four fragments end exactly at an odd page's rune center with center value9.

A broader center-boundary control does not condition on the exact p28 length sequence. Across all594 lines, only **two** lines have at least four fragments, have fragment4 end exactly at the page center, and have the center rune value equal fragment3's length:

```text
p11 line6: lengths [8,9,2,2], center=2,
            H(fragment2)[1]=27, 2^9 mod29=19  -> fails

p28 line6: lengths [2,3,9,4,5], center=9,
            H(fragment2)[1]=4, 9^3 mod29=4   -> passes
```

P28 alone also has that power output equal fragment4's length. This is a source-only matched control for the center equation itself.

This census is a control on the source pattern, not an authorship probability. The pattern was noticed after READ OUT was already known.

## Relation to the existing DH reconstruction

The length structure is independent of the outer-H values used to reconstruct the state. On the same line, outer-H gives:

```text
[15,2], [14,4], [12,12], [23,12], [8,19]
```

which supplies the standard DH tuple. The new observation uses only fragment lengths plus the already fixed center location and exponent3.

This creates a tighter human solve-path hypothesis:

1. recognize the literal `DH` line;
2. recover its standard DH23 state from the already fixed outer-H operation;
3. obtain the unique GP29 cube exponent3 from the DH bridge;
4. notice that the line's fragment lengths are `[K,e,e^2,R,g]=[2,3,9,4,5]`;
5. use the page-center value9 and exponent3 to predict `R=4`;
6. continue the visible exponent orbit from3 to9 to27 for the three-layer word28;
7. decode the exact center-plus-word object to `READ OUT`.

The word exponent no longer depends only on interpreting three visible layers as three actions: the final selected fragment itself gives `[A,B]`, whose second H coordinate is27, and the page number independently gives27. The `3 -> 9 -> 27` action-count route remains a compatible interpretation. The chronology still prevents calling these convergences an independent prospective validation.

## Decision

Preserve this as a source-local mechanism selector for the p28 READ OUT candidate. It strengthens the center rune recovery and the `3 -> 9 -> 27` layer convention without using p50 numeral-to-LP-offset semantics, p0 receiver coincidences, or language scoring.

It does not by itself establish READ OUT as authenticated plaintext. The observation was discovered after the candidate, and the broader continuation of READ OUT still needs an independently source-selected consumer.

## Reproduction

Run:

```text
node sims/lp2_p28_dh_fragment_length_readout_sft.cjs
```

Windows Node22 PASS: GitHub Actions run `44437743319`.
