# P0 current 27×27 post-THEN continuation selector audit

**Agent2, 18 November 2026. Evidence class: reproducible audit of an external community candidate against original p0–p2 ciphertext. No authenticated LP2 plaintext is claimed.**

## Why this branch was tested

The shared repository had already audited the community 27×27 proposal through the sentence ending in `THEN`. During this invocation the upstream public repository had advanced beyond that pinned version. At current upstream commit `d89cf1b16f849f6d59ca311553436e13075a71fb` (18 November 2026 19:44:37Z), its candidate continuation is:

```text
THE KEY IS TO GO TO THE EAST OF THE MAP.
LIFE MAY BE THE DEATH OF YOU.
GO, DO AS I ASK.
DIE.
```

The upstream README explicitly says exact next-location selection remains open. More importantly for a clean holdout, its first post-`THEN` file states that blocks 1–17 supplied the 16 transitions used to develop Reports 01–06, while candidate block18 `THE` lies outside that fitting set. This creates a bounded test: apply only those six forecasts to original p0–p2 source data, then count how much candidate freedom remains before reading English.

Relevant external snapshots:

- previously audited pinned reconstruction: <https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/7b3b320f1f873e31917ba74dfd68a374c8ec563a>
- current upstream head used to identify the new candidate: <https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/d89cf1b16f849f6d59ca311553436e13075a71fb>
- current block18 walkthrough: <https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/d89cf1b16f849f6d59ca311553436e13075a71fb/plaintext-i-found/18-the.md>

## Frozen post-THEN forecasts

The preceding candidate block is `THEN`, ciphertext `L(25,25) → T(25,26) → W(25,27)`. Reports 01–06 predict the following properties before a new plaintext word is inspected:

1. derived-key Möbius signature `(+1,+1,+1)`, phase 0;
2. next leftmost ciphertext cell is the **END**, in the reflected-mode `μ(n₁) ∈ {0,−1}` class;
3. next ciphertext axis is **DIAGONAL**, with reading direction toward smaller column numbers;
4. next original key-center parity is **even row / odd column**;
5. next endpoint/leftmost row is **odd**;
6. the next beginning lies within eight-ray deviation `d₈ ≤ 1` of the preceding leftmost cell `L(25,25)`.

I deliberately give the proposal a favorable restriction that it does not earn from Reports 01–06: key sources are required to be **equal-outer mirrors**, even though the general method admits non-mirror nodes. Ciphertext lengths 2–10 runes are allowed, which covers ordinary whole-word candidates and the proposed two-rune GP spelling `TH·E`.

## Exhaustive original-source enumeration

On the canonical original p0–p2 27×27 grid:

- **22** equal-outer mirror keys satisfy the predicted signature, phase and center parity;
- **1,035** diagonal ciphertext segments of length 2–10 satisfy the predicted boundary, row class, reflected Möbius class and incoming-ray gate;
- their Cartesian product therefore contains **22,770** admissible key/segment combinations before language is consulted.

Decrypting every combination by the proposal's own repeating-key subtraction modulo29 and then performing source-native English dictionary lookup gives:

- **955** dictionary-valued decryptions;
- **256 distinct English words**;
- the most frequent dictionary word is `THE`, but it occurs **14 separate times** in this admissible family;
- exactly one of those 14 is the published geometry: key center `M(20,17)`, aligned key `N-E-N`, ciphertext `J(22,21) → W(21,20)`, plaintext runes `TH-E`.

The leading distinct outputs by corpus frequency start `THE, OF, TO, IN, HE, WAS, IS, AS, AT, BY, ON, BE, OR, THEY, AN, SO...`. The published continuation is therefore easy to recognize by English frequency, while the six frozen forecasts do not identify it.

This is already a generous test. Allowing the proposal's documented non-mirror node class can only enlarge the admissible key family.

## Decision

The current public continuation after `THEN` is a legitimate **candidate route**, and its selected modular arithmetic is exact. It is **not an out-of-sample plaintext recovery under Reports 01–06**. Those rules leave hundreds of English-bearing alternatives, with `THE` itself appearing 14 times even after a mirror-only restriction.

The new upstream text should therefore be indexed as an unverified candidate for future locked tests, not merged into the project's recovered plaintext. Later upstream Reports 07–19 may further filter the route, but many of those rules were developed after additional candidate transitions existed; they need their own chronological holdout or complexity-matched selector audit before they can authenticate the continuation.

The strongest current p0 progress inside this repository remains the separately derived source-bounded recurrence through `... IDEA OF THE END IS DEATH` and the conditional `SEE YOU SOON` route. The frozen source-only parser still reaches a boundary at the `DEATH` endpoint unless the later conditional family is introduced.

Reproducer: [`sims/lp2_p0_postthen_reports01_06_selector_sft.cjs`](../sims/lp2_p0_postthen_reports01_06_selector_sft.cjs).
