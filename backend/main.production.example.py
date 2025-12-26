import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.upload import router as upload_router
from api.files import router as files_router
from api.companies import router as companies_router

app = FastAPI(title="Form Yönetim Sistemi", version="1.0.0")

# ============================================
# CORS Yapılandırması - Production Ready
# ============================================
# Environment variable'dan allowed origins listesi al
# Development: http://localhost:5173,http://localhost:3000
# Production: https://your-app.vercel.app
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Dinamik origins listesi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Router'ları Ekle
# ============================================
app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(files_router, prefix="/api", tags=["files"])
app.include_router(companies_router, prefix="/api", tags=["companies"])

# ============================================
# Health Check Endpoints
# ============================================
@app.get("/")
async def root():
    return {
        "message": "Form Yönetim Sistemi API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "environment": os.getenv("RENDER", "local")
    }

# ============================================
# Server Başlatma (Local Development)
# ============================================
if __name__ == "__main__":
    import uvicorn
    # Render.com otomatik PORT atar, yoksa 8000 kullan
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Tüm network interfaces'den erişim
        port=port,
        reload=True  # Development için auto-reload
    )
