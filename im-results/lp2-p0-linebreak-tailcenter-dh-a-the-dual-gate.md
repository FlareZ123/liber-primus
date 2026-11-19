# P0 line-crossing source words give a two-receiver DH-a value bridge

**Agent12, 19 November 2026. Classification: intermediate source-conditioned cryptanalytic result. This is an exact value-changing reconstruction on original ciphertext, independent of the rejected p50-numeral-to-LP2-offset coercion. It does not establish unknown plaintext because the candidate clear words come from the authenticated 2016 message, and the post-break-center selector still lacks an explicit first-party opcode.**

## Result

Two p0 physical line wraps have the same unusual local form: a complete two-rune printed word is immediately followed by a printed word that crosses the physical line break.

Using one-based printed-word numbering and zero-based rune offsets:

| p0 pair | predecessor offsets | following word offsets | physical split |
| --- | --- | --- | --- |
| words 22/23 | 103..104 = [8,12] | 105..108, length 4 | 3 + 1 |
| words 53/54 | 235..236 = [8,5] | 237..243, length 7 | 2 + 5 |

Among all 42 adjacent word pairs in the authenticated 2016 cleartext, native GP29 lengths select exactly one phrase for each p0 shape:

- [2,4] selects **THE ROAD**;
- [2,7] selects **THE DEVOTED**.

This uniqueness is also visible from the p0 side before any rune values are compared. P0 contains only six printed words that cross a physical line break. Their predecessor/crossing length shapes have the following signed-2016 adjacency counts:

- [3,7]: no signed adjacency;
- [2,4]: exactly one, **THE ROAD**;
- [3,4]: four;
- [4,6]: two;
- [4,3]: two;
- [2,7]: exactly one, **THE DEVOTED**.

Thus the two value hits below are also the only two p0 line crossings whose local word-length geometry uniquely selects a signed-2016 adjacency.

The source-derived p28 literal-DH reconstruction fixes the standard DH23 state:

p=23, g=5, a=6, b=15, A=8, B=19, K=2.

Use the fixed private exponent a=6 as the first additive key rune. For the second key rune, take the center of the part of the second authenticated source word that lies after the corresponding physical line break.

This predicts both original p0 predecessor ciphertexts exactly.

### THE ROAD

Native GP29:

- THE = [2,18]
- ROAD = [4,3,24,23]

The p0 line break falls after three runes of the four-rune receiver, so the source-word tail is the single rune D=[23]. Its center is 23.

Key: [a, center(tail)] = [6,23].

Forward reconstruction:

[2,18] + [6,23] mod29 = [8,12].

That is exactly original p0 offsets 103..104.

### THE DEVOTED

Native GP29:

- THE = [2,18]
- DEVOTED = [23,18,1,3,16,18,23]

The p0 line break falls after two runes of the seven-rune receiver. The post-break source tail is:

VOTED = [1,3,16,18,23].

Its center is T=16.

Key: [a, center(tail)] = [6,16].

Forward reconstruction:

[2,18] + [6,16] mod29 = [8,5].

That is exactly original p0 offsets 235..236.

## Charged whole-manuscript family

The center choice was discovered after inspecting the two candidate inverses, so it must be charged against nearby simple alternatives.

The SFT scans all 55 rune-bearing unknown pages. It preserves physical slash line wraps without treating them as word delimiters and finds every line-crossing printed word whose immediately preceding printed word has exactly two runes.

There are **66** such source-visible events.

For each event, it tests every authenticated 2016 adjacent word pair whose GP29 lengths match the two-rune predecessor and the line-crossing word. This gives **48** shape-matched source assignments.

For every assignment, the finite operator family is:

- first key value: each of the seven fixed DH23 fields p,g,a,b,A,B,K;
- sign: addition or subtraction modulo 29;
- second-key source region: pre-break head, post-break tail, or whole second source word;
- selector inside that region: first, last, center when the region has odd length, or GP0 sum modulo 29.

That produces **7,280 exact ciphertext comparisons** on the realized source family.

There are 16 single exact hits across all pages and configurations. Exactly one configuration hits **both** p0 receivers:

a | add | tail:center.

That configuration has exactly two hits in the whole manuscript family, and both are the p0 pairs above. No other charged configuration reconstructs both.

A decomposition of the frozen configuration gives 30 eligible signed-2016 assignments. Only two pass the first-rune equation source[0] + a = ciphertext[0]. They are the same THE ROAD and THE DEVOTED assignments, and both independently pass the second-rune equation.

### Independent solved-source register control

After freezing a | add | tail:center, the same rule was tested with independently solved Cicada plaintext as the source register rather than the 2016 message.

P56 and p57 themselves contain no same-page line-crossing event with a two-rune predecessor, so they cannot supply a direct same-page replication. Using their solved adjacent plaintext pairs against the 66 unknown-page line-crossing events gives 59 eligible frozen-rule assignments and zero exact hits.

Expanding the control to every native solved section in resources/external/relikd-solved-gp29-native-v1.json gives 756 eligible frozen-rule assignments and zero exact hits.

This negative control limits the claim. The mechanism currently behaves as a local p0/2016-source relation rather than a manuscript-wide general cipher rule.

Reproduction:

node sims/lp2_p0_linebreak_tailcenter_dh_a_the_dual_sft.cjs

## What this changes

This gives a compact typed path from first-party material to original ciphertext values:

1. the authenticated 2016 message supplies candidate adjacent phrases;
2. p0 printed line geometry supplies the two receiver shapes and split positions;
3. the source-derived p28 literal-DH object supplies a=6;
4. one shared post-break-center rule supplies the second key value;
5. the resulting two-rune additive keys reconstruct both original ciphertext pairs exactly.

The result does not require interpreting a p50 numeral as an LP2 rune offset.

It also explains two previously separate additive inverses with one local schedule:

- THE to [8,12] uses [6,23];
- THE to [8,5] uses [6,16].

## Strongest objection

The post-break-center selector is still inferred. The manuscript visibly supplies the line breaks, and the two uniquely selected source tails are odd-length, but no authenticated instruction explicitly says to take the center of the continuation.

P28 now independently supplies the source-derived instruction **READ OUT** from its exact center/page-word object. A spatial center-out reading would emit the center rune first for each odd continuation tail, which is compatible with this rule. That semantic bridge is only a hypothesis. The p28 DH reconstruction currently gives **READ OUT** a different local interpretation, reading the outer runes of the literal DH-line fragments. The words alone do not prove which spatial reading, if any, should transfer to p0.

The result therefore belongs in im-results rather than the established synthesis. The exact dual reconstruction, the unique p0 shape selection, and the charged whole-manuscript value family make it worth preserving as a candidate local mechanism, while treating THE ROAD and THE DEVOTED as source-conditioned candidates rather than recovered unknown plaintext.

## Best next discriminator

Freeze the operation exactly as above and seek an independent source-selected pair outside the 2016 phrase register. A successful untouched receiver must specify:

- a two-rune source word;
- a following source word whose length matches a physical crossing word;
- the same a=6, additive sign, and post-break-center rule;
- exact forward reconstruction of the original two-rune predecessor.

A failure on a genuinely independent, source-selected receiver should retire this as a local coincidence rather than widen the selector family.
