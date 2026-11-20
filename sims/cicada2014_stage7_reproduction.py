#!/usr/bin/env python3
"""Reproduce the documented 2014 Stage 7 signed-hex -> MP3 -> OpenPuff chain.

This test is deliberately historical-only. A successful extraction does not imply
that Stage 7 supplies an LP2 key or cipher operation.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KEY_FILE = ROOT / "resources" / "cicada-3301-authentic-public-key.asc"
SQUARES_FILE = ROOT / "resources" / "cicada2014-openpuff-magic-squares.txt"
OUT = Path(os.environ.get("RUNNER_TEMP") or tempfile.gettempdir()) / "liber-primus-stage7-reproduction"
OUT.mkdir(parents=True, exist_ok=True)
EXTRACT_DIR = OUT / "openpuff-output"
EXTRACT_DIR.mkdir(parents=True, exist_ok=True)

CICADA_FPR = "6D854CD7933322A601C3286D181F01E57A35090F"
EXPECTED_PAGE = ("afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9", 13_526_359)
EXPECTED_MP3 = ("09fe068192b76a3697c47ec1d604b527703db798", 6_651_873)

SOURCES = {
    "cijhho": {
        "commit": "d360ad97d39c4719e42dc88b0cbbb81ed54aa02c",
        "base": "https://raw.githubusercontent.com/cijhho123/cicada3301/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/assets/2014/stage07",
    },
    "scream314": {
        "commit": "10733feb487bb8beb9966d534727ee5897aa54fc",
        "base": "https://raw.githubusercontent.com/scream314/cicada3301/10733feb487bb8beb9966d534727ee5897aa54fc/assets/2014/stage07",
    },
}
PAGE_REL = "q4utgdi2n4m4uim5.onion/index.html"
MP3_REL = "index.mp3"
SQUARES_REL = "magicsquares.txt"
OPENPUFF_URL = "https://mir.cr/05EYEMXF"
OPENPUFF_ZIP_MD5 = "ab4ec8401743a6937b50daae4f338417"
OPENPUFF_EXE_SHA256 = "b100ccd77a9159a1057f9bb2abca471ab05f3ab551d11aa114b78f2226a0aa4c"

REPORT: dict[str, object] = {
    "scope": "2014 Stage 7 historical reproduction only; no LP2 inference",
    "sources": {},
    "signature": {},
    "hex_to_mp3": {},
    "openpuff": {},
}


def git_blob_sha1(data: bytes) -> str:
    h = hashlib.sha1()
    h.update(b"blob " + str(len(data)).encode("ascii") + b"\0")
    h.update(data)
    return h.hexdigest()


def download(url: str, destination: Path) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "liber-primus-stage7-reproducer/1.0"},
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status} downloading {url}")
        data = response.read()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)
    return data



def download_openpuff(url: str, destination: Path) -> bytes:
    """Fetch the pinned OpenPuff archive with browser-like headers and preserve
    any interstitial response for diagnosis instead of discarding it.
    """
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            "Accept": "application/zip, application/octet-stream, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.portablefreeware.com/index.php?id=1858",
        },
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        data = response.read()
        metadata = {
            "requested_url": url,
            "final_url": response.geturl(),
            "status": response.status,
            "content_type": response.headers.get("Content-Type"),
            "content_disposition": response.headers.get("Content-Disposition"),
            "content_length_header": response.headers.get("Content-Length"),
            "server": response.headers.get("Server"),
        }
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)
    metadata["bytes"] = len(data)
    metadata["md5"] = hashlib.md5(data).hexdigest()
    metadata["sha256"] = hashlib.sha256(data).hexdigest()
    if not zipfile.is_zipfile(destination):
        html_path = OUT / "OpenPuff-mirror-response.html"
        html_path.write_bytes(data)
        html = data.decode("utf-8", errors="replace")
        metadata["response_file"] = str(html_path)
        metadata["links"] = re.findall(
            r"""(?i)(?:href|src)\s*=\s*["']([^"']+)["']""", html
        )
        metadata["forms"] = re.findall(r"(?is)<form\b[^>]*>", html)
        metadata["scripts"] = re.findall(
            r"(?is)<script\b[^>]*>.*?</script\s*>", html
        )
        REPORT["openpuff"]["mirror_response"] = metadata
        print("OPENPUFF_MIRROR_DIAGNOSTICS")
        print(json.dumps(metadata, indent=2))
        print("OPENPUFF_MIRROR_HTML_BEGIN")
        print(html[:20000])
        print("OPENPUFF_MIRROR_HTML_END")
    return data

def run_checked(args: list[str], *, env: dict[str, str] | None = None) -> subprocess.CompletedProcess:
    result = subprocess.run(args, capture_output=True, text=True, env=env)
    if result.returncode:
        raise RuntimeError(
            f"Command failed ({result.returncode}): {args!r}\n"
            f"stdout:\n{result.stdout[-5000:]}\nstderr:\n{result.stderr[-5000:]}"
        )
    return result


def numbers(data: bytes) -> list[str]:
    return re.findall(rb"\d+", data)


def dump_controls(window, path: Path) -> str:
    rows = []
    try:
        controls = window.descendants()
    except Exception:
        controls = []
    for i, control in enumerate(controls):
        try:
            info = control.element_info
            rows.append({
                "i": i,
                "name": info.name,
                "type": info.control_type,
                "class": info.class_name,
                "automation_id": info.automation_id,
                "handle": getattr(info, "handle", None),
            })
        except Exception as exc:
            rows.append({"i": i, "error": str(exc)})
    rendered = json.dumps(rows, indent=2, ensure_ascii=False)
    path.write_text(rendered, encoding="utf-8")
    return rendered


def find_named(parent, fragment: str, control_type: str | None = None):
    fragment = fragment.casefold()
    for control in parent.descendants():
        try:
            info = control.element_info
            if fragment in (info.name or "").casefold():
                if control_type is None or info.control_type == control_type:
                    return control
        except Exception:
            continue
    return None


def handle_file_dialog(app, file_path: Path, timeout: int = 20) -> None:
    from pywinauto import Desktop
    deadline = time.time() + timeout
    while time.time() < deadline:
        for dialog in Desktop(backend="uia").windows():
            try:
                title = (dialog.window_text() or "").casefold()
                if title in {"open", "select carrier", "choose carrier"} or "open" in title:
                    edits = dialog.descendants(control_type="Edit")
                    if edits:
                        edits[-1].set_edit_text(str(file_path))
                        button = find_named(dialog, "open", "Button")
                        if button:
                            button.click_input()
                            time.sleep(2)
                            return
                        edits[-1].type_keys("{ENTER}")
                        time.sleep(2)
                        return
            except Exception:
                continue
        time.sleep(0.5)
    raise RuntimeError("OpenPuff carrier file dialog did not appear or could not be filled")


def main(openpuff_only: bool = False) -> int:
    if openpuff_only:
        # Continue only the outstanding OpenPuff stage. The signed carrier and
        # hex->MP3 stages were already verified in workflow run 44708710753.
        source = SOURCES["cijhho"]
        mp3 = download(source["base"] + "/" + MP3_REL, OUT / "decoded-interconnectedness.mp3")
        squares = download(source["base"] + "/" + SQUARES_REL, OUT / "cijhho" / "magicsquares.txt")
        assert len(mp3) == EXPECTED_MP3[1]
        assert git_blob_sha1(mp3) == EXPECTED_MP3[0]
        a = {"mp3": mp3, "squares": squares}
        b = a
        REPORT["scope"] = "2014 Stage 7 historical reproduction; OpenPuff-only continuation; upstream signature and hex stages referenced from run 44708710753"
        REPORT["sources"]["cijhho"] = {
            "pinned_commit": source["commit"],
            "mp3_bytes": len(mp3),
            "mp3_git_blob_sha1": git_blob_sha1(mp3),
            "squares_bytes": len(squares),
            "squares_git_blob_sha1": git_blob_sha1(squares),
        }
        REPORT["signature"] = {
            "status": "VALIDSIG verified in prior workflow run",
            "workflow_run_id": 44708710753,
            "fingerprint": CICADA_FPR,
        }
        REPORT["hex_to_mp3"] = {
            "status": "exact MP3 verified in prior workflow run",
            "workflow_run_id": 44708710753,
            "decoded_bytes": len(mp3),
            "decoded_git_blob_sha1": git_blob_sha1(mp3),
        }
    else:
        # 1. Acquire both pinned archive copies and the published square controls.
        archive_data: dict[str, dict[str, bytes]] = {}
        for name, source in SOURCES.items():
            base = source["base"]
            page = download(base + "/" + PAGE_REL, OUT / name / "index.html")
            mp3 = download(base + "/" + MP3_REL, OUT / name / "index.mp3")
            squares = download(base + "/" + SQUARES_REL, OUT / name / "magicsquares.txt")
            archive_data[name] = {"page": page, "mp3": mp3, "squares": squares}
            REPORT["sources"][name] = {
                "pinned_commit": source["commit"],
                "page_bytes": len(page),
                "page_git_blob_sha1": git_blob_sha1(page),
                "mp3_bytes": len(mp3),
                "mp3_git_blob_sha1": git_blob_sha1(mp3),
                "squares_bytes": len(squares),
                "squares_git_blob_sha1": git_blob_sha1(squares),
            }

        a = archive_data["cijhho"]
        b = archive_data["scream314"]
        assert len(a["page"]) == EXPECTED_PAGE[1] == len(b["page"])
        assert git_blob_sha1(a["page"]) == EXPECTED_PAGE[0]
        assert git_blob_sha1(b["page"]) == EXPECTED_PAGE[0]
        assert a["page"] == b["page"], "Pinned signed-page copies differ"
        assert len(a["mp3"]) == EXPECTED_MP3[1] == len(b["mp3"])
        assert git_blob_sha1(a["mp3"]) == EXPECTED_MP3[0]
        assert git_blob_sha1(b["mp3"]) == EXPECTED_MP3[0]
        assert a["mp3"] == b["mp3"], "Pinned MP3 copies differ"

        # 2. Verify the original clear-signed page with the preserved Cicada key.
        gpg = shutil.which("gpg") or shutil.which("gpg.exe")
        if not gpg:
            raise RuntimeError("GnuPG is not on PATH; workflow must install gnupg")
        gpg_home = OUT / "gnupg"
        gpg_home.mkdir(parents=True, exist_ok=True)

        # MSYS2 GPG rewrites Windows drive paths into invalid mixed paths unless
        # callers provide its native POSIX spelling. Native Windows GPG keeps the
        # ordinary pathlib spelling. Convert every filesystem argument explicitly.
        gpg_is_msys2 = "msys64" in str(gpg).casefold()

        def gpg_path(path: Path) -> str:
            if not gpg_is_msys2:
                return str(path)
            cygpath = shutil.which("cygpath.exe") or shutil.which("cygpath")
            if not cygpath:
                candidate = Path(gpg).with_name("cygpath.exe")
                if candidate.exists():
                    cygpath = str(candidate)
            if not cygpath:
                raise RuntimeError("MSYS2 GPG was selected but cygpath.exe is unavailable")
            converted = run_checked([cygpath, "-u", str(path)]).stdout.strip()
            if not converted.startswith("/"):
                raise RuntimeError(f"cygpath did not return a POSIX path for {path}: {converted!r}")
            return converted

        gpg_home_arg = gpg_path(gpg_home)
        key_file_arg = gpg_path(KEY_FILE)
        signed_page_arg = gpg_path(OUT / "cijhho" / "index.html")
        clear_file_arg = gpg_path(OUT / "cleartext.hex")
        os.environ["GNUPGHOME"] = gpg_home_arg
        run_checked([gpg, "--homedir", gpg_home_arg, "--batch", "--import", key_file_arg])
        listed = run_checked([gpg, "--homedir", gpg_home_arg, "--batch", "--with-colons", "--fingerprint", "--list-keys"])
        fingerprints = [
            line.split(":")[9]
            for line in listed.stdout.splitlines()
            if line.startswith("fpr:")
        ]
        assert CICADA_FPR in fingerprints, f"Imported key fingerprint mismatch: {fingerprints}"
        verify = subprocess.run(
            [gpg, "--homedir", gpg_home_arg, "--batch", "--status-fd", "1", "--verify", signed_page_arg],
            capture_output=True,
            text=True,
        )
        status_text = verify.stdout + "\n" + verify.stderr
        assert verify.returncode == 0, f"PGP verification failed:\n{status_text[-5000:]}"
        valid_sigs = [line for line in verify.stdout.splitlines() if line.startswith("[GNUPG:] VALIDSIG ")]
        assert any(CICADA_FPR in line for line in valid_sigs), f"VALIDSIG not from expected Cicada key:\n{status_text[-3000:]}"
        REPORT["signature"] = {
            "status": "VALIDSIG",
            "fingerprint": CICADA_FPR,
            "gpg": gpg,
            "path_mode": "msys2-cygpath" if gpg_is_msys2 else "native-windows",
            "homedir": gpg_home_arg,
            "status_lines": valid_sigs,
        }

        # 3. Reproduce GPG cleartext extraction -> hex decode -> exact MP3.
        clear = subprocess.run(
            [gpg, "--homedir", gpg_home_arg, "--batch", "--yes", "--output", clear_file_arg, "--decrypt", signed_page_arg],
            capture_output=True,
            text=True,
        )
        assert clear.returncode == 0, f"GPG cleartext extraction failed:\n{clear.stderr[-3000:]}"
        hex_text = re.sub(rb"\s+", b"", (OUT / "cleartext.hex").read_bytes())
        assert len(hex_text) % 2 == 0 and re.fullmatch(rb"[0-9a-fA-F]+", hex_text), "Signed cleartext is not an uninterrupted hex payload"
        decoded = bytes.fromhex(hex_text.decode("ascii"))
        (OUT / "decoded-interconnectedness.mp3").write_bytes(decoded)
        assert len(decoded) == EXPECTED_MP3[1]
        assert git_blob_sha1(decoded) == EXPECTED_MP3[0]
        assert decoded == a["mp3"] == b["mp3"], "Hex-decoded MP3 differs from either pinned archive MP3"
        REPORT["hex_to_mp3"] = {
            "hex_characters": len(hex_text),
            "decoded_bytes": len(decoded),
            "decoded_git_blob_sha1": git_blob_sha1(decoded),
            "matches_cijhho_mp3": decoded == a["mp3"],
            "matches_scream314_mp3": decoded == b["mp3"],
            "id3_header": decoded[:10].hex(),
        }


    # 4. Preserve the exact expected 99-number stream from both archive copies.
    local_squares = SQUARES_FILE.read_bytes()
    expected = numbers(local_squares)
    assert len(expected) == 99, f"Local square control has {len(expected)} numbers, expected 99"
    assert numbers(a["squares"]) == expected
    if not openpuff_only:
        assert numbers(b["squares"]) == expected
    REPORT["openpuff"]["expected_square_count"] = len(expected)
    REPORT["openpuff"]["local_square_git_blob_sha1"] = git_blob_sha1(local_squares)
    REPORT["openpuff"]["archive_square_number_streams_match"] = None if openpuff_only else True
    REPORT["openpuff"]["archive_square_number_stream_matches"] = True

    # 5. Download the specifically documented OpenPuff v4.00 executable.
    package = download_openpuff(OPENPUFF_URL, OUT / "OpenPuffv400.zip")
    package_md5 = hashlib.md5(package).hexdigest()
    REPORT["openpuff"]["package_bytes"] = len(package)
    REPORT["openpuff"]["package_md5"] = package_md5
    REPORT["openpuff"]["package_sha256"] = hashlib.sha256(package).hexdigest()
    if package_md5 != OPENPUFF_ZIP_MD5:
        raise RuntimeError(
            "OpenPuff mirror response does not match the published v4.00 ZIP MD5 "
            f"({package_md5}); first bytes: {package[:120]!r}"
        )
    if not zipfile.is_zipfile(OUT / "OpenPuffv400.zip"):
        raise RuntimeError(
            "OpenPuff mirror response is not a ZIP archive; "
            f"first bytes: {package[:120]!r}"
        )
    app_dir = OUT / "OpenPuffv400"
    app_dir.mkdir(exist_ok=True)
    with zipfile.ZipFile(OUT / "OpenPuffv400.zip") as archive:
        archive.extractall(app_dir)
    exe_candidates = list(app_dir.rglob("OpenPuff.exe"))
    if not exe_candidates:
        raise RuntimeError("OpenPuff.exe not found in the v4.00 package")
    exe = exe_candidates[0]
    exe_sha256 = hashlib.sha256(exe.read_bytes()).hexdigest()
    if exe_sha256 != OPENPUFF_EXE_SHA256:
        raise RuntimeError(
            "Extracted OpenPuff.exe does not match the independently published "
            f"v4.00 SHA-256 ({exe_sha256})"
        )
    REPORT["openpuff"]["exe_path"] = str(exe)
    REPORT["openpuff"]["exe_sha256"] = exe_sha256

    # 6. Use the native UI exactly as documented: A=33011033, B/C off,
    #    one MP3 carrier, MP3 Maximum (1/2), then Unhide.
    from pywinauto import Application, Desktop
    app = Application(backend="uia").start(str(exe), work_dir=str(EXTRACT_DIR))
    time.sleep(4)
    main_window = app.top_window()
    main_window.wait("visible enabled", timeout=30)
    dump_controls(main_window, OUT / "openpuff-main-controls.json")

    unhide_button = find_named(main_window, "unhide", "Button")
    if unhide_button is None:
        raise RuntimeError("Could not find main-panel Unhide button; see openpuff-main-controls.json")
    unhide_button.click_input()
    time.sleep(2)
    main_window = app.top_window()
    main_window.wait("visible enabled", timeout=20)
    dump_controls(main_window, OUT / "openpuff-unhide-controls.json")

    edits = main_window.descendants(control_type="Edit")
    if not edits:
        raise RuntimeError("No password edit controls found; see openpuff-unhide-controls.json")
    edits[0].set_edit_text("33011033")
    # The documented B/C toggles must be disabled. Use accessible names first;
    # if unnamed, the first two checkbox controls are the B/C toggles in panel order.
    checkboxes = main_window.descendants(control_type="CheckBox")
    named_toggles = []
    for control in checkboxes:
        name = (control.element_info.name or "").casefold()
        if "enable" in name or name in {"b", "c", "(b)", "(c)"}:
            named_toggles.append(control)
    targets = named_toggles if len(named_toggles) >= 2 else checkboxes[:2]
    if len(targets) < 2:
        raise RuntimeError("Could not identify Enable B / Enable C controls")
    for control in targets[:2]:
        try:
            if control.get_toggle_state() != 0:
                control.click_input()
        except Exception:
            control.click_input()

    add_button = find_named(main_window, "add carriers", "Button")
    if add_button is None:
        add_button = find_named(main_window, "add", "Button")
    if add_button is None:
        raise RuntimeError("Could not find Add Carriers button")
    add_button.click_input()
    handle_file_dialog(app, OUT / "decoded-interconnectedness.mp3")

    time.sleep(2)
    main_window = app.top_window()
    dump_controls(main_window, OUT / "openpuff-carrier-added-controls.json")
    trees = main_window.descendants(control_type="Tree")
    if not trees:
        raise RuntimeError("Could not find the bit-selection tree")
    tree = trees[0]
    tree_items = tree.descendants(control_type="TreeItem")
    item_names = [item.element_info.name for item in tree_items]
    REPORT["openpuff"]["bit_tree_items"] = item_names
    mp3_item = next((item for item in tree_items if "mp3" in (item.element_info.name or "").casefold()), None)
    if mp3_item is None:
        raise RuntimeError(f"MP3 bit-selection node not found; items={item_names}")
    try:
        mp3_item.expand()
    except Exception:
        pass
    time.sleep(1)
    tree_items = tree.descendants(control_type="TreeItem")
    maximum_item = next(
        (item for item in tree_items if "maximum" in (item.element_info.name or "").casefold() and ("1/2" in (item.element_info.name or "") or "50%" in (item.element_info.name or ""))),
        None,
    )
    if maximum_item is None:
        raise RuntimeError(f"MP3 Maximum 1/2 option not found; items={[i.element_info.name for i in tree_items]}")
    maximum_item.select()

    unhide_now = find_named(main_window, "unhide!", "Button")
    if unhide_now is None:
        unhide_now = find_named(main_window, "unhide", "Button")
    if unhide_now is None:
        raise RuntimeError("Could not find final Unhide! button")
    unhide_now.click_input()
    time.sleep(3)

    # Handle an optional output-directory or save-file dialog.
    for _ in range(30):
        handled = False
        for dialog in Desktop(backend="uia").windows():
            try:
                title = (dialog.window_text() or "").casefold()
                if dialog.handle == main_window.handle:
                    continue
                if any(token in title for token in ("browse for folder", "select folder", "save as")):
                    edits = dialog.descendants(control_type="Edit")
                    if edits:
                        edits[-1].set_edit_text(str(EXTRACT_DIR))
                    button = find_named(dialog, "ok", "Button") or find_named(dialog, "save", "Button")
                    if button:
                        button.click_input()
                        handled = True
                        break
            except Exception:
                continue
        if handled:
            time.sleep(2)
        time.sleep(1)

    # Wait for the app to finish and search its working/output folders.
    time.sleep(10)
    candidate_files = []
    for folder in (EXTRACT_DIR, app_dir):
        if folder.exists():
            for path in folder.rglob("*"):
                if path.is_file() and path.name not in {"OpenPuff.exe", "OpenPuffv400.zip"}:
                    try:
                        if path.stat().st_size > 0 and path not in {
                            OUT / "decoded-interconnectedness.mp3",
                            OUT / "cleartext.hex",
                        }:
                            candidate_files.append(path)
                    except OSError:
                        pass
    candidate_files = list(dict.fromkeys(candidate_files))
    REPORT["openpuff"]["output_directory"] = str(EXTRACT_DIR)
    REPORT["openpuff"]["candidate_outputs"] = [
        {"path": str(path), "bytes": path.stat().st_size} for path in candidate_files
    ]
    extracted = []
    for path in candidate_files:
        try:
            content = path.read_bytes()
            if numbers(content) == expected:
                extracted.append(path)
        except OSError:
            continue
    if not extracted:
        raise RuntimeError(
            "OpenPuff completed without a file matching the exact 99-number stream. "
            "Inspect openpuff-* controls, candidate_outputs and any dialogs in the artifact."
        )
    REPORT["openpuff"]["status"] = "PASS"
    REPORT["openpuff"]["extracted_file"] = str(extracted[0])
    REPORT["openpuff"]["extracted_bytes"] = extracted[0].stat().st_size
    REPORT["openpuff"]["extracted_sha256"] = hashlib.sha256(extracted[0].read_bytes()).hexdigest()
    REPORT["openpuff"]["exact_99_number_stream_match"] = True

    (OUT / "report.json").write_text(json.dumps(REPORT, indent=2), encoding="utf-8")
    print(json.dumps(REPORT, indent=2))
    print("STAGE7_REPRODUCTION_PASS")
    return 0


if __name__ == "__main__":
    try:
        exit_code = main(openpuff_only="--openpuff-only" in sys.argv[1:])
    except Exception as exc:
        REPORT["failure"] = str(exc)
        (OUT / "report.json").write_text(json.dumps(REPORT, indent=2), encoding="utf-8")
        print(f"STAGE7_REPRODUCTION_FAILURE: {exc}", file=sys.stderr)
        print(json.dumps(REPORT, indent=2), file=sys.stderr)
        raise
