import os

from fastapi import FastAPI, File, UploadFile
from utils.pdf_to_base64_images import pdf_to_base64_images

app = FastAPI()


@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}


@app.post("/api/v1/encode")
async def encode(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Invalid file format. Please upload a PDF file."}

    file_bytes = await file.read()
    base64_images = await pdf_to_base64_images(file_bytes)

    return {"images": base64_images}
