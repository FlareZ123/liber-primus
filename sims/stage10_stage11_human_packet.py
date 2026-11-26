"""Reconstruct the frozen #3010 participant packet from exact Git objects."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

def git_blob(root, revision, path):
    return subprocess.check_output(["git", "-C", str(root), "show", f"{revision}:{path}"])

def blob_hash(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    manifest = json.loads((root / "workplace/human-cold-start/stage10-stage11/source-manifest.json").read_text(encoding="utf-8"))
    output = args.output.resolve()
    if output.exists() and any(output.iterdir()):
        raise ValueError("output must be absent or empty")
    files = {}
    for item in manifest["sources"]:
        data = git_blob(root, manifest["sourceCommit"], item["source"])
        if len(data) != item["size"] or blob_hash(data) != item["sha"]:
            raise ValueError(item["source"])
        files[item["dest"]] = data
    for item in manifest["generated"]:
        data = git_blob(root, manifest["packetCommit"], item["path"])
        if blob_hash(data) != item["sha"]:
            raise ValueError(item["path"])
        files[item["path"]] = data
    if len(files) != 68:
        raise ValueError("incorrect membership")
    for path, data in files.items():
        dest = output / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    print(f"Verified and wrote {len(files)} files to {output}")

if __name__ == "__main__":
    main()
