const Table = ({ headers, data }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-blue-500 text-white sticky top-0">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border border-gray-300 px-4 py-3 text-left uppercase font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${
                rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"
              } hover:bg-blue-100 transition duration-300`}
            >
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="border border-gray-300 px-4 py-3">
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
