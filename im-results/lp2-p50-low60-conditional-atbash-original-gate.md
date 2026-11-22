# Frozen p50 low-60 conditional authentic Atbash on original LP2

**18 November 2026, Agent38. Director Issue #1533. Classification: completed keyless original-cipher negative with authentic solved-Cicada and source-shaped masked positive controls.** No unknown LP2 plaintext or authentic new key is recovered.

## Frozen decoder

Director #1508 established a transferable 60-cell phase-zero p50 class. The class is exactly the 60 printed p50 cells with leading digit `0`, and also exactly the 60 lowest raw values under both documented base60 and drop-f base59 readings.

Issue #1533 tests one historically authentic, parameter-free consumer of that class. On the continuous global p0-p55 rune clock at phase zero:

- if the current p50 cell is in the frozen 60-cell class, apply authentic GP29 Atbash `i -> 28-i`;
- otherwise leave the rune unchanged.

The operation is an involution. There is no phase choice, alternate p50 orientation, complemented mask, Caesar offset, word reset, key, or second layer.

## Controls

### Authentic solved Atbash

The committed regression source for solved LP1 page01 contains 184 original ciphertext runes. The exact mapping `i -> 28-i` recovers the independently known normalized plaintext exactly.

This verifies the historical Cicada operation and alphabet mapping used by the frozen decoder.

### Source-shaped masked plant

A 12,956-rune plaintext is built only from independently solved LP1 GP29 material and passed through the exact p50-mask conditional Atbash. Applying the same involution again recovers all 12,956 runes exactly.

The frozen LP1 first-order language score is unchanged by recovery:

- planted plaintext: **-2.435440069 nats/rune**, perplexity **11.42084**;
- recovered plaintext: **-2.435440069 nats/rune**, perplexity **11.42084**.

The independently clear p57 control scores **-2.582917098 nats/rune**, perplexity **13.23569**.

## Original LP2 result

Across the 12,956 unknown p0-p55 runes, 3,036 positions lie under the frozen 60-cell p50 class. Atbash changes 2,958 of them; the remaining selected positions happen to carry the self-mapped GP29 center symbol.

The complete original stream scores:

| Stream | Nats/rune | Perplexity |
| --- | ---: | ---: |
| original ciphertext | **-4.330908655** | **76.01333** |
| frozen conditional Atbash | **-4.339326829** | **76.65592** |
| genuine solved p57 | **-2.582917098** | **13.23569** |

The fixed decoder therefore moves the whole stream slightly farther from the solved/native-GP scale.

Every one of the nine source chapter ranges remains nonlinguistic under the frozen rule:

| Chapter pages | Raw nats/rune | Conditional-Atbash nats/rune |
| --- | ---: | ---: |
| p0-p2 | -4.32470 | **-4.36084** |
| p3-p7 | -4.33487 | **-4.37340** |
| p8-p14 | -4.36816 | **-4.37901** |
| p15-p22 | -4.35091 | **-4.38197** |
| p23-p26 | -4.26511 | **-4.29996** |
| p27-p32 | -4.28900 | **-4.27544** |
| p33-p39 | -4.34035 | **-4.36232** |
| p40-p53 | -4.34079 | **-4.30942** |
| p54-p55 | -4.23723 | **-4.24266** |

Two chapters improve modestly under this coarse score, while all nine remain around **-4.24 to -4.38 nats/rune**, far outside the solved/native range near -2.4 to -2.6. The SFT prints the first 180 decoded runes of every chapter for direct inspection; none forms a coherent 150-rune unknown plaintext passage.

Exact re-encryption succeeds because the frozen transform is involutory, so the failure is semantic and distributional rather than a round-trip implementation failure.

## Decision

The exact #1533 identity/Atbash two-regime family is rejected as a direct decoder of ordinary native-GP plaintext.

The result does not authorize trying nearby Caesar shifts, changing phase, complementing the p50 class, or adding a second layer. Those would be new mechanisms. The existing p50 60-cell association remains a structural clue whose correct consumer is still unresolved.

## Reproduction

The read-only Node22 CommonJS SFT is [`sims/lp2_p50_low60_conditional_atbash_sft.cjs`](../sims/lp2_p50_low60_conditional_atbash_sft.cjs).

Windows Node22 execution passed in [GitHub Actions run 44391975736](https://github.com/FlareZ123/liber-primus/actions/runs/44391975736), checking out the exact SFT commit `2a9b9e21797cdde1666011d177a208b9b4098295`.
