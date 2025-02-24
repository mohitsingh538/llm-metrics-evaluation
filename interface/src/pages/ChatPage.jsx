import {useState} from "react";
import ChatInterface from "../components/chat/ChatInterface";
import EvaluationChart from "../components/evaluation/EvalChart";
import "../ChatPage.css";
import EvaluationForm from "../components/evaluation/EvalForm";
import {handleSend} from "../components/chat/HandleChat";
import BenchmarkTable from "../components/evaluation/EvalTable";


const ChatPage = () => {

    const [messages, setMessages] = useState([]);
    const [evaluation, setEvaluation] = useState([]);
    const [benchmarkData, setBenchmarkData] = useState([]);

    return (
        <div>
            <div className="container-fluid mt-4">

                {/* First Row */}
                <div className="row d-flex align-items-stretch">

                    {/* First Column (40%) */}
                    <div className="col-md-4 d-flex flex-column h-100">

                        {/* Form Card */}
                        <EvaluationForm
                            setEvaluation={setEvaluation}
                            setMessages={setMessages}
                            setBenchmarkData={setBenchmarkData}
                        />

                        {/* Chart Card */}
                        <div className="card p-3 shadow-sm flex-grow-1 d-flex flex-column">
                            <EvaluationChart evaluation={evaluation}/>
                        </div>
                    </div>

                    {/* Second Column (60%) */}
                    <div className="col-md-8 d-flex flex-column h-100">
                        <div
                            className="card p-3 shadow-sm flex-grow-1 d-flex flex-column mb-3"
                            style={{ maxHeight: "500px", overflowY: "auto" }}
                        > {/* Add mb-3 */}
                            <ChatInterface
                                messages={messages}
                                setMessages={setMessages}
                                handleSend={handleSend}
                            />
                        </div>
                        {benchmarkData && benchmarkData.length > 0 && (
                            <div className="card p-3 shadow-sm flex-grow-1 d-flex flex-column">
                                <h5 className="card-title">Benchmark Data</h5>
                                <BenchmarkTable data={benchmarkData} setBenchmarkData={setBenchmarkData}/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
