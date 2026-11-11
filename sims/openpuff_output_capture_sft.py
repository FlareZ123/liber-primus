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

    def is_visible(self):
        return True

    def window_text(self):
        return self.title

    def descendants(self):
        return ([self.edit] if self.edit is not None else []) + (
            [self.static] if self.static is not None else []
        ) + [self.button]


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
    root.application = app
    root.keyboard = keyboard
    sys.modules["pywinauto"] = root
    sys.modules["pywinauto.application"] = app
    sys.modules["pywinauto.keyboard"] = keyboard
    filename = Path(__file__).with_name("openpuff_v400_extract.py")
    return runpy.run_path(str(filename), run_name="openpuff_test")


def main():
    driver = load_driver()
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
        try:
            driver["save_dialog_if_present"](FakeApp(legacy), target, output_dir)
            raise AssertionError("A path-less native chooser must fail explicitly")
        except RuntimeError as error:
            assert "not a negative steganographic test" in str(error)
            print("PASS: unsupported legacy folder picker reports an automation blocker")

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

        unknown = output_dir / "historical-embedded-name.txt"
        payload = b"Source-native payload name must survive extraction.\n"
        unknown.write_bytes(payload)
        names = driver["extracted_files"](output_dir)
        assert names == [unknown]
        facts = driver["file_facts"](names[0])
        assert facts["size"] == len(payload)
        assert facts["sha256"] == hashlib.sha256(payload).hexdigest()
        assert facts["crc32"] == f"{zlib.crc32(payload) & 0xffffffff:08X}"
        print(f"PASS: arbitrary embedded name retained, size={facts['size']}, crc32={facts['crc32']}")

        assert not driver["wait_for_extraction"](FakeApp(), target, output_dir, 5)
        assert driver["extracted_files"](output_dir) == [unknown]
        print("PASS: extraction wait accepts stable file despite unknown embedded name")
    print("SFT PASS: all source-output capture tests passed; original OpenPuff GUI remains untested")


if __name__ == "__main__":
    main()
