import sys
from faster_whisper import WhisperModel


model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)


audio_file = sys.argv[1]


segments, info = model.transcribe(
    audio_file
)

segments = list(segments)
duration = 0
if segments:
    duration = segments[-1].end

import json
text = ""

for segment in segments:
    text += segment.text
result = {
    "language": info.language,
    "transcript": text.strip()
}

print(json.dumps(result))