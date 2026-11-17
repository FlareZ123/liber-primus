# Five-rune red title as per-word key with cross-word ciphertext-repeat suppression

**17 November 2026, Agent27. Original-cipher bounded negative. No recovered LP2 plaintext, source-authenticated key schedule, or destination.**

## Source rationale and distinct proposal

The untouched p0 red heading consists of two words, GP rune lengths **8 and 5**; the five-rune word is **S-Y-E-NG-C**, source numerical indices **[15,26,18,21,5]**. The source's five-dot imagery and the unusually enriched **within-word five-back ciphertext echoes** suggest testing a cipher whose keystream resets to this visible five-symbol word for **each originally printed word**. The 86 adjacent repeated ciphertext runes and their suppression at *actual word boundaries* motivate a hidden extra-key-draw rule that carries the previous emitted ciphertext across words. The combination could have escaped old fixed-phase decoders.

This experiment is materially distinct from [red five-word prime-totient plaintext/ciphertext autokey](lp2-p0-redword-prime-totient-lag5-autokey.md), [shared stationary five-alphabet word-phase all-secret invariant](lp2-word5-shared-allsecret-collision-gate.md), and the [full-table continuous ARC4 keyskip inverse](lp2-full256-arc4-collision-source-gate.md). None of these already tested the **literal p0 red five-word cyclic key with each original word restarting the key clock and the collision filter crossing the word edge**. No original line states this composition is the intended author algorithm.

## Frozen exact inverse and source

Read the first three original LP2 physical pages from `resources/lp2-transcription.txt`. Ignore line/page breaks within a word, preserve original punctuation-marked word splits and every rune. The script independently checks the resulting **729 runes in 158 exact words** against `lp2-corpus.json`. The first two words are the red 8+5 title. Freeze the source five-rune key from its second word; use the remaining **716 original ciphertext runes in 156 complete words** as the target. Longest printed word is eleven runes.

For each source word reset the keystream to index zero and repeat the same five GP key indices. Test both arithmetic directions. A plaintext rune P normally emits `C=(P + sign·key[cursor mod5]) mod29`. When the candidate ciphertext would duplicate the **immediately preceding emitted ciphertext rune**, allow exactly one rejected candidate and consume one extra key rune before emitting. Carry the previous real ciphertext across printed word boundaries, while resetting the key to its source-defined start. The exact decoder fully enumerates both accepted and source-compatible one-reject branches for **every original word**, with a source-held-out Shakespeare GP29 trigram model and fixed 3.5-log penalty per rejected key symbol. It cannot propose a skip unless the rejected candidate would have matched the actual preceding printed ciphertext.

No key, starting phase, word break, key modulus or special GP symbol is selected from the undeciphered output. The test is two original signs under one source-visible word-reset rule.

## Original p0–p2 result

| Sign | Source-native score (nats per rune) | Hidden key draws inferred | Preview of recovered GP rune transliteration |
| --- | ---: | ---: | --- |
| + | **−5.3955827895** | **5** | `TXBR XXR BEOP DNGEAEMFAEDETS DEABEY OELLG IALL YXP NAHOE` |
| − | **−5.4675624288** | **6** | `BHAB SHJ EGL ASAENFUMUTHYT AOEATHW DXIAM EAXIA IAHL` |

Both source-derived outputs are nonprose. They are substantially less language-like than genuine GP-native English under the *same* independently frozen scorer. The output scores and previews are direct observations on the complete untouched p0–2 original ciphertext after the visible title, rather than a synthetic-cipher performance comparison.

## Source-shaped positive

The unseen training portion of the 300k-character fixture is **first 200,000 characters**. A disjoint 210,000–299,999-character held-out Shakespeare passage supplies genuine English words encoded to the canonical GP29 orthography. Choose a source GP word matching each of the manuscript's **156 exact word lengths** from a fixed cyclic length-indexed pool; total native symbols exactly 716. Encrypt under the exact original five-rune key, both signs, word reset, previous ciphertext carried between words and one 81%-probability collision-triggered reject. The deterministic seed is `0x33012755`. Reveal only synthetic ciphertext and original word breaks to the exact same decoder.

| Sign | True cipher skips | Recovered skips | Correct original plaintext runes | Positive language score |
| --- | ---: | ---: | ---: | ---: |
| + | 8 | 5 | **708/716 (98.88%)** | **−2.4046759698** |
| − | 27 | 21 | **705/716 (98.46%)** | **−2.4833663471** |

The planted recovery is high despite occasional missed skip placements. It shows this decoder strongly recognizes exactly this source-word-length-matched register and detects many hidden draws. The positive control is synthetic and provides no unknown Cicada plaintext.

## Decision

**Retire the literal p0 second-red-word key as a stationary five-GP per-word cyclic pad with at most one collision-triggered skip per output and globally carried ciphertext predecessor.** This concrete source-motivated operation fails the original material, while recovering approximately 98.5%–98.9% of the original-layout source-native controls. A different state rule, authentic external key, authorial non-GP register or original source clue could evade this narrow result. It is no evidence that every five-back or collision mechanism is false. Do not revive this specific red-word key with arbitrary additional shifts, retries or unmotivated second ciphers.

[Windows Node22 read-only single-file SFT](../sims/lp2_red5_wordreset_collision_sft.cjs) · [manual-only Actions workflow](../.github/workflows/agent27-red5-wordreset-collision.yml). Both source original and matched-length native runes are asserted; no original byte edited.
