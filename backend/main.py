# backend/main.py
# Core Imports and App Initialization
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# LangGraph State Schema
from typing_extensions import TypedDict, Annotated
from langgraph.graph.message import add_messages
import json
import os

# LangChain and Groq imports
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langgraph.graph import StateGraph
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

# --- NEW: Import from database.py ---
from sqlalchemy.orm import Session # For type hinting the db session
from .database import create_db_and_tables, get_db, Interaction # Import your DB utilities and Model
from sqlalchemy import select # For querying data

app = FastAPI(title="PharmaGPT API")

# Configure CORS for FastAPI app.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq LLM
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY environment variable not set. "
        "Please set it to your Groq API key before running the application."
        "\n\nExample (Linux/macOS): export GROQ_API_KEY='your_api_key_here'"
        "\nExample (Windows CMD): set GROQ_API_KEY='your_api_key_here'"
        "\nExample (Windows PowerShell): $env:GROQ_API_KEY='your_api_key_here'"
    )

llm_extraction = ChatGroq(model="gemma2-9b-it", temperature=0, groq_api_key=GROQ_API_KEY)

# Pydantic Models for API Input/Output and LLM Extraction
class ExtractedInteractionData(BaseModel):
    hcpName: Optional[str] = Field(None, description="Name of the Healthcare Professional (HCP)")
    interactionType: Optional[str] = Field(None, description="Type of interaction (e.g., Meeting, Call, Email)")
    date: Optional[str] = Field(None, description="Date of the interaction in YYYY-MM-DD format")
    time: Optional[str] = Field(None, description="Time of the interaction in HH:MM format (24-hour format)")
    productsDiscussed: Optional[List[str]] = Field(None, description="List of pharmaceutical products discussed")
    topicsDiscussed: Optional[str] = Field(None, description="Summary of key topics discussed during the interaction")
    materialsShared: Optional[List[Dict[str, str]]] = Field(None, description="List of materials explicitly mentioned as shared, each with 'id' and 'name' fields.")
    hcpSentiment: Optional[str] = Field(None, description="HCP's overall sentiment towards the discussion (e.g., Positive, Negative, Neutral)")
    followUpActions: Optional[str] = Field(None, description="Specific follow-up actions required after the interaction")

