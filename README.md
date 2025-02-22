# Bot Performance Evaluation Platform

## Overview
This project evaluates a chatbot's performance based on various metrics such as:
- **Accuracy**
- **Coherence**
- **Relevancy**
- **Contextual Understanding**
- **Question Clarity**
- **Conciseness & Completeness**

Users can compare different LLMs (Gemini, LLaMA, Mistral, etc.) by uploading user-bot conversation JSONs, selecting a model for evaluation, and optionally providing conversation context. The system then generates a graphical representation of all evaluated metrics and stores benchmark data for model comparison.

## Features
- **Multi-Model Support**: Evaluate chatbot responses using various LLMs.
- **Metric-Based Evaluation**: Assess conversations on six key performance metrics.
- **Graphical Representation**: View results in easy-to-understand charts.
- **Benchmark Storage**: Compare results across different models.
- **FastAPI Backend**: Handles evaluation requests efficiently.
- **React.js Frontend**: Provides an interactive UI.

---

## Tech Stack
- **Backend**: FastAPI, LangChain
- **Frontend**: React.js
- **LLMs Used**: Gemini, LLaMA, Mistral

---

## Installation & Setup
### Prerequisites
- Python 3.12+
- Node.js (only for development, as the final React build is already included)

### Step 1: Clone the Repository
```bash
git clone https://github.com/mohitsingh538/llm-metrics-evaluation.git
cd llm-metrics-evaluation
```

### Step 2: Create Virtual Environment
```bash
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables
Create a `.env` file in the root directory with the following keys:
```plaintext
GEMINI_API_KEY=<your_gemini_api_key>
GROQ_API_KEY=<your_groq_api_key>
```

### Step 5: Run the Backend Server
```bash
uvicorn server:app --port 9000 --reload
```

### Step 6 (Optional): Test the data
Conversation JSON data is available inside
```bash
./conversation-data
```

> **Note**: Since the final React build is already included, you do not need to run the React server separately.

---

## Usage
1. **Upload a conversation JSON**: Provide a user-bot conversation log.
2. **Select an LLM**: Choose the model for evaluation.
3. **Provide Context (Optional)**: Improve evaluation accuracy.
4. **View Results**: The system displays metric evaluations in graphical form.
5. **Compare Benchmarks**: Analyze past evaluations in tabular format.

---

## Contributing
Feel free to submit issues or contribute to the project via pull requests.

---

## License
This project is licensed under the MIT License.

---

