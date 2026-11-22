"""2014 source-native gate: inspect original Python3.4 constants without executing bytecode.

Requires xdis==6.3.0 and outbound access to immutable public original Git blobs.
Read-only, with SHA-1 verification of both original files.
"""
from __future__ import annotations
import ast
import base64
import hashlib
import json
from pathlib import Path
import tempfile
import urllib.request
from xdis.load import load_module

REPO = "kenorb-contrib/cicada_toolset"
SOURCE_SHA = "07986e6af873925974c339ba4feef720a54189f3"
BYTECODE_SHA = "06d8c0ae1d178a596b21268f0d33934ad76d4ef3"

def source_blob(sha: str) -> bytes:
    url = f"https://api.github.com/repos/{REPO}/git/blobs/{sha}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "lp2-cluosh-2014-original-numeric-constant-gate",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    })
    with urllib.request.urlopen(req, timeout=30) as response:
        obj = json.load(response)
    assert obj["sha"] == sha and obj["encoding"] == "base64"
    data = base64.b64decode(obj["content"], validate=False)
    assert len(data) == obj["size"]
    digest = hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()
    assert digest == sha
    return data

def numeric(value: object) -> bool:
    return isinstance(value, (int, float, complex)) and not isinstance(value, bool)

def code_tree(root: object) -> list[tuple[str, object]]:
    output: list[tuple[str, object]] = []
    def recurse(code: object, prefix: str) -> None:
        label = str(getattr(code, "co_name", "<missing>"))
        full = f"{prefix}/{label}" if prefix else label
        output.append((full, code))
        for value in getattr(code, "co_consts", ()):
            if hasattr(value, "co_consts") and hasattr(value, "co_code"):
                recurse(value, full)
    recurse(root, "")
    return output

def main() -> None:
    source, raw = source_blob(SOURCE_SHA), source_blob(BYTECODE_SHA)
    assert len(raw) == 7145 and len(source) == 6196
    assert raw[:4].hex() == "ee0c0d0a"
    parsed = ast.parse(source.decode("utf-8"), filename="2014_original_rcrypto.py")
    source_ints = {node.value for node in ast.walk(parsed) if isinstance(node, ast.Constant) and numeric(node.value)}
    source_names = {node.name for node in ast.walk(parsed) if isinstance(node, (ast.FunctionDef, ast.ClassDef))}
    with tempfile.TemporaryDirectory(prefix="lp2-pyc-2014-") as folder:
        original = Path(folder) / "rcrypto.cpython-34.pyc"
        original.write_bytes(raw)
        loaded = load_module(str(original))
    version, timestamp, magic, top_code = loaded[:4]
    assert version[:2] == (3, 4), (version, magic)
    code_objects = code_tree(top_code)
    constants: list[dict[str, object]] = []
    for location, code in code_objects:
        for value in getattr(code, "co_consts", ()):
            if numeric(value):
                constants.append({"code": location, "value": value})
    differences = [row for row in constants if row["value"] not in source_ints]
    foreign_codes = [name for name, _ in code_objects if name.rsplit("/", 1)[-1] not in source_names and name != "<module>"]
    strings = [
        {"code": name, "length": len(value), "preview": repr(value[:70])}
        for name, code in code_objects
        for value in getattr(code, "co_consts", ())
        if isinstance(value, (str, bytes)) and len(value) >= 30
        and (value.decode("utf-8", "replace") if isinstance(value, bytes) else value) not in source.decode("utf-8")
    ]
    report = {
        "original_2014_source_sha": SOURCE_SHA,
        "original_2014_pyc_sha": BYTECODE_SHA,
        "pyc_magic": raw[:4].hex(),
        "decoded_python_version": str(version),
        "original_compilation_timestamp": timestamp,
        "unmarshalled_code_objects": len(code_objects),
        "all_code_names": [name for name, _ in code_objects],
        "names_absent_from_adjacent_source": foreign_codes,
        "numeric_const_count": len(constants),
        "unique_numeric_consts": sorted({str(row["value"]) for row in constants}),
        "numeric_consts_not_literal_in_adjacent_source": differences,
        "long_string_consts_not_literal_in_adjacent_source": strings,
        "code_not_executed": True,
    }
    print(json.dumps(report, indent=2))
    assert code_objects and constants, "Expected original compiled code and numeric constants"

if __name__ == "__main__":
    main()
