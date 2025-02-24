import {Bar} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EvaluationChart = ({evaluation}) => {
    if (!evaluation || Object.keys(evaluation).length === 0) return <p>Upload a conversation file to evaluate.</p>;
    const metrics = Object.keys(evaluation); // Extract metric names dynamically
    const data = {
        labels: metrics, // Metric names on x-axis
        datasets: [
            {
                data: metrics.map((metric) => evaluation[metric] ?? 0), // Extract metric values
                backgroundColor: ["#7367f0", "#28c76f", "#ea5455", "#ff9f43", "#00cfe8", "#ff6f61"] // Use predefined colors
            }
        ]
    };

    return (
        <Bar
            data={data}
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        display: false // Hides the legend
                    },
                    title: {
                        display: true,
                        text: "Evaluation Chart",
                        font: {
                            family: "'Fira Sans', sans-serif", // Set font for title
                            size: 18, // Set font size (optional)
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                family: "'Fira Sans', sans-serif", // Set font for x-axis
                                size: 12, // Set font size (optional)
                            },
                        },
                    },
                    y: {
                        ticks: {
                            font: {
                                family: "'Fira Sans', sans-serif", // Set font for y-axis
                                size: 12, // Set font size (optional)
                            },
                        },
                    },
                },
            }}
        />
    );
};

export default EvaluationChart;
