import {useEffect, useState} from "react";
import Select from "react-select";
import {useDropzone} from "react-dropzone";
import {submitEvaluation} from "../../services/api";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import 'highlight.js/styles/night-owl.min.css';

hljs.registerLanguage("json", json);

const EvaluationForm = ({setEvaluation, setMessages, setBenchmarkData}) => {
    const [selectedModels, setSelectedModels] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [messages, setLocalMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlertMessage(null); // Clear previous alert

        const formData = new FormData();
        formData.append("model", selectedModels ? selectedModels.value : "");
        formData.append("metrics", JSON.stringify(selectedMetrics.map(m => m.value)));
        formData.append("context", document.getElementById("context").value);

        if (uploadedFile) formData.append("conversation_file", uploadedFile);

        try {
            const response = await submitEvaluation(formData);

            if (response && response.data) {
                setMessages([]);
                setEvaluation({...response.data.average_scores});

                const formattedMessages = response.data.conversations.map(convo => {
                    if (convo.sender === "bot" && convo.evaluation) {
                        const jsonCode = JSON.stringify(convo.evaluation.scores, null, 2);
                        return {
                            ...convo,
                            text: `${convo.text}<hr><small><b>Evaluation Result:</b> ${convo.evaluation.feedback}</small>
                        <pre style="margin: 0; overflow-x: auto; max-width: 100%"><code class="json">${jsonCode}</code></pre>`
                        };
                    }
                    return convo;
                });

                setMessages(formattedMessages);
                setLocalMessages(formattedMessages);

                const newEntry = {
                    model: selectedModels.label,
                    ...response.data.average_scores
                };

                setBenchmarkData(prevData => {
                    const updatedData = [...prevData.filter(d => d.model !== newEntry.model), newEntry];
                    const allColumns = new Set(["model"]);
                    updatedData.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));

                    return updatedData.map(row => {
                        let newRow = {model: row.model};
                        allColumns.forEach(col => {
                            newRow[col] = row[col] !== undefined ? row[col] : "N/A";
                        });

                        return newRow;
                    });
                });

            } else {
                console.error(`Invalid API response structure ==> ${response}`);
                setAlertMessage(
                    `⚠️ The evaluation request took too long to respond.<br/><br/>
                            <b>Possible reasons:</b><br/>  
                            - ${selectedModels.label} model might be slow to process.<br/>  
                            - The server is busy or facing high traffic.<br/>  
                            - There could be network connectivity issues.<br/><br/>  
                            
                            Please try again later or <i>select a different model</i>.`);

            }

        } catch (error) {
            console.error("Error submitting evaluation:", error);
            setAlertMessage("An unexpected error occurred. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.querySelectorAll("pre code.json").forEach((el) => {
            hljs.highlightElement(el);
        });
    }, [messages]);

    return (
        <div className="card p-3 shadow-sm mb-3">
            <form onSubmit={handleSubmit}>
                <SelectModel
                    selectedModels={selectedModels}
                    setSelectedModels={setSelectedModels}
                />

                <SelectMetrics
                    selectedMetrics={selectedMetrics}
                    setSelectedMetrics={setSelectedMetrics}
                />

                <TextArea context={context} setContext={setContext}/>

                <FileDropzone
                    setUploadedFile={setUploadedFile}
                    setMessages={setMessages}
                    setBenchmarkData={setBenchmarkData}
                    setEvaluation={setEvaluation}
                />

                <AlertMessage
                    message={alertMessage}
                    messageClass="danger"
                    onClose={() => setAlertMessage(null)}
                />

                <SubmitButton loading={loading}/>
            </form>
        </div>
    );
};

const SelectModel = ({selectedModels, setSelectedModels}) => {
    return (
        <div className="mb-3">
            <label htmlFor="llm-model" className="form-label">Choose LLM Models</label>
            <Select
                id="llm-model"
                options={useLLMModels()}
                onChange={setSelectedModels}
                value={selectedModels}
                isClearable
            />
        </div>
    );
};


const AlertMessage = ({ message, messageClass, onClose }) => {
    if (!message) return null; // Don't render anything if no message

    return (
        <div className={`alert alert-${messageClass} alert-dismissible fade show`} role="alert"
             style={{color: "#ff4c51"
        }}>
            <span dangerouslySetInnerHTML={{ __html: message }} />
            <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
                onClick={onClose}
            ></button>
        </div>
    );
};



