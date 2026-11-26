"""Run pinned external C3 and C9 development checks, without changing the checker."""
from pathlib import Path
import json
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
PIN = "fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb"
ADAPTER = ROOT / "sims/lp2_vnull_c9_checker_adapter.py"
SEED = 2969472026

def main():
    with tempfile.TemporaryDirectory(prefix="lp2-c9-") as d:
        repo = Path(d)
        subprocess.run(["git", "init", "-q", str(repo)], check=True)
        subprocess.run(["git", "-C", str(repo), "fetch", "--depth", "1",
                        "https://github.com/Dukotah/cicada3301.git", PIN], check=True)
        subprocess.run(["git", "-C", str(repo), "checkout", "--detach", "FETCH_HEAD"], check=True)
        got = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
        if got != PIN:
            raise RuntimeError(f"incorrect checker commit {got}")
        sys.path.insert(0, str(repo / "challenges"))
        import c9_rejection_loops as c9
        import gates
        import _sandbox
        # Only the scored V-NULL arm. No V-BACK or new key sweep.
        paths = ["data/keys/armada19/mill_on_liberty.txt",
                 "data/keys/armada19/shelley_frankenstein.txt"]
        stream = c9.H.english_stream(paths)
        with _sandbox.Sandbox(str(ADAPTER), "decode", "plain") as sb:
            rows = gates.run_all(decoder=c9.sandboxed_decoder(sb), verbose=True)
            results = c9.run(None, 40, SEED, stream, ["V-NULL"], sb=sb)
        c9.table("lexical posterior development calibration", results)
        print("C9_DEV_RESULT", json.dumps({"pin": PIN, "seed": SEED, "paths": paths,
                  "c3": rows, "vnull": results["V-NULL"]}, sort_keys=True), flush=True)

if __name__ == "__main__":
    main()
