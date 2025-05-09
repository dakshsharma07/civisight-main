from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase Admin
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Task(BaseModel):
    title: str
    description: str
    status: str = "pending"
    priority: str = "medium"
    deadline: datetime
    assigned_to: str
    county_id: str
    created_by: str

# Routes
@app.post("/tasks")
async def create_task(task: Task):
    try:
        task_dict = task.dict()
        task_dict["created_at"] = firestore.SERVER_TIMESTAMP
        task_dict["updated_at"] = firestore.SERVER_TIMESTAMP
        
        # Add task to Firestore
        task_ref = db.collection("tasks").document()
        task_dict["id"] = task_ref.id
        task_ref.set(task_dict)
        
        # Send email notification
        await send_task_reminder_email(task_dict)
        
        return {"id": task_ref.id, **task_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tasks/county/{county_id}")
async def get_county_tasks(county_id: str):
    try:
        tasks = db.collection("tasks").where("county_id", "==", county_id).stream()
        return [{"id": task.id, **task.to_dict()} for task in tasks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    try:
        db.collection("tasks").document(task_id).delete()
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Email notification function
async def send_task_reminder_email(task: dict):
    # In production, integrate with an email service like SendGrid
    print(f"Would send email to {task['assigned_to']} about task: {task['title']}")
    print(f"Email content: Task {task['title']} is due on {task['deadline']}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 