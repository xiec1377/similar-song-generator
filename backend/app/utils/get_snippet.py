from pydub import AudioSegment
import io
import base64


# def get_snippet(file_path, duration_ms=10000):  # first 10s
#     audio = AudioSegment.from_file(file_path, format="mp3")
#     snippet = audio[:duration_ms]

#     buffer = io.BytesIO()
#     snippet.export(buffer, format="mp3")
#     return base64.b64encode(buffer.getvalue()).decode("utf-8")


def get_snippet(file_data: bytes, duration_ms: int = 10000) -> str:
    if not file_data:
        return ""
    try:
        audio = AudioSegment.from_file(io.BytesIO(file_data), format="mp3")
        snippet = audio[:duration_ms]
        buffer = io.BytesIO()
        snippet.export(buffer, format="mp3")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception as e:
        print("Error generating audio snippet...")
        return ""
