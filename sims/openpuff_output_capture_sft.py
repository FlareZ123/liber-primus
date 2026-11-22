#!/usr/bin/env python3
"""Single-file offline control for OpenPuff output-capture and dialog handling.

The real OpenPuff v4.00 binary/cryptography is intentionally not simulated.
This test covers only the filename and UI-dialog logic in the Windows driver.
"""
import hashlib
import runpy
import sys
import tempfile
import types
import zlib
from pathlib import Path


class FakeControl:
    def __init__(self, kind, text=""):
        self.kind = kind
        self.label = text
        self.value = None
        self.clicked = False

    def class_name(self):
        return self.kind

    def is_enabled(self):
        return True

    def is_visible(self):
        return True

    def window_text(self):
        return self.label

    def set_edit_text(self, value):
        self.value = value

    def click_input(self):
        self.clicked = True


class FakeDialog:
    def __init__(self, title, button):
        self.title = title
        self.edit = FakeControl("Edit")
        self.button = FakeControl("Button", button)
        self.static = None
        self.tree = None
        self.sent_message = None
        self.written_folder = None

    def send_message(self, message, wparam=0, lparam=0):
        self.sent_message = (message, wparam, lparam)

    def is_visible(self):
        return True

    def window_text(self):
        return self.title

    def descendants(self):
        return ([self.edit] if self.edit is not None else []) + (
            [self.static] if self.static is not None else []
        ) + ([self.tree] if self.tree is not None else []) + [self.button]


class FakeApp:
    def __init__(self, dialog=None):
        self.dialog = dialog

    def windows(self):
        return [self.dialog] if self.dialog is not None else []


def load_driver():
    # Import without a GUI dependency: none of these tests launches OpenPuff.
    app = types.ModuleType("pywinauto.application")
    app.Application = object
    keyboard = types.ModuleType("pywinauto.keyboard")
    keyboard.send_keys = lambda value: None
    root = types.ModuleType("pywinauto")
    root.Desktop = object  # Stub the additional top-level symbol imported by the driver.
    root.application = app
    root.keyboard = keyboard
    # The native Win32 folder selector marshals a Unicode path into the
    # dialog process. Model only its observable API, with no GUI dependency.
    remote = types.ModuleType("pywinauto.remote_memory_block")

    class FakeRemoteMemoryBlock:
        def __init__(self, control, size=4096):
            assert size >= 2
            self.control = control

        def Write(self, buffer):
            self.control.written_folder = buffer.value

        def Address(self):
            return 0x1234

    remote.RemoteMemoryBlock = FakeRemoteMemoryBlock
    root.remote_memory_block = remote
    sys.modules["pywinauto"] = root
    sys.modules["pywinauto.remote_memory_block"] = remote
    sys.modules["pywinauto.application"] = app
    sys.modules["pywinauto.keyboard"] = keyboard
    filename = Path(__file__).with_name("openpuff_v400_extract.py")
    return runpy.run_path(str(filename), run_name="openpuff_test")


