from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import services
import uuid

app = FastAPI(title="ClinRAG Backend Prototype")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.get("/")
async def root():
    return {"message": "ClinRAG Backend is running"}

@app.post("/api/upload")
async def upload_document(
    text: str = Form(...), 
    title: str = Form(...), 
    journal: str = Form("General Medical Journal")
):
    """
    Endpoint to index a piece of medical text.
    In a full version, this would handle PDF parsing.
    """
    try:
        doc_id = str(uuid.uuid4())
        metadata = {
            "text": text,
            "title": title,
            "journal": journal
        }
        services.index_document(doc_id, text, metadata)
        return {"status": "success", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_clinrag(request: QueryRequest):
    """
    Endpoint for the AI Chat. 
    Uses Gemini + Pinecone to provide evidence-based answers.
    """
    try:
        result = services.query_rag(request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
