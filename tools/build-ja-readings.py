#!/usr/bin/env python3
"""Build site/data/ja-readings.json: hiragana readings of each word's Japanese meaning.

Used only by the in-app dictionary so that a hiragana query (たべる) finds 食べる.
Not shown on screen. Regenerate after adding or editing words:

    pip install pykakasi
    python3 tools/build-ja-readings.py
"""
import json
import pathlib
import re

import pykakasi

ROOT = pathlib.Path(__file__).resolve().parent.parent
WORDS = ROOT / "site/data/words.json"
OUT = ROOT / "site/data/ja-readings.json"

# Everyday readings that pykakasi gets wrong or reads in the uncommon way.
IRREGULAR = {
    "明後日": "あさって", "明日": "あした", "今日": "きょう", "昨日": "きのう", "一昨日": "おととい",
    "今朝": "けさ", "今年": "ことし", "大人": "おとな", "一人": "ひとり", "二人": "ふたり",
    "眼鏡": "めがね", "果物": "くだもの", "上手": "じょうず", "下手": "へた", "部屋": "へや",
    "時計": "とけい", "景色": "けしき", "風邪": "かぜ", "土産": "みやげ", "お土産": "おみやげ",
    "博士": "はかせ", "開ける": "あける", "瓶": "びん", "年を": "としを", "年上": "としうえ", "年下": "としした",
    "生まれる": "うまれる", "上がる": "あがる", "下がる": "さがる", "下りる": "おりる", "入る": "はいる", "迷子": "まいご", "真面目": "まじめ", "素人": "しろうと", "玄人": "くろうと",
}

kks = pykakasi.kakasi()


def reading(text: str) -> str:
    text = re.sub(r"（[^）]*）|\([^)]*\)", "", text)
    for k, v in sorted(IRREGULAR.items(), key=lambda kv: -len(kv[0])):
        text = text.replace(k, v)
    return "".join(part["hira"] for part in kks.convert(text))


def main() -> None:
    words = json.loads(WORDS.read_text(encoding="utf-8"))
    out = {}
    for w in words:
        r = reading(w["ja"])
        if r and r != w["ja"]:
            out[w["id"]] = r
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(out)} readings -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
