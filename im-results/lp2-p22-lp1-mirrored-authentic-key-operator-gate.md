# P22 reused solved-LP1 artwork: a frozen mirror-of-authentic-key inverse

**22 November 2026, Agent11, Director #2166. Classification: scoped negative on complete original source; no unknown LP2 plaintext or creator-selected key.**

## Literal source pairing and the proposed human action

Original LP2 physical **p22** is `39.jpg`. Its bottom reclining figure is a **horizontally mirrored** copy of the identical footer in original solved LP1 **pp14–16** (`14.jpg`, `15.jpg`, `16.jpg`). The independent source-image census measured mirrored ink IoU ~0.9009; LP2 p22's entire six-line body contains 131 GP29 runes. The center horizontal stave on p22 is a *different* visual, already screened as an ambiguous three-bar cipher-rune in the p0–p2 source-ornament audit. It does not select a cipher.

The solved original LP1 source family contains three different neighboring payload types:

- **P14**: a koan about the inner 'I' and the *voice of the circumference*. The full p14–15 koan (319 authentic encrypted runes) uses the recovered original **13-rune GP29 Vigenère key `FIRFUMFERENFE`**, with transparent *plaintext F* and a nonconsuming key-clock bypass.
- **P15**: explicit instructions to question things and discover truth within, part of the same p14–15 solved cipher stream.
- **P16**: the *plain* 5×5 integer square with line sum3301 and center809. No p16 ciphertext key or command specifies applying this square to p22.

Thus the repeated footer alone does **not** uniquely designate p14, p15 or p16. Source words on p14 and p15 are predominantly philosophical descriptions, with no imperative specifying another LP2 ciphertext or a new rune-domain decryption. The only *actual solved operation* attached to two of those three parent pages is their authenticated 13-rune F-skip Vigenère.

One genuinely additional, finite visual transfer remains plausible without choosing a guessed plaintext: **mirror the order of the already-authentic LP1 p14–15 encryption key itself**, then apply the unchanged actual LP1 plaintext-F bypass algorithm to the whole adjacent original p22 rune line stream. This transfers a source-attested cipher, rather than choosing a new English keyword. It is an **analyst's frozen interpretation of the original artwork**; no signed instruction equates reversing a figure to reversing the key.

## Exact original-cipher inverse and its decision

Authentic key vector `K=[0,10,4,0,1,19,0,18,4,18,9,0,18]`; mirrored key vector `R=[18,0,9,18,4,18,0,19,1,0,4,10,0]`. For each source plaintext rune P, a literal F=0 emits C=0 without clock advance; otherwise C=(P+R[clock mod13]) mod29 and advances the clock. The fixed source receiver is **all original 131 p22 runes**. The default starting phase is 0. To close trivial orientation uncertainty without fitting language, exhaust **all thirteen phases and both signs** (26 schedules). At each source ciphertext F=0, retain *both* algebraically permitted interpretations of bypass and non-F shifted plaintext, merging only equal clock states. All other ciphertext runes must decode to non-F. This exact necessary-condition inversion retains every possible F history.

**Result: 0/26 schedules can decode the full 131-rune original p22**. Natural phase0/+ dies at **zero-based offset29** (rune30). Its opposite sign dies at zero-based offset101 (rune102). Allowing arbitrary independent phase and sign improves the maximum legal prefix only to **101 of131 original symbols**. This is a strict algebraic failure before any language model is consulted.

Two independently selected receivers check whether the result is merely a page-specific oddity. The immediately following original **p23** has 213 runes: **one** of26 mirrored-key schedules (the original + direction at phase0) survives the F constraints, giving one legal complete-rune plaintext history. That unique readout is random-like GP29 output (IoC **0.03441403136**), begins `EOAIAOTHAEDTNBGTHTEAIBITHYAEDGMATHJDWEANG` and contains **no coherent recovered prose**. Hence legal F transitions alone are not a decryption. The distinct original p0–2 729-rune chapter has **zero** surviving full-length schedules and a maximum legal prefix of **700**. These holdouts were not used to select the key.

An independent *actual solved-source* positive first reproduces all **85/85** original p56 ciphertext runes from independently known plaintext under its genuine prime-totient/transparent-F cipher. It then builds a **131-rune native GP29 solved-plaintext plant** from that authenticated p56 text plus the first 46 actual clear p57 runes (two literal F events). Every one of the 26 sign/phase mirrored-key plants is accepted by the same exact source-independent inverse. Thus the failure of p22 cannot be attributed to a broken F/clock model, a too-short recipient, or incorrect GP spelling.

## Decision and missing next operand

The mirror relation is a reproducible visual cross-release clue. The authentic key is independently proved on original LP1. **Their combined literal key-order reversal is incompatible with the intact p22 ciphertext**, even granting all arbitrary initial phases and both arithmetic signs. The one algebraically legal p23 reading is gibberish, with no source selector identifying p23 as an alternate receiver. The p16 square remains an alternative source parent with no explicit operator.

The missing creator-supplied rule would have to select **which of LP1 p14/p15/p16 to consult, why mirrored art changes cipher key rather than page layout, the p22/p23 receiving interval, and the original clock/key serialization**. Those choices do not follow from the visible illustration or its neighboring solved words. Retire this **one source-linked mirror-key cipher handoff**. Do not claim all image-signaled operations or all p22 mechanisms have been tested. Source image matches survive; no authentic previously unknown plaintext, creator-specific cipher, or destination follows.

**Reproduction:** [standalone exact CJS SFT](../sims/lp2_p22_mirrored_lp1_key_fskip_original_sft.cjs) · [Windows Node22 successful original-source run](https://github.com/FlareZ123/liber-primus/actions/runs/44992066902) · [cross-release literal-art source](lp1-lp2-crossrelease-artwork-raster-copies.md) · [original-source known-key positive](lp2-2014-firfumference-vigenere-gate.md).
