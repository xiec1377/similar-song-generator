from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.song import Song  # ✅ import the actual model class, not the module
import shutil
import os

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/song/")
async def create_song(audioFile: UploadFile = File(...), db: Session = Depends(get_db)):
    print("Get file...", audioFile.filename)
    file_bytes = await audioFile.read()

    # Optionally, also save the file to disk
    file_path = os.path.join(UPLOAD_DIR, audioFile.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    db_song = Song(
        name=audioFile.filename,
        file_data=file_bytes,
    )

    db.add(db_song)
    db.commit()
    db.refresh(db_song)

    print("File saved to db:", db_song.name)
    return {
        "id": str(db_song.id),
        "name": db_song.name,
        "message": "File uploaded successfully",
    }
