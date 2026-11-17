# LP2 H1 L14–20: two original high-IoC peaks and their blind-continuation gates

**Decision, 17 November 2026.** The two initial apparent candidates from the still-running original eight-window 581-stream L14–20 H1 campaign **do not recover unknown LP2 plaintext**. The `some wisdom` 20-column hit fails the prespecified wider ten-EM verifier, and the `DIVINITY` 18-column hit fails the matched-null candidate floor once additional independent null shards complete. Both fail a 150-rune *untouched original chapter continuation* under their fixed inferred key. **These decisions are bounded to these two cells**; do not claim the entire L14–20 campaign finished or the H1 family was disproven.

## Original-source inputs and executed screen

The [distributed original H1 campaign](https://github.com/FlareZ123/liber-primus/actions/runs/44018360123) (Director Issue [#1338](https://github.com/FlareZ123/liber-primus/issues/1338)) uses pinned external [pnotisdev/cicada3301 commit `15200c67abee106913ba01ff504c5b6e88d16cc7`](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7/work/h5rs) and the original [12,956-rune LP2 corpus](../resources/liber-primus/lp2-corpus.json). The exact H1 hypothesis is the two-stack running-key/unknown periodic keyword anti-repeat model; no source authenticates it as the unknown-page cipher. The immutable sweep starts from eight 300-rune source section windows, 581 original source keystreams, offsets 0–1999, periods 14–20, and both anti-repeat models; 20 disjoint offsets-by-100 original and matched-null shards; on each side **130,144,000 nominal cells** before keystream length/early-abort restrictions. Earlier L2–13 material was completed upstream and is not repeated.

An original screening hit with periodic index of coincidence (IoC) ≥1.5 is recorded. A full original-cipher *candidate* must reach **max(1.6, complete matched 581-stream null max in that original window/model + 0.15)**. Its 10-EM re-decode and intelligible whole-original-section/heldout criteria are additional mandatory gates. An isolated high IoC or forward re-encryption identity is insufficient.

| Original cell and source-visible window | Original 5-EM screen | 10-EM source-semantics test | Strongest observed matched-null floor (6 finished shards) | Following untouched original 150-rune plaintext IoC | Decision |
|---|---:|---:|---:|---:|---|
| `md5-ctr mod :some wisdom`, offset **1009**, L20, **skip** m0, `seg0.12` (runes 5506–5805; previous rune14) | **1.753942** | **1.547463370** | **1.734631** (matched null1.584631 +0.15) | **1.110693512** | Fails source 10-EM and heldout |
| `sha512-ctr mod :DIVINITY`, offset **1193**, L18, **coin** m1, `seg0.11` (runes3612–3911; previous rune24) | **1.672712** | **1.672712418** in source-*compatible* 2nd initializer path | **1.739556** (matched null1.589556 +0.15) | **0.947203579** | Fails full-campaign null floor already in partial matrix and heldout |

Both matched-null floors above are **lower bounds** from six disjoint fully completed real+null shards (offset bands 0–99, 400–599, 900–1199). The complete 20-shard null can only raise the floors. Therefore the DIVINITY peak can never qualify even as a first-stage candidate under the frozen, increasingly inclusive matched null. The MD5 peak remains above the *partial* null floor, but the stricter fixed 10-EM gate fails independently. All reported 150-rune continuations are original physically contiguous GP ciphertext, held out of the screen and key optimization.

## Reconstructed key and blind continuation: `some wisdom`

Historical key source: concatenate `MD5(b"some wisdom" + be32(counter))` for consecutive counters; reduce each byte modulo 29, start at offset1009. The H1 decoder's 20-column keyword fitted only from the first 300 original runes is:

```text
[28,25,11,16,19,20,6,0,19,14,10,9,3,26,27,21,11,15,9,23]
```

A source-semantics W-free nats-marginalized initial pointer, 5 EM iterations, model0 collision-consistent beam and exact original forward inverse reproduce **1.753942308**, matching the Rust screen to six decimals. Retaining the **same** seed/beam initialization and extending to the preregistered 10-EM verifier produces **1.547463370**: a nonconverged high-IoC fluctuation after five EM. The next 150 original GP runes (global 5806–5955), decoded without keyword re-fitting and carrying the final key pointer, produce this nonword GP transliteration:

```text
BOYYRIANDGMEATYBAWTHBEAGLBAENIAIAAMLXJAEOLMUSEOOESTHDFUBTGHEODYMTHCRJFGDNMWFMGIAHYMBUHNUBEAMTHIAAMBIAELOETHPEONGMSBTRLTHGEAEOBDRNNGNFBSFGEPAEGXPOETHUYEOHDAYGTHEOASRBUNNSOCNGUJFXNGBLEY
```

The heldout overall IoC is **1.110693512**, without original-language plaintext.

## `DIVINITY`: coin-model near-hit and independent null rejection

Source stream: `SHA-512(b"DIVINITY" + be32(counter))` digest bytes modulo29 at offset1193. Screen model1 uses the pinned **coin** anti-repeat semantics. The independent Python implementation's mathematically top W-free initialization at beam12 reaches only **1.495806100**; its **second** still-live initial candidate reproduces the Rust highscreen **1.672712418**. Because the initial winner differs between this Python port and the reference compiled Rust (perhaps stable-sort/tie or SIMD/float details), this is a **screen-compatible** path, not a claim of strict Rust initializer parity. Its original-trained 18-column key is

```text
[0,23,4,28,7,14,26,21,26,20,22,7,12,12,13,0,8,5]
```

At five and ten EM iterations this source-compatible path remains at **1.672712418**. Applied with no adjustment to the next 150 original GP runes (global3912–4061), it yields **0.947203579** overall IoC and incoherent GP transliteration. More decisively, the disjoint frozen matched-null shard collection has already produced a `seg0.11`/model1 maximum **1.589556**, hence the required candidate floor **1.739556**. This peak is unambiguously below even the *partial* null floor; future completed shards cannot revive it.

## Reproduction and remaining gate

[Standalone Python standard-library SFT](../sims/agent37_h1_somewisdom_heldout_sft.py) regenerates both digest-counter streams from original historical source algorithms, uses exact canonical GP indices, runs the independent H1 W-free initializer plus collision-constrained EM beam with no unknown-page plaintext fitting, checks explicit original forward re-encryption, and evaluates the 150-rune originals that follow each training window. Its source-compatible, not perfectly Rust-parity, initializer choice for DIVINITY is explicitly labeled. Independent original/null hit rows and complete best-cell records are [run artifacts](https://github.com/FlareZ123/liber-primus/actions/runs/44018360123). The 2016 note in the archive does **not** independently authorize this digest-counter source/offset or the synthetic H1 generator; they remain speculative.

Keep Issue #1338 open until **all 20 original and matched-null shards** complete, their complete per-window/model maxima are merged by [the versioned adjudicator](../sims/agent16_h1_gap_sft.cjs), and any other surviving original cell receives wider source-semantics and genuine heldout testing. The already-finished independent terminal short-key start is separately reported in [p54–55 original 299-rune gate](lp2-h1-final-p54-299-rune-original-source-gate.md). Negative short-key/long-key H1 screens have limited power against long true planted keywords, unavailable stream sources and alternative original ciphers. No unknown LP2 plaintext, key, or authenticated decipherment mechanism has been recovered.
