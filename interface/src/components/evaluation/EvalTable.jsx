import DataTable from "react-data-table-component";

const BenchmarkTable = ({ data }) => {
    if (!data || data.length === 0) return null;

    // Extract all unique columns dynamically
    const allColumns = Array.from(new Set(data.flatMap(row => Object.keys(row))));

    // Function to format values (round floats to 2 decimal places)
    const formatValue = (value) => {
        if (typeof value === "number") {
            return value % 1 === 0 ? value : value.toFixed(2); // Round float values
        }
        return value !== undefined ? value : "N/A"; // Handle missing values
    };

    // Identify columns that have at least one valid value
    const validColumns = allColumns.filter(col =>
        data.some(row => row[col] !== undefined && row[col] !== "N/A")
    );

    // Define DataTable columns format
    const dataTableColumns = validColumns.map(col => ({
        name: col.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()), // Format column names
        selector: row => formatValue(row[col]),
        sortable: true // Make columns sortable
    }));

    return (
        <div className="mt-4">
            <DataTable
                columns={dataTableColumns}
                data={data}
                pagination // Enable pagination
                highlightOnHover // Highlight rows on hover
                striped // Add striped rows
                responsive // Make table responsive
            />
        </div>
    );
};

export default BenchmarkTable;