def main():
    driver = load_driver()
    # The real pinned MP3 run #43641015921 returned "1.088 bytes".
    # The legacy Windows GUI may render the same thousands value using comma.
    for label, expected in [
        ("0 bytes", 0), ("432 bytes", 432), ("1088 bytes", 1088),
        ("1.088 bytes ", 1088), ("1,088 bytes", 1088),
        ("10.088 bytes", 10088),
    ]:
        assert driver["parse_capacity"](label) == expected
    for label in ["1.08 bytes", "1..088 bytes", "1.088 Kbytes"]:
        try:
            driver["parse_capacity"](label)
            raise AssertionError(f"Invalid capacity accepted: {label!r}")
        except RuntimeError as error:
            assert "was not numeric" in str(error)
    print("PASS: native dot/comma thousand grouping, strict capacity validation")
    with tempfile.TemporaryDirectory(prefix="openpuff-capture-") as tmp:
        root = Path(tmp)
        output_dir = root / "extracted"
        output_dir.mkdir()
        target = output_dir / "synthetic-preferred.bin"

        folder = FakeDialog("Browse for Folder", "OK")
        assert driver["save_dialog_if_present"](FakeApp(folder), target, output_dir)
        assert folder.edit.value == str(output_dir.resolve())
        assert folder.button.clicked
        print("PASS: native folder picker receives directory, never a filename")

        save = FakeDialog("Save As", "Save")
        assert driver["save_dialog_if_present"](FakeApp(save), target, output_dir)
        assert save.edit.value == str(target.resolve())
        assert save.button.clicked
        print("PASS: file-save dialog receives full destination filename")

        legacy = FakeDialog("Browse for Folder", "OK")
        legacy.edit = None
        legacy.tree = FakeControl("SysTreeView32")
        assert driver["save_dialog_if_present"](FakeApp(legacy), target, output_dir)
        assert legacy.written_folder == str(output_dir.resolve())
        assert legacy.sent_message == (0x0400 + 103, 1, 0x1234)
        assert legacy.button.clicked
        print("PASS: native legacy folder picker receives marshalled directory path")

        # The original 14 Nov Windows run stopped because the OpenPuff
        # single-selected TreeView leaf has no checkbox state image. Lock
        # the exact selected-item operation without simulating cryptography.
        class BitLeaf:
            def __init__(self, tree, label):
                self.tree = tree
                self.label = label
                self.last_click = None

            def text(self):
                return self.label

            def ensure_visible(self):
                pass

            def select(self):
                self.tree.current = self

            def click_input(self, where):
                self.last_click = where

            def is_selected(self):
                return self.tree.current is self

            def is_checked(self):
                return False

            def state(self):
                return 2 if self.is_selected() else 0

        class BitRoot:
            def __init__(self, tree):
                self.tree = tree
                self.levels = [
                    BitLeaf(tree, "1/5 (20%) - Medium"),
                    BitLeaf(tree, "1/2 (50%) - Maximum"),
                ]
                self.expanded = False

            def text(self):
                return "Mp3 (Audio)"

            def expand(self):
                self.expanded = True

            def get_child(self, label, exact=False):
                assert exact
                return next(item for item in self.levels if item.text() == label)

            def children(self):
                return self.levels

        class BitTree:
            def __init__(self):
                self.current = None
                self.root = BitRoot(self)

            def roots(self):
                return [self.root]

        class BitWindow:
            def __init__(self):
                self.tree = BitTree()

            def child_window(self, control_id, class_name):
                assert (control_id, class_name) == (1049, "SysTreeView32")
                return self.tree

        bit_window = BitWindow()
        states = driver["select_bit_level"](
            bit_window, "Mp3 (Audio)", "1/2 (50%) - Maximum"
        )
        assert bit_window.tree.root.expanded
        assert bit_window.tree.current is bit_window.tree.root.levels[1]
        assert bit_window.tree.current.last_click == "text"
        assert [row["level"] for row in states if row["selected"]] == [
            "1/2 (50%) - Maximum"
        ]
        assert not any(row["checked"] for row in states)
        print("PASS: native single-selected TreeView bit level needs no checkbox state")

        # A hosted Windows control intermittently missed the native picker
        # at one fixed two-second observation. Exercise a delayed-window arrival.
        delayed = FakeDialog("Open", "Open")
        delayed.class_name = lambda: "#32770"
        ignored = FakeDialog("Data Unhiding", "Open")
        ignored.class_name = lambda: "#32770"

        class MockDesktop:
            calls = 0

            def __init__(self, backend):
                assert backend == "win32"

            def windows(self):
                type(self).calls += 1
                return [ignored] if type(self).calls < 3 else [delayed]

        picker_function = driver["wait_for_native_file_picker"]
        saved_desktop = picker_function.__globals__["Desktop"]
        try:
            picker_function.__globals__["Desktop"] = MockDesktop
            chosen, edits = picker_function("Data Unhiding", timeout_seconds=3)
            assert chosen is delayed
            assert edits == [delayed.edit]
            assert MockDesktop.calls == 3

            MockDesktop.calls = 0
            assert picker_function("Data Unhiding", timeout_seconds=0) is None
            assert MockDesktop.calls == 1
        finally:
            picker_function.__globals__["Desktop"] = saved_desktop
        print("PASS: delayed native picker is polled, unrelated parent excluded, timeout bounded")

        # The new source-selected LP2 complete-carrier-chain candidate
        # requires GUI proof of both count and exact published order.
        class ChainItem:
            def __init__(self, name):
                self.name = name

            def text(self):
                return self.name

        class ChainList:
            def __init__(self, names):
                self.names = names

            def class_name(self):
                return "SysListView32"

            def item_count(self):
                return len(self.names)

            def get_item(self, index):
                return ChainItem(self.names[index])

        class ChainWindow:
            def __init__(self, names):
                self.listview = ChainList(names)

            def descendants(self):
                return [self.listview]

        originals = [Path(f"{n:02d}.jpg") for n in range(17, 75)]
        assert driver["verify_carrier_chain"](
            ChainWindow([x.name for x in originals]), originals
        ) == [x.name for x in originals]
        for names in (
            [x.name for x in originals[:-1]],
            [x.name for x in reversed(originals)],
        ):
            try:
                driver["verify_carrier_chain"](ChainWindow(names), originals)
                raise AssertionError("Invalid OpenPuff chain accepted")
            except RuntimeError as error:
                assert "did not verify" in str(error)
        print("PASS: ordered 58-original-carrier native list accepts exact chain only")

        marked = [Path(f"{n:02d}.jpg") for n in range(50, 57)]
        assert driver["verify_carrier_chain"](
            ChainWindow([x.name for x in marked]), marked
        ) == [x.name for x in marked]
        for observed in (
            [x.name for x in marked[:-1]],
            [x.name for x in reversed(marked)],
        ):
            try:
                driver["verify_carrier_chain"](ChainWindow(observed), marked)
                raise AssertionError("Invalid seven-original carrier chain accepted")
            except RuntimeError as error:
                assert "did not verify" in str(error)
        print("PASS: seven cuneiform carriers verified by exact native list order")

        unsupported = FakeDialog("Browse for Folder", "OK")
        unsupported.edit = None
        try:
            driver["save_dialog_if_present"](FakeApp(unsupported), target, output_dir)
            raise AssertionError("A missing native chooser tree must fail explicitly")
        except RuntimeError as error:
            assert "no native shell TreeView" in str(error)
            print("PASS: absent native tree remains an explicit automation blocker")

        completed = FakeDialog("Task completed - Info", "OK")
        completed.edit = None
        completed.static = FakeControl("Static", "1/1 carrier processed")
        events = []
        driver["acknowledge_completed_task"](FakeApp(completed), events)
        assert completed.button.clicked
        assert events == [{
            "title": "Task completed - Info",
            "message": "1/1 carrier processed"
        }]
        print("PASS: historical task-completion modal acknowledged and recorded")

        failed = FakeDialog("Task failed - Info", "OK")
        failed.edit = None
        failed.static = FakeControl("Static", "0/1 carrier processed")
        driver["acknowledge_completed_task"](FakeApp(failed), events)
        assert not failed.button.clicked
        assert len(events) == 1
        print("PASS: noncompletion modal is preserved without spurious clicks")

        interrupted = FakeDialog("Task interrupted - Error", "OK")
        interrupted.edit = None
        interrupted.static = FakeControl(
            "Static",
            "Task stopped: corrupted stream\\r\\nStep (1): wrong password?"
        )
        errors = []
        assert driver["acknowledge_corrupted_stream_task"](
            FakeApp(interrupted), errors
        )
        assert interrupted.button.clicked
        assert errors == [{
            "title": "Task interrupted - Error",
            "message": "Task stopped: corrupted stream\\r\\nStep (1): wrong password?"
        }]
        assert not driver["acknowledge_corrupted_stream_task"](
            FakeApp(failed), errors
        )
        assert len(errors) == 1
        print("PASS: native corrupted-stream modal acknowledged as distinct terminal event")

        second_error = FakeDialog("Task interrupted - Error", "OK")
        second_error.edit = None
        second_error.static = FakeControl(
            "Static", "Task stopped: corrupted stream"
        )
        waiting_errors = []
        assert not driver["wait_for_extraction"](
            FakeApp(second_error), target, output_dir, 2,
            error_events=waiting_errors
        )
        assert second_error.button.clicked
        assert len(waiting_errors) == 1
        print("PASS: native rejection exits the wait loop before a timeout")

        unknown = output_dir / "historical-embedded-name.txt"
        payload = b"Source-native payload name must survive extraction.\n"
        unknown.write_bytes(payload)
        names = driver["extracted_files"](output_dir)
        assert names == [unknown]
        facts = driver["file_facts"](names[0])
        assert facts["size"] == len(payload)
        assert facts["sha256"] == hashlib.sha256(payload).hexdigest()
        assert facts["crc32"] == f"{zlib.crc32(payload) & 0xffffffff:08X}"
        assert facts["openpuff_crc32"] == driver["openpuff_crc32"](payload)
        print(f"PASS: arbitrary embedded name retained, size={facts['size']}, crc32={facts['crc32']}")

        historical = Path(__file__).resolve().parent.parent / "resources" / "cicada2014-openpuff-magic-squares.txt"
        historical_facts = driver["file_facts"](historical)
        assert historical_facts["size"] == 745
        assert historical_facts["crc32"] == "5E547914"
        assert historical_facts["openpuff_crc32"] == "6A8C41E3"
        print("PASS: historically authentic OpenPuff 745-byte CRC32 6A8C41E3 verified")

        unverified = driver["classify_outputs"]([unknown])
        assert unverified["output_present"] is True
        assert unverified["expected_match"] is None
        assert unverified["output"]["path"] == str(unknown)
        print("PASS: unknown LP2 output remains an unauthenticated candidate")

        known = driver["classify_outputs"](
            [unknown], expected_crc32=facts["openpuff_crc32"], expected_size=len(payload)
        )
        assert known["expected_match"] is True
        mismatched = driver["classify_outputs"](
            [unknown], expected_crc32=facts["openpuff_crc32"], expected_size=len(payload) + 1
        )
        assert mismatched["expected_match"] is False
        print("PASS: native OpenPuff CRC32 and byte length must both match a supplied control")

        assert not driver["wait_for_extraction"](FakeApp(), target, output_dir, 5)
        assert driver["extracted_files"](output_dir) == [unknown]
        print("PASS: extraction wait accepts stable file despite unknown embedded name")
    print("SFT PASS: all source-output capture tests passed; original OpenPuff GUI remains untested")


if __name__ == "__main__":
    main()
