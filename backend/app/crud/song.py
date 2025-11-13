import base64
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.song import Song  # ✅ import the actual model class, not the module
import shutil
import os

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/songs/")
async def get_all_songs(db: Session = Depends(get_db)):
    print("Getting all songs...")
    songs = db.query(Song).all()
    result = []
    for song in songs:
        result.append(
            {
                "id": str(song.id),
                "title": song.title,
                "file_data": base64.b64encode(song.file_data).decode("utf-8"),
                "created_at": song.created_at.isoformat(),
                "updated_at": song.updated_at.isoformat(),
            }
        )

    print("songs from db:", result)
    return result


@router.post("/song/")
async def create_song(audioFile: UploadFile = File(...), db: Session = Depends(get_db)):
    print("Get file...", audioFile.filename)
    file_bytes = await audioFile.read()

    # Optionally, also save the file to disk
    file_path = os.path.join(UPLOAD_DIR, audioFile.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    db_song = Song(
        title=audioFile.filename,
        file_data=file_bytes,
    )

    db.add(db_song)
    db.commit()
    db.refresh(db_song)

    print("File saved to db:", db_song.title)
    return {
        "id": str(db_song.id),
        "title": db_song.title,
        "message": "File uploaded successfully",
    }
