import json, sys

html = open("last_page.html", encoding="utf-8", errors="ignore").read()

marker = "window.__initialData__="
idx = html.find(marker)
if idx == -1:
    print("marker not found")
    sys.exit(1)

start = idx + len(marker)
i = start
assert html[i] == "{"
depth = 0
in_str = False
str_char = ""
escape = False
end = None
while i < len(html):
    c = html[i]
    if in_str:
        if escape:
            escape = False
        elif c == "\\":
            escape = True
        elif c == str_char:
            in_str = False
    else:
        if c == '"' or c == "'":
            in_str = True
            str_char = c
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    i += 1

raw = html[start:end]
print("Extracted length:", len(raw))
data = json.loads(raw)
print("Top-level keys:", list(data.keys()))
with open("initialdata.json", "w") as f:
    json.dump(data, f, indent=2)
print("Saved to initialdata.json")
