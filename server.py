import json
import os
import shutil
import tempfile
import traceback
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from data_models.evaluation import EvaluationRequest
from utils.evaluation import Evaluator, get_model
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Adding CORS Middleware to handle cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change to specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
async def home():
    return FileResponse(os.path.join("frontend", "index.html"))



@app.post("/evaluation")
async def evaluate(
    model: str = Form(...),
    metrics: str = Form(...),
    context: str = Form(...),
    conversation_file: UploadFile = File(...)
):
    try:
        # Reading the uploaded conversation file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            shutil.copyfileobj(conversation_file.file, temp_file)
            temp_file_path = temp_file.name

        with open(temp_file_path, "r", encoding="utf-8") as f:
            conversation_data = json.load(f)

        if not isinstance(conversation_data, list) or any(
            "user_question" not in item or "bot_response" not in item
            for item in conversation_data
        ):
            return {"error": "Invalid JSON format"}


        structured_request = EvaluationRequest(
            model=model,
            metrics=json.loads(metrics),
            context=context,
            conversations=conversation_data
        )

        model = get_model(structured_request.model)
        chat_llm = model["chat"]

        evaluator = Evaluator(chat_llm)
        evaluation_result = await evaluator.evaluate_conversation(structured_request)

        return JSONResponse(content={"code": 200, "data": evaluation_result}, status_code=200)

    except Exception as e:
        print(f"Error processing evaluation request: {str(e)}\n\nStack Trace:{traceback.format_exc()}")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn

    # Start the FastAPI app
    uvicorn.run(app, host="0.0.0.0", port=9000)
