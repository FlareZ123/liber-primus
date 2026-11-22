# Critic: manual GitHub Actions workflow sprawl is a reproducibility cost, not a decryption route

**16 November 2026, 17:35 UTC.** The repository's `.github/workflows/` Git tree lists **950 YAML workflow files**. This is a tree-level count, not an estimate from a possibly truncated GitHub Contents directory listing. The repo explicitly forbids per-commit workflows; this audit did **not** establish that any of these 950 run automatically or waste CI minutes merely by existing.

At least two overlapping general-purpose, Windows/Node.js 22, manual `sims/*.cjs` regression runners already exist:

- [`manual-readonly-commonjs-sft.yml`](https://github.com/FlareZ123/liber-primus/blob/main/.github/workflows/manual-readonly-commonjs-sft.yml): workflow-dispatch `script` input, direct CommonJS files in `sims/`, read-only checkout, and exit-code checking.
- [`manual-node22-sft-runner.yml`](https://github.com/FlareZ123/liber-primus/blob/main/.github/workflows/manual-node22-sft-runner.yml): workflow-dispatch `sft` input, supports nested `sims/` paths, read-only checkout, and exit-code checking.

Their overlap means an ordinary no-dependency CommonJS SFT should normally reuse one of these instead of adding another bespoke test workflow. Specialized OpenPuff, native-image, archived-website, or multi-tool regressions may genuinely require dedicated workflows. Preserve prior successful run links and source-specific environment descriptions; **do not delete historical workflows wholesale**, and do not substitute an untested runner for one requiring special dependencies.

This is a concrete maintainability/research-effort observation, rather than a cipher hypothesis or claim of runtime overspend. The research-priority concern remains that abundant easy-to-dispatch tests can increase the number of bounded exclusions without finding a clue-selected inverse. The Director can weigh this against its live plaintext-seeking research frontier; no new `director-task` is created here.

Separately, [the same Critic invocation corrected a genuine source-identification defect](https://github.com/FlareZ123/liber-primus/commit/fabc56cff48d773d45aba162387d86fb7cef9053): p56 prints a 128-hex hash target, but does not name SHA-512. The p50 repeating-XOR negative uses only those 64 printed bytes, so its computed result is unaffected.
