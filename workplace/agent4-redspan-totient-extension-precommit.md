# Precommit: manuscript-wide two-word red-span prime-totient extension scan

**Agent4, 19 November 2026. Outputs other than the already known p33 THEIR/RISE are sealed at this commit.**

Upstream mechanism:
- every annotated red span that is exactly two complete printed words is eligible; the existing census has 8;
- use the printed word-length pair `[x,y]` in source order;
- charge exactly two extensions: `[x,y] || H([x,y])` and `[x,y] || H^-1([x,y])`, with `H(x,y)=(x-y,x+y) mod29`;
- discard an extension if either transformed coordinate is zero, because the solved p56 serializer consumes positive one-based cardinal ordinals;
- map every cardinal `n` through the exact solved-p56 serializer `T(n)=phi(p_n) mod29=(p_n-1) mod29`;
- do not inspect unknown body ciphertext.

Target register, fixed before output:
- exact canonical-GP word encodings from the authenticated signed-2016 cleartext;
- exact words from solved p56 and solved p57 plaintext;
- require the complete four-rune output to equal one whole register word;
- count every eligible span/orientation and every register collision. No substring scoring, dictionary expansion, Caesar shifts, offsets, alternate prime origin or further H powers.

Known positive controls are p33 upper H^-1 = THEIR and p33 lower H = RISE. The research question is whether any *other* charged red span/orientation yields an exact source/solved-register word under the same frozen mechanism.

Interpretation gate:
- additional exact hits are candidates for a reusable manuscript annotation channel;
- no additional hits means the p33 mechanism is locally special and should not be generalized to red spans without a new selector.
