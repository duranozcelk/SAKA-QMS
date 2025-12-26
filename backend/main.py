from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.upload import router as upload_router
from api.files import router as files_router
from api.companies import router as companies_router

app = FastAPI(title="Form Yönetim Sistemi", version="1.0.0")

# CORS yapılandırması - frontend'den gelen isteklere izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ekle
app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(files_router, prefix="/api", tags=["files"])
app.include_router(companies_router, prefix="/api", tags=["companies"])

@app.get("/")
async def root():
    return {"message": "Form Yönetim Sistemi API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
