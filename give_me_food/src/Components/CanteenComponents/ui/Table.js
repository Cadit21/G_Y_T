const Table = ({ headers, data }) => {
    return (
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              {headers.map((header, index) => (
                <th key={index} className="border border-gray-300 p-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="border border-gray-300 p-2">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default Table;
  