class InteractionInput(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = None

class InteractionResponse(BaseModel):
    message: str
    extracted_data: Dict[str, Any]
    suggested_followups: List[str]

# LangGraph State Schema
class GraphState(TypedDict):
    input: str
    context: Dict[str, Any]
    extracted_data: Dict[str, Any]
    suggested_followups: List[str]
    history_summary: str
    suggested_resources: List[str]

# --- Mock Databases for Demo Purposes (can be replaced by DB later if needed) ---
hcp_database = {
    "Dr. Patel": {"specialty": "Oncology", "preferences": "Prefers morning meetings"},
    "Dr. Smith": {"specialty": "Cardiology", "preferences": "Likes clinical data"},
    "Dr. Johnson": {"specialty": "Neurology", "preferences": "Interested in new trials"}
}

materials_database = {
    "OncoBoost": ["Phase III trial results", "Patient selection guide", "Dosing information"],
    "CardioPlus": ["Efficacy data", "Comparison chart", "Safety profile"],
    "NeuroCalm": ["Clinical outcomes", "Patient case studies", "Administration guide"]
}

# LLM Chain for Log Interaction (Groq-Powered)
log_interaction_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert AI assistant for pharmaceutical sales representatives. Your task is to extract all relevant details from the provided natural language description of an HCP interaction.

    Extract the following fields accurately and precisely. If a piece of information is not explicitly mentioned or clearly inferable, omit that field (do not include it in the JSON) or set its value to null.

    Ensure the output is a valid JSON object matching the following Pydantic schema:
    {json_schema}

    Here are some specific guidelines:
    - 'hcpName': Full name of the Healthcare Professional.
    - 'interactionType': Examples: 'Meeting', 'Call', 'Email', 'Virtual Meeting'.
    - 'date': Extract the exact date in YYYY-MM-DD format. If only a day of the week is given (e.g., 'yesterday', 'Monday'), try to infer the date relative to today's date if possible, otherwise omit.
    - 'time': Extract the exact time in HH:MM (24-hour) format. If 'AM'/'PM' is used, convert it.
    - 'productsDiscussed': A list of specific pharmaceutical product names mentioned.
    - 'topicsDiscussed': A concise summary of the key subjects or themes covered during the interaction.
    - 'materialsShared': A list of materials explicitly mentioned as being shared. Each item should have an 'id' (which can be the material name or a placeholder if no ID is clear) and 'name' (the material's title). For example: [{{ "id": "Clinical Data", "name": "ProductX Clinical Study Results" }}]
    - 'hcpSentiment': Assess the overall sentiment of the HCP towards the discussion. Choose from 'Positive', 'Negative', or 'Neutral'.
    - 'followUpActions': Clearly state any specific actions the sales rep needs to take as a direct result of this interaction.

    Example of expected JSON for a simple interaction:
    {{
        "hcpName": "Dr. Sarah Lee",
        "interactionType": "Meeting",
        "date": "2024-05-20",
        "time": "14:00",
        "productsDiscussed": ["ProductX"],
        "topicsDiscussed": "Discussed new clinical data for ProductX and its side effect profile.",
        "materialsShared": [{{ "id": "Clinical Data", "name": "ProductX Clinical Study Results" }}],
        "hcpSentiment": "Positive",
        "followUpActions": "Send follow-up email with detailed safety profile."
    }}
    """),
    ("human", "Interaction description: {interaction_text}")
])

llm_extraction_chain = (
    log_interaction_prompt.partial(json_schema=ExtractedInteractionData.schema_json())
    | llm_extraction
    | JsonOutputParser(pydantic_object=ExtractedInteractionData)
)

# --- LangGraph Tool Functions (Modified to accept config for DB session) ---
# Each tool now expects `config` to access the database session.

async def log_interaction_tool(state: GraphState, config: dict) -> Dict[str, Any]:
    """Extract interaction details from natural language input using an LLM (Groq) and save to DB."""
    db: Session = config["configurable"]["db_session"] # Get session from config
    input_text = state["input"]

    try:
        print(f"Calling Groq LLM with input: {input_text[:100]}...")
        extracted_data_llm = llm_extraction_chain.invoke({"interaction_text": input_text})
        
        # Convert Pydantic model to dictionary, excluding unset fields
        extracted_data = extracted_data_llm.dict(exclude_unset=True)

        # Mock logic for materials suggestion (can be replaced with DB later)
        if "productsDiscussed" in extracted_data and not extracted_data.get("materialsShared"):
            materials_shared = []
            for product in extracted_data["productsDiscussed"]:
                if product in materials_database:
                    if materials_database[product]:
                        # Taking the first material as a default example
                        materials_shared.append({"id": product, "name": materials_database[product][0]})
            if materials_shared:
                extracted_data["materialsShared"] = materials_shared
        
        # --- NEW: Save extracted data to SQLite ---
        new_interaction = Interaction(
            hcp_name=extracted_data.get("hcpName"),
            interaction_type=extracted_data.get("interactionType"),
            interaction_date=extracted_data.get("date"),
            interaction_time=extracted_data.get("time"),
            products_discussed=extracted_data.get("productsDiscussed"), # SQLite can store JSON
            topics_discussed=extracted_data.get("topicsDiscussed"),
            materials_shared=extracted_data.get("materialsShared"), # SQLite can store JSON
            hcp_sentiment=extracted_data.get("hcpSentiment"),
            follow_up_actions=extracted_data.get("followUpActions")
        )
        db.add(new_interaction)
        db.commit() # Commit the transaction
        db.refresh(new_interaction) # Refresh to get ID and other defaults
        print(f"Interaction logged to DB with ID: {new_interaction.id}")

        return {"extracted_data": extracted_data}

    except Exception as e:
        db.rollback() # Rollback on error
        print(f"Error during Groq LLM extraction or DB save in log_interaction_tool: {e}")
        raise # Re-raise to propagate the error

async def edit_interaction_tool(state: GraphState, config: dict) -> Dict[str, Any]:
    """Update only specific fields in the interaction form (in the current extracted_data).
    To edit a specific DB record, you would need an ID passed in the context."""
    db: Session = config["configurable"]["db_session"] # Get session from config
    input_text = state["input"]
    context = state.get("context", {})
    extracted_data = state.get("extracted_data", {}) # This is the current in-memory data from the previous step

    # This logic is still operating on the *current* extracted_data in the agent's state.
    # To edit a *database record*, you would need to:
    # 1. Have an `interaction_id` in the `context` or `state`.
    # 2. Query the database for that specific interaction using `db.query(Interaction).filter_by(id=interaction_id).first()`.
    # 3. Update its attributes: `db_interaction.hcp_sentiment = "Positive"`.
    # 4. `db.commit()` and `db.refresh()`.

    # For now, keeping the in-memory edit behavior for simplicity, as editing a specific record
    # implies more complex UI/agent flow to identify *which* record to edit.
    if context.get("is_edit", False):
        # Example: if the user explicitly says "change sentiment to positive" for the *current* interaction
        if "sentiment" in input_text.lower():
            if "positive" in input_text.lower():
                extracted_data["hcpSentiment"] = "Positive"
            elif "negative" in input_text.lower():
                extracted_data["hcpSentiment"] = "Negative"
            elif "neutral" in input_text.lower():
                extracted_data["hcpSentiment"] = "Neutral"
        
        if "date" in input_text.lower():
            if "april 20" in input_text.lower():
                extracted_data["date"] = "2025-04-20"
            elif "april 21" in input_text.lower():
                extracted_data["date"] = "2025-04-21"
        
    return {"extracted_data": extracted_data}

async def suggest_followup_tool(state: GraphState, config: dict) -> Dict[str, Any]:
    """Generate follow-up suggestions based on the interaction context."""
    # This tool still uses mock HCP data; you could integrate a separate HCP table if needed.
    extracted_data = state.get("extracted_data", {})

    followups = []
    hcp_name = extracted_data.get("hcpName", "")
    topics = extracted_data.get("topicsDiscussed", "").lower() if extracted_data.get("topicsDiscussed") else ""
    sentiment = extracted_data.get("hcpSentiment", "")

    if hcp_name in hcp_database: # Uses mock hcp_database
        specialty = hcp_database[hcp_name]["specialty"]
        preferences = hcp_database[hcp_name]["preferences"]
        
        followups.append(f"Schedule next meeting according to {hcp_name}'s preference: {preferences}")
        
        if specialty == "Oncology" and "oncoboost" in topics:
            followups.append("Share the latest patient outcomes data for OncoBoost in similar cancer types")
        elif specialty == "Cardiology" and "cardio" in topics:
            followups.append("Provide comparative efficacy data for CardioPlus vs. standard of care")
        elif specialty == "Neurology" and "neuro" in topics:
            followups.append("Follow up with new clinical trial enrollment information")
    
    if sentiment == "Positive":
        followups.append("Send thank you email with additional resources discussed")
        followups.append("Invite to upcoming product symposium")
    elif sentiment == "Negative":
        followups.append("Schedule call to address concerns")
        followups.append("Share additional safety data to address hesitations")
    else:
        followups.append("Share additional clinical data that may help with decision making")
        followups.append("Schedule follow-up call in 2 weeks to continue the discussion")
    
    while len(followups) < 2:
        followups.append("Schedule routine follow-up in 4-6 weeks")
    
    return {"suggested_followups": followups[:3]}

async def summarize_history_tool(state: GraphState, config: dict) -> Dict[str, Any]:
    """Summarize previous interactions with this HCP (from DB)."""
    db: Session = config["configurable"]["db_session"] # Get session from config
    hcp_name = state.get("extracted_data", {}).get("hcpName")
    
    if hcp_name:
        # Query interactions for this HCP from SQLite
        # Using .scalars().all() for SQLAlchemy 2.0 style `select`
        interactions_query = db.execute(
            select(Interaction)
            .filter_by(hcp_name=hcp_name)
            .order_by(Interaction.created_at.desc())
            .limit(5) # Get last 5 interactions
        )
        past_interactions = interactions_query.scalars().all()

        if past_interactions:
            history_summary_parts = []
            for i, interaction in enumerate(past_interactions):
                history_summary_parts.append(
                    f"Interaction {i+1} on {interaction.interaction_date}: Discussed '{interaction.topics_discussed or 'N/A'}'. Sentiment: {interaction.hcp_sentiment or 'N/A'}."
                )
            return {"history_summary": "Previous Interactions:\n" + "\n".join(history_summary_parts)}
        else:
            return {"history_summary": "No previous interaction history available for this HCP in the database."}
    else:
        return {"history_summary": "No HCP name provided to summarize history."}

async def suggest_resources_tool(state: GraphState, config: dict) -> Dict[str, Any]:
    """Suggest relevant resources based on the interaction topics (using mock data)."""
    # This tool still uses mock materials data; you could integrate a separate materials table if needed.
    extracted_data = state.get("extracted_data", {})
    topics = extracted_data.get("topicsDiscussed", "").lower() if extracted_data.get("topicsDiscussed") else ""
    products_discussed = extracted_data.get("productsDiscussed", [])
    
    suggested_resources = []
    
    for product in products_discussed:
        if product in materials_database: # Uses mock materials_database
            suggested_resources.extend(materials_database[product])

    if not suggested_resources:
        if "oncoboost" in topics:
            suggested_resources.extend(materials_database.get("OncoBoost", []))
        elif "cardio" in topics:
            suggested_resources.extend(materials_database.get("CardioPlus", []))
        elif "neuro" in topics:
            suggested_resources.extend(materials_database.get("NeuroCalm", []))
    
    if not suggested_resources:
        suggested_resources = [
            "Company overview brochure",
            "Product catalog",
            "Recent publications list"
        ]
    
    return {"suggested_resources": list(set(suggested_resources))[:3]}

# --- Create the LangGraph Agent ---
# The tool functions are now designed to accept a `config` dictionary.
# This config will carry the database session.
def create_interaction_agent():
    workflow = StateGraph(GraphState) 
    
    # Pass the tool functions directly; they will expect `state` and `config`
    workflow.add_node("log_interaction", log_interaction_tool)
    workflow.add_node("edit_interaction", edit_interaction_tool)
    workflow.add_node("suggest_followup", suggest_followup_tool)
    workflow.add_node("summarize_history", summarize_history_tool)
    workflow.add_node("suggest_resources", suggest_resources_tool)
    
    workflow.add_edge("log_interaction", "edit_interaction")
    workflow.add_edge("edit_interaction", "suggest_followup")
    workflow.add_edge("suggest_followup", "summarize_history")
    workflow.add_edge("summarize_history", "suggest_resources")
    
    workflow.set_entry_point("log_interaction")
    
    return workflow.compile()

# Initialize the LangGraph agent when the app starts
interaction_agent = create_interaction_agent()

# --- API Endpoints ---
# Add a startup event to create database tables
@app.on_event("startup")
def on_startup(): # Changed to synchronous for SQLite
    print("Creating SQLite database tables if they don't exist...")
    create_db_and_tables()
    print("SQLite database tables created/checked.")


@app.post("/api/interactions/process", response_model=InteractionResponse)
async def process_interaction(input_data: InteractionInput, db: Session = Depends(get_db)): # Inject synchronous DB session
    try:
        initial_state: GraphState = {
            "input": input_data.text,
            "context": input_data.context or {},
            "extracted_data": {}, 
            "suggested_followups": [],
            "history_summary": "",
            "suggested_resources": []
        }
        
        # Invoke the LangGraph agent, passing the synchronous database session via config
        # FastAPI will handle running this synchronous `db` operation in a thread pool.
        result = await interaction_agent.ainvoke( # Use ainvoke for async graph
            initial_state,
            config={"configurable": {"db_session": db}} # Pass db session here
        )
        
        # Extract the final data from the agent's state
        extracted_data = result.get("extracted_data", {})
        suggested_followups = result.get("suggested_followups", [])
        history_summary = result.get("history_summary", "")
        suggested_resources = result.get("suggested_resources", [])
        
        # Construct a user-friendly response message
        hcp_name = extracted_data.get("hcpName", "the HCP")
        response_message = f"I've processed your interaction with {hcp_name}."
        
        if history_summary and history_summary != "No previous interaction history available for this HCP in the database." and history_summary != "No HCP name provided to summarize history.":
            response_message += f" {history_summary}"
        
        if suggested_resources:
            response_message += f" Based on your discussion, you might want to share: {', '.join(suggested_resources[:2])}."
        
        return InteractionResponse(
            message=response_message,
            extracted_data=extracted_data,
            suggested_followups=suggested_followups
        )
    
    except Exception as e:
        db.rollback() # Ensure database rollback on error
        print(f"Full error processing interaction: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred while processing your request. Please try again or rephrase. Error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "PharmaGPT API is running"}

if __name__ == "__main__":
    import uvicorn
    # IMPORTANT: Set your GROQ_API_KEY environment variable BEFORE running this.
    # For a quick temporary test (DO NOT USE IN PRODUCTION OR SHARE):
    # os.environ["GROQ_API_KEY"] = "sk_..." # Replace with your actual Groq API key
    uvicorn.run(app, host="0.0.0.0", port=8000)