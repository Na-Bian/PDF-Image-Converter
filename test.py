from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from converter import avoid_overwrite, build_filename, parse_page_ranges, safe_filename


class CoreTests(unittest.TestCase):
    def test_parse_page_ranges(self) -> None:
        self.assertEqual(parse_page_ranges("1,3,5-7", 10), {1, 3, 5, 6, 7})
        self.assertEqual(parse_page_ranges("", 3), {1, 2, 3})
        with self.assertRaises(ValueError):
            parse_page_ranges("0", 3)
        with self.assertRaises(ValueError):
            parse_page_ranges("4", 3)
        with self.assertRaises(ValueError):
            parse_page_ranges("5-2", 10)

    def test_safe_filename(self) -> None:
        self.assertEqual(safe_filename("a/b:c"), "a_b_c")
        self.assertEqual(safe_filename(""), "page")

    def test_build_filename(self) -> None:
        class Item:
            stem = "demo"

        self.assertEqual(build_filename("{pdf_stem}_{page}_{global}", Item(), 2, 3, 9), "demo_3_9")

    def test_avoid_overwrite(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "1.png"
            path.write_text("x")
            self.assertEqual(avoid_overwrite(path).name, "1_2.png")


if __name__ == "__main__":
    unittest.main()