const SelectMetrics = ({selectedMetrics, setSelectedMetrics}) => {
    return (
        <div className="mb-3">
            <label htmlFor="metrics" className="form-label">Choose Metrics</label>
            <MultiSelectDropdown
                id="metrics"
                options={useMetrics()}
                selectedOptions={selectedMetrics}
                onChange={setSelectedMetrics}
            />
        </div>
    );
};

const TextArea = ({context, setContext}) => {
    return (
        <div className="mb-3">
            <label htmlFor="context" className="form-label">Conversation context</label>
            <textarea className="form-control" id="context" rows="3" value={context}
                      onChange={(e) => setContext(e.target.value)}></textarea>
        </div>
    );
};

const FileDropzone = ({setUploadedFile, setMessages, setBenchmarkData, setEvaluation}) => {
    const [file, setFile] = useState(null);

    const onDrop = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (!selectedFile || selectedFile.type !== "application/json") {
            alert("Only JSON files are allowed.");
            return;
        }

        setFile(selectedFile);
        setUploadedFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                if (!Array.isArray(jsonData) || jsonData.some(item => !("user_question" in item) || !("bot_response" in item))) {
                    throw new Error("Invalid JSON format.");
                }
                const formattedMessages = jsonData.flatMap(({user_question, bot_response}) => [
                    {text: user_question, sender: "user"},
                    {text: bot_response, sender: "bot"}
                ]);
                setMessages(formattedMessages);

            } catch (error) {
                alert("Invalid JSON file format.");
                setFile(null);
            }
        };
        reader.readAsText(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
        setUploadedFile(null);
        setMessages([]);
        setBenchmarkData([]);
        setEvaluation({});
    };

    const {getRootProps, getInputProps} = useDropzone({onDrop, accept: "application/json"});

    return (
        <div {...getRootProps()} style={{
            border: "2px dashed #ccc",
            padding: "20px",
            textAlign: "center",
            margin: "10px 0",
            position: "relative"
        }}>
            <input {...getInputProps()} id="conversation-file"/>
            {!file ? (
                <p>Drag & drop a conversation JSON file here, or click to select</p>
            ) : (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    background: "#f9f9f9"
                }}>
                    <span>
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/11634/11634600.png" // JSON icon URL
                            alt="JSON Icon"
                            style={{width: "50px", height: "50px"}}
                        />
                    </span>
                    <span style={{
                        marginLeft: "10px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#333",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        maxWidth: "200px",
                        cursor: "pointer",
                    }}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    <button
                        className="btn btn-close"
                        onClick={removeFile}
                        style={{
                            marginLeft: "5%",
                            fontSize: "12px"
                        }}>
                    </button>
                </div>
            )}
        </div>
    );
};


const SubmitButton = ({loading}) => {
    return (
        <button
            type="submit"
            className="btn btn-primary d-flex align-items-center"
            style={{maxWidth: "50%", background: "#7367f0", borderColor: "#7367f0"}}
            disabled={loading} // Disable when loading is true
        >
            {loading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                    >
                    </span>
                    Evaluating...
                </>
            ) : (
                "Evaluate"
            )}
        </button>
    );
};


const MultiSelectDropdown = ({options, selectedOptions, onChange}) => {
    return (
        <div>
            <Select isMulti options={options} value={selectedOptions} onChange={onChange}/>
        </div>
    );
};


const useMetrics = () => {
    return [
        {value: "accuracy", label: "Accuracy"},
        {value: "relevancy", label: "Relevancy"},
        {value: "coherence", label: "Coherence"},
        {value: "contextual_understanding", label: "Contextual Understanding"},
        {value: "question_clarity", label: "Question Clarity"},
        {value: "conciseness_completeness", label: "Conciseness & Completeness"},
    ];
};

const useLLMModels = () => {
    return [
        {value: "groq-llama-3.1-8b-instant", label: "Llama-3.1 8B (Instant)"},
        {value: "gemini-2.0-flash", label: "Gemini-2.0 Flash"},
        {value: "gemini-1.5-pro", label: "Gemini-1.5 Pro"},
        {value: "gpt-4", label: "GPT-4"},
        {value: "groq-llama-3.3-70b-versatile", label: "LLaMA-3.3 70B (Versatile)"},
        {value: "groq-qwen-2.5-32b", label: "Qwen-2.5 32B"},
        {value: "groq-gemma2-9b-it", label: "Gemma-2 9B (IT)"},
    ];
};


export default EvaluationForm;
