from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.crud import song
from app.db.database import Base, engine

app = FastAPI()

Base.metadata.create_all(bind=engine)  # don't use when using alembic migrations
app.include_router(song.router)


# Configure CORS
origins = [
    "http://localhost:5173",
    # "https://your-frontend-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "🚀 FastAPI is running!"}
