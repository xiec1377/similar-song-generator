from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class SongBase(BaseModel):
    title: str
    artist: str | None
    album: str | None = None


class Song(SongBase):
    id: int | str | None
    title: str

    class Config:
        orm_mode = True
