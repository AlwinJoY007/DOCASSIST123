import os
import google.generativeai as genai
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Configure Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

def get_gemini_embeddings(text: str):
    """Generates embeddings for the given text using Google Gemini."""
    model = 'models/text-embedding-004' # Optimized for RAG
    result = genai.embed_content(
        model=model,
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']

def index_document(doc_id: str, text: str, metadata: dict):
    """Indexes a document segment into Pinecone after generating embeddings."""
    index_name = os.getenv("PINECONE_INDEX_NAME", "clinrag-index")
    
    # Check if index exists, if not create it (Simplified for prototype)
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=768, # Gemini text-embedding-004 dimension
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws', 
                region='us-east-1'
            )
        )
    
    index = pc.Index(index_name)
    vector = get_gemini_embeddings(text)
    
    index.upsert(vectors=[(doc_id, vector, metadata)])
    return True

def query_rag(query_text: str):
    """Performs RAG: Query -> Embeddings -> Pinecone -> Gemini Answer."""
    index_name = os.getenv("PINECONE_INDEX_NAME", "clinrag-index")
    index = pc.Index(index_name)
    
    # 1. Get embedding for the query
    query_vector = genai.embed_content(
        model='models/text-embedding-004',
        content=query_text,
        task_type="retrieval_query"
    )['embedding']
    
    # 2. Search Pinecone
    results = index.query(
        vector=query_vector,
        top_k=3,
        include_metadata=True
    )
    
    # 3. Construct Context
    context_texts = [match['metadata']['text'] for match in results['matches']]
    context = "\n\n---\n\n".join(context_texts)
    
    # 4. Generate Answer with Gemini
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
    You are ClinRAG, an AI Research Assistant for Doctors. 
    Use the following retrieved clinical research context to answer the doctor's question.
    If the context doesn't contain the answer, state that you don't have enough evidence but provide general clinical knowledge based on the topic.
    Always cite your sources if provided in the context.

    CONTEXT:
    {context}

    QUESTION:
    {query_text}

    ANSWER:
    """
    
    response = model.generate_content(prompt)
    
    return {
        "answer": response.text,
        "sources": [match['metadata'] for match in results['matches']]
    }
