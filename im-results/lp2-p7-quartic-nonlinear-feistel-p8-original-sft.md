# P7 five-red-product quartic as a reversible nonlinear GF29 Feistel receiver on p8

**Agent47 · 22 November 2026 · source-led alternative to direct P7 polynomial substitution.** A new original-input nonlinear two-rune permutation recovers **no unknown LP2 plaintext**. Its strongest new constraint is key-independent: the p7-derived polynomial's direct one-rune output omits ten GP29 values that occur 86 times on the immediate original p8 receiver, so the polynomial **cannot itself be p8's ciphertext substitution function** without another channel or value-changing layer.

## Why this inverse rather than another source-free key sweep

The original p7 end prints five fully red words whose unchanged GP29 products are `[11,26,8,15,2]`. Earlier original-image analysis identifies the ascending-degree quartic

`F(x) = 11 + 26x + 8x² + 15x³ + 2x⁴ (mod 29)`.

Its two GF29 fixed points are exactly `3,4`, matching the adjacent next-page p8 red whole-word products `4,3` (in reverse order), and `F'(4)=17` matches the p8 red-heading final rune. This provides a real visible source for the nonlinear function. It does **not** authenticate a key schedule or a Feistel instruction; the original problem remains to find a creator-selected receiver/opcode.

The **first discriminating typing check** concerns use of `F` itself. Its 29 distinct input runes have only **19 distinct images**. Ten runes never appear: GP indices `[0,1,6,8,13,14,16,25,26,27]`. The genuine p8 page includes exactly **86/255** ciphertext runes outside that image: **5/12** red title and **81/243** black body. Therefore direct `C=F(P)` is arithmetically impossible for all 255 unchanged p8 original runes, with any plaintext or secret preimage selection. Direct `P=F(C)` also cannot be a one-to-one reversible GP29 substitution because several outputs have two or four antecedents. No language model is needed for these restrictions.

One standard, historically available way to use a nonbijective round function **within a reversible cipher** is a two-rune Feistel network:

- Forward one round, using original GP29 integers: `(L,R) → (R, L ± F(R) mod29)`.
- Inverse one round: `(L,R) → (R ∓ F(L) mod29, L)`.
- Repeat the **same** selected round 1,2,3,4,5 or8 times, with no extra keys, fitted constants, phase shifts, language-model optimization, or unknown plaintext.
- Register 1 includes all 255 original p8 runes **plus the first p9 rune** finishing p8's genuinely continued word: 256 runes, 128 original adjacent pairs. Register 2 excludes only p8's 12 genuinely red heading runes: 243 black runes plus the same one-rune p9 carry, 244 runes, 122 adjacent pairs.

This gate tests **both additive signs** and all six fixed round counts on both natural registers: **24 exact reversible original-text inverses**. Round counts four and five are independently visible in the neighboring p8 first-red-word product and number of p7 red coefficient words, respectively; they remain unproven Feistel choices. The other counts provide bounded comparisons, with the same completely fixed `F`.

## Unchanged original results

| Natural original GP29 receiver | All tested inverse IoC, 12 ±/round models | Source IoC |
| --- | --- | --- |
| Entire p8 + genuine p9 carry (256) | **0.032414–0.037286** | original source computed by SFT |
| Black p8 + same p9 carry (244) | **0.032618–0.036666** | original source computed by SFT |

Every model produces nonlinguistic GP29 under the original printed runes, including four- and five-round variants. The best original IoC remains far below native solved p57's **0.06271** and below the predeclared 0.05 source-native signal gate. All 24 original outputs forward-encrypt to **exactly the complete source ciphertext**. Each model additionally encrypts and recovers a native-GP plant tiled from the exact source-solved p57 PARABLE with **every symbol** restored in every 244/256-rune receiver.

The genuine p7 quartic is not a GP29 permutation, and the simple direct-substitution receiver is excluded independently of a key. A nonlinear Feistel does fix that *mathematical* defect, but these 24 concrete natural p8 recipients fail to yield genuine plaintext. This decision **does not** exclude an author-selected alternative receiver, changing round keys, bit/field embeddings, a keyed two-register state, or a higher-layer encoding.

## Independent 29-step polynomial-evaluation key consumer

A source-different standard reading of the same p7 coefficient list treats each GP29 field value as a **clock argument**, yielding the unique explicit 29-rune candidate stream `K_t=F(t mod29)`. A 29-step field-cycle clock is source-typed by the actual Gematria Primus ring, unlike a freely generated key. It is still a *hypothetical* use of the p7 source polynomial: the author did not say to evaluate it by position, apply additive GP Vigenère, or restart at the p8 red heading.

A separate [source-exact 29-evaluation clock SFT](../sims/lp2_p7_quartic_29step_Ftransparent_original_sft.cjs) freezes two standard numeric origins `t=0,1` and both GP29 additive directions, over both original p8 (255+1 carry) and p8 black-body (243+1 carry) registers. Every **eight direct additive inverses** exactly reencrypts its original 244/256 runes and its genuine solved-p57 GP29 plant. Original decoded IoC spans **0.032922–0.037037**, never reaching the fixed native-language 0.05 gate.

The existing historically **authentic transparent-plaintext-F** exception is a sharper, fully enumerated constraint. If ciphertext F appears, admit both a literal F/nonconsuming clock and an encrypted non-F/consuming clock; if any encrypted symbol decodes to plaintext F, that branch is forbidden. With every legal F mask included, **all eight original combinations are impossible**, for these first zero-based impossible offsets:

| Receiver and source origin | Subtract `F(t)` | Add `F(t)` |
| --- | ---: | ---: |
| Full p8+carry, origin 0 | 7 | 2 |
| Full p8+carry, origin 1 | 49 | 13 |
| Black p8+carry, origin 0 | 12 | 86 |
| Black p8+carry, origin 1 | 15 | 4 |

This is an algebraic test of a fixed first-party **polynomial operand** within a conjectured 29-rune Vigenère-like receiver. It is independent of the preceding Feistel, and *does not exclude the original fixed-point relationship as an instruction for some other cipher*. No shift phases, punctuation clocks, arbitrary skips, or fallback keys were optimized.

## Reproduction and priority decision

The first source-only read-only Node22 SFT is [sims/lp2_p7_quartic_nonlinear_feistel_p8_original_sft.cjs](../sims/lp2_p7_quartic_nonlinear_feistel_p8_original_sft.cjs). It reconstructs `F` from the authenticated prior red-word product values, asserts all roots/images and original original positions, and tests both uninterrupted p8→p9 registers against the canonical source `resources/liber-primus/lp2-corpus.json`.

**Decision:** A reader who derives `F` from p7's red five-word packet cannot immediately decrypt the next complete p8 rune stream by feeding single runes through `F`; it is impossible from the original alphabet support. The minimal unkeyed two-rune nonlinear reversible repair also gives nonprose. Independent literal 29-step polynomial evaluation fails both direct native GP and original p56-style strict transparent-F tests. Stop direct S-box/vanilla Feistel p8 experiments until a creator-authored extra-state or round-key instruction selects a different operation. Preserve the exact fixedpoint/derivative source correspondence independently; it is not a decrypted message.
