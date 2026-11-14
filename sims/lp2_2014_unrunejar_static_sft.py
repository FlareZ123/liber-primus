#!/usr/bin/env python3
"""Read-only, source-anchored original 2014 UnRuneIt JAR static comparison.

Only opens ZIP members and parses CLASS constant-pool strings. Never imports,
executes, instantiates, or loads any of the recovered third-party Java classes.
Windows 11: run with Python 3.11+ and existing two .jar paths as arguments.
"""
import hashlib
import json
import pathlib
import struct
import sys
import zipfile


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def constant_utf8(data: bytes) -> list[str]:
    """Read Java class UTF8 constant pool without evaluating bytecode."""
    if not data.startswith(bytes.fromhex("cafebabe")):
        return []
    size = struct.unpack_from(">H", data, 8)[0]
    offset = 10
    values = []
    index = 1
    while index < size:
        tag = data[offset]
        offset += 1
        if tag == 1:
            n = struct.unpack_from(">H", data, offset)[0]
            offset += 2
            s = data[offset:offset + n].decode("utf8", "replace")
            offset += n
            if len(s) >= 2 and len(s) <= 500:
                values.append(s)
        elif tag in (3, 4, 9, 10, 11, 12, 17, 18):
            offset += 4
        elif tag in (5, 6):
            offset += 8
            index += 1
        elif tag in (7, 8, 16, 19, 20):
            offset += 2
        elif tag == 15:
            offset += 3
        else:
            raise ValueError(f"Unknown Java constant-pool tag {tag}")
        index += 1
    return values


def scan(filename: str) -> tuple[dict, dict[str, str]]:
    data = pathlib.Path(filename).read_bytes()
    if data[:4] != bytes.fromhex("504b0304"):
        raise ValueError("ZIP/JAR magic mismatch")
    with zipfile.ZipFile(filename) as archive:
        entries = [e for e in archive.infolist() if not e.is_dir()]
        listing = {e.filename: sha(archive.read(e.filename)) for e in entries}
        manifest = []
        userclass = {}
        resources = {}
        for e in entries:
            name = e.filename
            content = archive.read(e)
            if name.upper() == "META-INF/MANIFEST.MF":
                manifest = content.decode("utf8", "replace").splitlines()
            if name.endswith(".class"):
                # GUI and cipher application classes, not JDK/third-party libs.
                vendor = name.startswith(("com/", "javax/", "org/", "net/"))
                values = constant_utf8(content)
                if not vendor:
                    userclass[name] = values
            elif name.endswith((".txt", ".properties", ".xml", ".ini", ".csv", ".json", ".java")):
                if len(content) < 100000:
                    resources[name] = content.decode("utf8", "replace")[:700]
        out = {
            "file": filename,
            "size": len(data),
            "sha256": sha(data),
            "entries": len(entries),
            "classCount": len([e for e in entries if e.filename.endswith(".class")]),
            "mainManifest": manifest[:25],
            "allNonVendorClassNames": sorted(userclass),
            "embeddedResources": resources,
            "candidateClassConstants": {k: v[:100] for k, v in userclass.items()},
            "largestFiles": sorted(
                [{"filename": e.filename, "bytes": e.file_size} for e in entries],
                key=lambda x: -x["bytes"],
            )[:18],
        }
        return out, listing


def main() -> None:
    if len(sys.argv) == 2 and sys.argv[1] == "--selftest":
        assert constant_utf8(bytes.fromhex("cafebabe000000340001")) == []
        print("PASS Java CLASS constant-pool parser and no execution")
        return
    if len(sys.argv) != 3:
        raise SystemExit("Pass two JARs recovered from original 2014 MediaFire URLs")
    one, paths_one = scan(sys.argv[1])
    two, paths_two = scan(sys.argv[2])
    print("JAR1 " + json.dumps(one, ensure_ascii=False))
    print("JAR2 " + json.dumps(two, ensure_ascii=False))
    allnames = sorted(set(paths_one) | set(paths_two))
    changed = [
        {"name": name, "jar1": paths_one.get(name), "jar2": paths_two.get(name)}
        for name in allnames if paths_one.get(name) != paths_two.get(name)
    ]
    print("DIFF " + json.dumps({"changedCount": len(changed),
          "changed": changed[:80]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
