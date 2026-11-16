# 2014 solved keyword and authentic LP2 word boundaries: extra-advance cipher gate

**Classification:** bounded original-cipher negative, Agent 3, 16 November 2026, Director task [#1195](https://github.com/FlareZ123/liber-primus/issues/1195). **No plaintext recovered.** The tested mechanism is a word-initial *extra key advance without an extra ciphertext rune*, which differs from the previously tested null-rune and ordinary additive-key families.

## Source-fixed operation

An authenticated solved 2014 Cicada koan supplies the 13-rune source key `FIRFUMFERENFE`. The frozen original-image LP2 corpus supplies authentic word boundaries. The tested generator uses a 13-rune repeated key starting at phase zero, additive sign **+1**, the period-available 29-symbol Gematria Primus alphabet, and the reference phase24 **hold** collision transport with probability **q = 0.81**. At every source-printed *word-initial* rune after the first, the key clock independently advances one additional position with probability **nu = 0.42**. The word remains one visible rune per original rune; no silent glyph is inserted. Original page breaks and line wraps consume no key clock and the 32 cross-page carried words are parsed transparently.

The ciphertext-only inverse is the published, source-pinned phase24 Rust `backward_edge.rs` exact marginal-likelihood engine (original commit `15200c67abee106913ba01ff504c5b6e88d16cc7`). It sums over unknown advance events in the forward and backward likelihoods. A separate source-held Gibran GP29 bigram model, trained on **47,100 GP runes** and held out for native-English plants, supplies the language model. This is a fixed independently chosen scoring model, not learned from LP2. The external phase24 detector's prior **T300 = +29.799 nats** threshold is reused as a conservative reference; its original familywise calibration used a different language model and broader stream bank, so this trial does **not** claim a freshly measured p-value.

The canonical original corpus SHA-256 is `58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338`. The source rune reader checks every original page, physical p50 as numeric-only/zero-rune, and **12,956** original unsolved GP29 runes. Only two preregistered independent original windows are scored: p0's 262 runes plus p1's first 38 (**65** eligible word starts); p40's 231 runes plus p41's first 69 (**70** eligible word starts). There is no observed-cipher key selection, phase sweep, or source substitution.

## Independent controls

The [successful repeatable CI run 43809004989](https://github.com/FlareZ123/liber-primus/actions/runs/43809004989) compiled and invoked the pinned exact phase24 engine. Three 300-rune *held-out native-GP English* plaintext windows were independently generated under the same key and original p0 word-edge positions, with seeds **119500, 119501, 119502**. Their true-key extra-advance likelihood scores were:

| Native positive | True advance score | True score minus no-event base | Reversed-key score | Uniform-key score |
|---|---:|---:|---:|---:|
| Gibran 1 | **+199.2171** | +228.7301 | -119.5163 | -140.6180 |
| Gibran 2 | **+194.0987** | +223.1222 | -86.4172 | -151.1491 |
| Gibran 3 | **+165.5117** | +205.7749 | -91.6912 | -136.8362 |

Every true-key positive exceeded T300, every registered wrong-key/source null remained below it, and every positive's extra-advance model exceeded the corresponding no-advance model by over 200 nats.

A second exact *authentic solved-Cicada* positive enciphers all **95 original unencrypted p57 PARABLE** GP runes under the same mechanism and the p57 genuine printed word edges. It planted **11** invisible advance events, plus one collision repair. The fixed true-key likelihood was **+56.2622 nats**, versus **-33.1175** for the reversed-key null and **-26.3255** for its own no-event base. T300 is not asserted as a calibrated 95-rune threshold. The test is an independent proof of applicability to native solved LP2 text, not a proposed unknown-page decryption.

## Decisive original-text results

| Untouched original LP2 window | Word-initial candidates | Frozen advance model nats | No-event base nats | Advance gain | T300 crossed? |
|---|---:|---:|---:|---:|---|
| p0–p1 first 300 runes | 65 | **-166.4614** | -182.8008 | +16.3394 | No |
| p40–p41 first 300 runes | 70 | **-150.1171** | -181.9842 | +31.8670 | No |

The source-fixed extra-advance signal is absent from both original windows, by more than **179 nats** even at the best one. The p40 gain above its no-event score is a model-fit improvement in absolute terms; its final negative likelihood gives no reason to promote it as a decryption. No original key schedule, recovered plaintext, exact unknown-page reencryption, destination, or reusable cipher mechanism resulted.

## Scope and handoff

**Retire this narrow convention:** literal solved 2014 13-rune keyword at phase zero, `hold` collision transport, additive +1, fixed independent extra advancement at the authentic word starts, q=.81, nu=.42, on both preregistered original test windows. This does not exclude signed 2016 direction instructions that walk backward, independent book-selected keys, F-nonconsuming plaintext overrides, alternate key-phase choices, or word boundaries encoding a different state transition. Such alternatives require an independent authored selector before further exploration. No offset, spelling, boundary convention, event probability or output model is tuned to original failure.

**Reproducibility:** [source-locked Python original-input SFT](../sims/lp2_wordedge_authentic_keyword_adv_sft.py), [manual CI workflow](../.github/workflows/lp2-wordedge-authentic-keyword-manual.yml), and [successful calibrated-original run 43809004989](https://github.com/FlareZ123/liber-primus/actions/runs/43809004989). Original-image-derived GP29 key and corpus hashes are fixed in the script. Earlier failing CI runs 43808491385 and initial 43808661431 used the same core model but preceded the complete p57 native-GP positive control and the full page-no-runes reader correction; the cited final successful run supersedes them.
