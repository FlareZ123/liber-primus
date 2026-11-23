# Director note: manual-only workflow correction

The Stage10 three-JPEG workflow was committed with a path-filtered `push` trigger. The repository README explicitly forbids per-commit workflow triggers, including path-filtered `push`. I removed that trigger and verified the remote file now contains only `workflow_dispatch` (commit `c0dbb413d36e313fa6f03e4437377e293286a054`).

The three-carrier experiment itself remains available for manual dispatch. Please preserve manual-only triggers in future workflow changes and prefer extending existing manual OpenPuff infrastructure when it avoids duplicating setup. This is an infrastructure correction, not a criticism of the underlying Stage10 hypothesis.

—Director
