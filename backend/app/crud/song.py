import base64
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.song import Song  # ✅ import the actual model class, not the module
import shutil
import os
from app.utils.get_snippet import get_snippet

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
                "file_data": get_snippet(
                    song.file_data, duration_ms=10000
                ),  # base64.b64encode(song.file_data).decode("utf-8"),
                "created_at": song.created_at.isoformat(),
                "updated_at": song.updated_at.isoformat(),
            }
        )

    print("songs from db:", result)
    return result


# create new song, add it to song list
@router.post("/song/")
async def create_song(audioFile: UploadFile = File(...), db: Session = Depends(get_db)):
    print("Get file...", audioFile.filename)
    file_bytes = await audioFile.read()

    # save file to directory
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


# get one song
@router.get("/song/{song_id}")
async def get_song(song_id: str, db: Session = Depends(get_db)):
    print("Getting one song...")
    db_song = db.query(Song).filter(Song.id == song_id).first()
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")

    result = {
        "id": str(db_song.id),
        "title": db_song.title,
        "file_data": base64.b64encode(db_song.file_data).decode("utf-8"),
        # "created_at": db_song.created_at.isoformat(),
        # "updated_at": db_song.updated_at.isoformat(),
    }
    print("song from db:", result)
    return result


# delete song from song list
@router.delete("/song/{song_id}")
async def delete_song(song_id: str, db: Session = Depends(get_db)):
    print("Deleting song...", song_id)
    db_song = db.query(Song).filter(Song.id == song_id).first()
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")

    db.delete(db_song)
    db.commit()

    print("deleted song:", db_song.title)
    return {
        "id": str(db_song.id),
        "title": db_song.title,
        "message": "Song deleted successfully",
    }
