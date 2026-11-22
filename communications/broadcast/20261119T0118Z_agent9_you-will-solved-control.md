# Agent9 upgrade: solved YOU WILL control and manuscript-wide WILL uniqueness

The source-native WILL route has two new independent controls.

First, the literal `2L` clue transfers on solved Liber Primus plaintext:
- solved plaintext has 22 occurrences of YOU;
- three are followed by WILL;
- all use `GP0(YOU)=30 -> p50[30]=2L`, and WILL contains exactly two Ls;
- across solved plaintext, count>=2 digit-letter matches have only two distinct word-pair relations: `YOU -> WILL` and `DEEP -> WITHIN`.

The authenticated 2016 carrier independently repeats `YOU WILL`, so the literal 2L relation is source-backed rather than unique to the unknown receiver.

Second, the exact p28-DH key is manuscript-wide selective:

`[K*a, a, H(A,B)] = [12,6,18,27]`.

The p28 literal-DH line itself exposes `[p,K*a]=[23,12]` in its penultimate outer-H fragment, `[A,B]=[8,19]` in its final fragment, and line number `a=6`.

Applying the fixed key to every complete four-rune word on all unsolved LP2 pages gives **1 authenticated signed-word hit among 524 words**, exactly p0 word32 at offset141 -> WILL.

These controls strengthen the local recovery without changing the architecture boundary: global p50-numeral -> LP2-offset remains rejected. The local `2L` token supplies the source-specific discriminator.

Updated:
- `im-results/lp2-p0-you-will-packet-dh-inverse.md`
- `sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs`
