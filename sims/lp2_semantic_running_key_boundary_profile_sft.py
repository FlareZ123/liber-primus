"""Symmetric K-boundary profiling for the frozen #2656 semantic comparator.

Uses the exact six saved outputs from workflow run 45536706261. P and K rune
sequences are held fixed; only the unconstrained key-word boundary tape varies.
The same DistilGPT2 checkpoint and the original 18/9, 24/12, 12/6 coordinate
sweeps are applied to the authentic pair and the previously selected rival.
The 384-state n-gram proposal beam is a search bound, not a proof of optimality.
"""
import argparse
import base64
import gzip
import hashlib
import json
from pathlib import Path

from lp2_semantic_running_key_recovery_sft import MODEL, REV, Semantic, Server, starts

ROOT = Path(__file__).resolve().parents[1]
SWEEPS = ((18, 9, False), (24, 12, True), (12, 6, False))


def profile_pair(server, sem, C, L, pair):
    best = server.ask(op="check", C=C, L=L, pair=pair)
    initial = sem.scores([best], len(C))[0]
    value = initial
    accepted = 0
    history = []
    for width, stride, reverse in SWEEPS:
        for lo, hi in starts(len(C), width, stride, reverse):
            candidates = server.ask(
                op="boundary", C=C, L=L, pair=best, lo=lo, hi=hi
            )
            if not candidates:
                continue
            scores = sem.scores(candidates, len(C))
            idx = max(range(len(scores)), key=scores.__getitem__)
            if scores[idx] > value + 1e-6:
                best, value = candidates[idx], scores[idx]
                accepted += 1
                history.append({
                    "window": [lo, hi],
                    "score": value,
                    "boundaries": sum(best["space"]),
                })
    assert all((p + k) % 29 == c for p, k, c in zip(best["P"], best["K"], C))
    return {
        "initialScore": initial,
        "profiledScore": value,
        "accepted": accepted,
        "history": history,
        "pair": best,
    }


def boundary_stats(spaces, truth_spaces):
    return {
        "boundaryCount": sum(bool(x) for x in spaces),
        "truthBoundaryCount": sum(bool(x) for x in truth_spaces),
        "positionsMatchingTruth": sum(bool(a) == bool(b) for a, b in zip(spaces, truth_spaces)),
        "positions": len(spaces),
        "precision": (
            sum(bool(a) and bool(b) for a, b in zip(spaces, truth_spaces))
            / max(1, sum(bool(a) for a in spaces))
        ),
        "recall": (
            sum(bool(a) and bool(b) for a, b in zip(spaces, truth_spaces))
            / max(1, sum(bool(b) for b in truth_spaces))
        ),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", type=int, required=True, choices=range(6))
    parser.add_argument(
        "--input-file",
        type=Path,
        default=ROOT / "im-results" / "lp2-semantic-running-key-boundary-profile-inputs.json.gz.b64",
    )
    args = parser.parse_args()

    source = args.input_file.resolve()
    compressed = base64.b64decode(source.read_text(encoding="ascii").strip())
    raw = gzip.decompress(compressed)
    input_sha256 = hashlib.sha256(raw).hexdigest()
    expected_sha256 = "fd49346669ec90cf52bf12984a398cbc2715eeb5e438af1f78ed713a8c85cde0"
    if input_sha256 != expected_sha256:
        raise RuntimeError(f"saved-input SHA-256 mismatch: {input_sha256}")
    cases = json.loads(raw)
    case = cases[args.index]
    if case["index"] != args.index:
        raise RuntimeError("saved-input index mismatch")
    control = {"C": case["C"], "L": case["L"], "truth": case["truth"], "name": case["name"]}
    summary = case["summary"]
    C, L = control["C"], control["L"]
    truth = control["truth"]
    rival = case["rival"]

    server = Server()
    try:
        sem = Semantic()
        print(control["name"], "symmetric boundary profile", flush=True)
        true_result = profile_pair(server, sem, C, L, truth)
        rival_result = profile_pair(server, sem, C, L, rival)

        expected_true = float(summary["truthScore"])
        expected_rival = float(summary["finalScore"])
        if abs(true_result["initialScore"] - expected_true) > 1e-4:
            raise RuntimeError(
                f"true-pair score mismatch: {true_result['initialScore']} vs {expected_true}"
            )
        if abs(rival_result["initialScore"] - expected_rival) > 1e-4:
            raise RuntimeError(
                f"rival-pair score mismatch: {rival_result['initialScore']} vs {expected_rival}"
            )

        truth_spaces = truth["space"]
        true_stats = boundary_stats(true_result["pair"]["space"], truth_spaces)
        rival_stats = boundary_stats(rival_result["pair"]["space"], truth_spaces)
        initial_gap = rival_result["initialScore"] - true_result["initialScore"]
        profiled_gap = rival_result["profiledScore"] - true_result["profiledScore"]
        out = {
            "source": {
                "workflowRun": 45536706261,
                "artifact": f"lp2-semantic-running-key-recovery-{args.index}",
                "artifactId": case["artifactId"],
                "input": str(source.relative_to(ROOT)),
                "inputSha256": input_sha256,
                "model": MODEL,
                "revision": REV,
            },
            "name": control["name"],
            "n": len(C),
            "search": {
                "variable": "K word boundaries only",
                "fixed": ["P rune sequence", "K rune sequence", "P word lengths", "C=P+K mod29"],
                "beamWidth": 384,
                "rightLookaheadRunes": 6,
                "candidateCapPerWindow": 24,
                "windowSweeps": [
                    {"width": w, "stride": s, "reverse": r}
                    for w, s, r in SWEEPS
                ],
                "optimality": "bounded beam/coordinate search; no global optimum certificate",
            },
            "initial": {
                "trueScore": true_result["initialScore"],
                "rivalScore": rival_result["initialScore"],
                "rivalMinusTrue": initial_gap,
            },
            "profiled": {
                "trueScore": true_result["profiledScore"],
                "rivalScore": rival_result["profiledScore"],
                "rivalMinusTrue": profiled_gap,
                "trueWins": true_result["profiledScore"] > rival_result["profiledScore"],
            },
            "trueBoundaryRecovery": true_stats,
            "rivalBoundaryAgreement": rival_stats,
            "true": true_result,
            "rival": rival_result,
        }
        dest = ROOT / f"im-results/lp2-semantic-running-key-boundary-profile-{args.index}.json"
        dest.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({
            "name": control["name"],
            "initialGap": initial_gap,
            "profiledGap": profiled_gap,
            "trueWins": out["profiled"]["trueWins"],
            "trueBoundaries": true_stats,
            "accepted": {
                "true": true_result["accepted"],
                "rival": rival_result["accepted"],
            },
        }), flush=True)
    finally:
        server.close()


if __name__ == "__main__":
    main()
