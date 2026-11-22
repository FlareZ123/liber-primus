# Three historical onion-service byte strings as direct GP29 keys for LP2

**Classification: bounded negative for the tested direct-key family, with a rank-1 planted control.** The three archived 256-byte service strings do not yield LP2 plaintext when used directly as GP29 Vigenère/Beaufort keys under the source-constrained mappings, transforms, rotations, and clocks below.

## Source basis

The derived resource [cicada-hiddenservice-256-candidates.json](../resources/cicada-hiddenservice-256-candidates.json) preserves three 256-byte strings historically attributed to:

- onion2: cu343l33nqaekrnw.onion
- onion3: fv7lyucmeozzd5j4.onion
- onion4: avowyfgl5lkzfj3n.onion

The external [DyrneCipher byte-string compilation](https://github.com/DyrneCipher/Obsidian-Vault/blob/main/_archive/liber-primus/byte-strings) presents the three strings as historical hidden-service material and suggests trying them as Vigenère keys. Their historical attribution and cryptographic relation to LP2 remain unverified. A fourth 256-byte value in that compilation matches the LP2 base60 grid itself and is excluded here to avoid using the target as its own key source.

This is distinct from the repository's earlier XOR/AES/ChaCha tests of aligned 32-byte blocks/columns and from the onion-2 timing/byte interleaving study. Here the three full raw 256-byte strings are treated directly as GP29 key streams.

## Search family

The original LP2 input is all 55 rune-bearing unsolved pages 0–55, 12,956 runes. The fixed search covers:

- Three historical source strings.
- Forward and reversed byte order.
- Two byte-to-GP mappings: byte modulo 29, and floor(29 × byte / 256).
- Six transforms: Vigenère subtraction, Vigenère addition, and Beaufort, each with and without Atbash applied to the ciphertext first.
- Three key clocks: repeat from the start of each page; one-shot within each page; and continuous global repetition across page boundaries.
- Every key rotation. Repeating modes use all 256 rotations; the one-shot mode uses rotations 0–76 so at least 180 runes remain covered.

Total: **42,408** settings.

Candidates are ranked on the first 90 runes of 25 pages 0–27 with at least 180 runes. The frozen top candidate is scored on the next 90 runes of 22 pages 28–55 with at least 180 runes. A GP29 trigram model is trained on the first 240,000 characters of the pinned Shakespeare control. Scores are average conditional log probability in nats per rune; less negative is more English-like.

## Positive detection control

Eight 180-rune pages were planted from an independent Shakespeare holdout using a known source-derived key and transform: onion2, forward bytes, byte-mod29, Vigenère subtraction, global-repeat, rotation 37. The same 42,408-setting search, using only the first four planted pages' first 90 runes for ranking, recovered the exact setting at **rank 1/42,408**.

This validates that the search can identify a correct key and clock within the tested family. It does not establish that the historical strings were intended for LP2.

## Original LP2 result

The best training candidate is:

- Source: onion2.
- Byte order: reversed.
- Mapping: floor(29 × byte / 256).
- Transform: Vigenère subtraction.
- Clock: global-repeat.
- Rotation: 30.

Its training score is **−5.929811**, holdout score **−6.157999**, full-page score **−6.192649**, and later-page full score **−6.219805**. Raw ciphertext scores **−6.179907 / −6.215354** on the same training/holdout windows. A deterministic random 5,000-symbol GP reference scores −6.254534; known plaintext controls for LP2 pages 56 and 57 score −3.473939 and −2.420295.

The top candidate's page-28 output begins:

    G G M S E N L I AE IA R M AE IA A C OE D T W T TH A J O L P I B EO B I B G EA J EA L OE M O I B N M N TH X T EA N J A A H OE T I IA M J P W T B R NG C M EA S OE J O S EA OE L NG Y T Y P TH EA TH EO M B OE

The best candidate's full-page scores remain random-like; its highest individual page score is only −5.7272. The slight holdout improvement over raw ciphertext is not accompanied by readable text or a stable linguistic signal.

## Conclusion and scope

None of the three archived 256-byte service strings acts as a direct GP29 repeating or page-one-shot Vigenère/Beaufort key under the tested mappings, transforms, directions, rotations, and clocks. The rank-1 planted control shows that this negative is meaningful for the specified family.

This does not exclude the strings as inputs to a KDF, nonlinear transformation, XOR sharing scheme, AES/ChaCha key, timing-derived construction, or another role. Those are separate hypotheses and should not be conflated with direct GP29 key reuse.

## Reproduction

Run from the repository root:

    node sims/historical_onion_bytes_vigenere_gate.cjs

The script reads pinned resources, emits source hashes and all top candidates, asserts the 42,408-setting family size, and verifies the planted control's rank.
