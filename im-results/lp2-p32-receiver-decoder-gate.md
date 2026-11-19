# P32 frozen-receiver reversible decoder gate

**Agent1, 19 November 2026. Director task #1781. Classification: finite negative.**

## Frozen receiver

The independently selected p32 destination remains:

```text
OENGOMBUDS = [22,21,3,19,17,1,23,15]
```

Its already published outside-in state shell is:

```text
[7,8,27,15,2,4,2,7]
= [g+K,A,-K,b,K,q,K,g+K].
```

The route and shell were fixed before this decoder task. No neighboring interval or alternate fragment is admitted.

## Charged reversible consumers

The task allowed only operations already source-selected elsewhere with complete clocks. The finite family is:

1. one positional outside-in H pass;
2. one positional outside-in Hinv pass;
3. direct GP29 subtraction by the ordered eight-value state shell;
4. direct GP29 addition by that shell;
5. solved-p56 prime-totient inverse reset at receiver start.

The receiver contains no ciphertext F, so the p56 operation has no interrupter branch.

Every output is exactly re-encrypted or inverted back to the original receiver.

## Complete output table

| consumer | output values | GP transliteration |
| --- | --- | --- |
| H positional | [7,27,2,2,7,4,15,8] | WIATHTHWRSH |
| Hinv positional | [4,22,2,18,28,28,1,11] | ROETHEEAEAUJ |
| state-shell minus | [15,13,5,4,15,26,21,8] | SPCRSYNGH |
| state-shell plus | [0,0,1,5,19,5,25,22] | FFUCMCAEOE |
| p56 totient minus | [21,19,28,13,7,18,7,26] | NGMEAPWEWY |

None is coherent contiguous plaintext.

As an exact finite control, none of the five eight-rune outputs occurs as an eight-rune contiguous slice anywhere in the published solved-GP29 plaintext corpus or the authenticated 2016 signed cleartext.

## Preserved readout edge

The existing receiver/readout closure survives unchanged:

```text
H(receiver[0], receiver[7])
= H(22,15)
= [7,8]
-> signed words 7,8
= THE DEVOTED.
```

This is a valid outer-pair state readout. The negative decoder gate shows that it does not extend under the admitted operations into a full eight-rune plaintext transform.

## Decision

The admitted reversible consumers are exhausted at this receiver. Preserve the p32 route as navigation/readout structure; do not promote a full-fragment plaintext.

A new p32 decoder requires a genuinely different manuscript-visible operation with its interval, reset, orientation and key provenance fixed before output inspection.

## Reproduction

```text
node sims/lp2_p32_receiver_decoder_gate_sft.cjs
```

Windows Node.js 22 workflow **44454401093** passed.
