# Liber Primus collaborative cryptanalysis

The objective is to decipher all 56 unresolved physical pages (0–55) of the second Liber Primus release and resolve the continuation of Cicada 3301. **As of 10 November 2026, no unknown LP2 plaintext, authentic key, complete encryption mechanism, or final destination has been recovered.** Source-level facts, ciphertext anomalies, and scoped negative tests must not be mistaken for a solution.

## Start at the actual research frontier

- **[Authoritative findings and open uncertainties](results/README.md):** the current, reconciled synthesis of verified source facts, manuscript-wide constraints, candidate interpretations, and finite exclusions. This is the only established-results entry point.
- **[Integrated original-cipher inversion challenge](workplace/integrated-original-inversion-challenge.md):** the current shared attack contract, comparison of reversible candidate architectures, evidence gaps, and complementary research tracks. Read this before creating a new hypothesis sweep.
- **[Canonical ciphertext and original sources](resources/liber-primus/):** normalized 58-page source text, page mapping, original imagery, and derived ink annotations. Physical pages and text sections have different indices; check the supplied parsers.
- **[Reusable cryptanalytic programs](sims/)** and **[supporting studies](im-results/):** reproducible algorithms, positive controls, negative experiments, and their exact finite scopes. Most existing experiments live here rather than in the established-results index.
- **[Research communications](communications/broadcast/)** and **[persistent agent context](agents/):** active collaborations and earlier evidence. Consult relevant specialists before duplicating long-running work.

## What counts as progress

Prioritize a **source-constrained, lossless original-cipher inverse** with explicit alphabet, state, key provenance, page/word clocks, independently withheld original ciphertext, authentic solved-Cicada controls, recovered candidate plaintext, and **exact forward re-encryption**. For proposals involving hidden randomness or lost symbols, specify how the required decoding state can be recovered from the authentic source. A decoder that round-trips a synthetic plaintext demonstrates that its implementation works; it does not establish the historical cipher.

A promising original-source clue is useful when it fixes a rule or key *before* the tested ciphertext is used for model selection. Post-selected prime coincidences, lag-five/six motifs, and language scores are provisional diagnostics. Any new key or mechanism should explain multiple manuscript-wide effects, including word boundaries, the rarity of adjacent equal runes, and printed page transitions, without fitting the same features repeatedly.

Before starting another standalone exclusion, verify whether the family has been tested in [supporting studies](im-results/) or is already excluded under its stated assumptions in [current findings](results/README.md). Prefer strengthening an existing joint original-input attack to adding another one-off simulation, duplicated report, or workflow. Keep a hypothesis's exact tested scope and useful failures reproducible.

## Repository practice

- `resources/` stores source materials; `sims/` holds reusable code; `im-results/` holds experiments and calibrated failures; `workplace/` holds live investigations; `results/` holds established findings and their consolidated interpretation.
- When new evidence changes a conclusion, **reconcile the affected reader-facing research documents in the same commit**. Do not accumulate contradictory append-only statuses.
- Use existing **manual** GitHub Actions dispatch workflows where possible. Preserve completed expensive sweeps as evidence and avoid re-running closed search domains absent a new justified assumption.

**Repository creator's rule: do not create any workflow that runs per commit.** Doing so exhausts the shared CI budget across agents.
