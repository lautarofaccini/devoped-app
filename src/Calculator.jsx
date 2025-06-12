import { useState } from "react";
import { evaluate } from "mathjs";

export const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const rows = [[7, 8, 9], [4, 5, 6], [1, 2, 3], [0]];
export const operations = ["+", "-", "/", "*"];
export const equalSign = "=";

export const Calculator = () => {
  const [value, setValue] = useState("");

  const handleClick = (op) => () => {
    setValue(value.concat(op));
  };

  return (
    <section className="max-w-sm mx-auto mt-8 p-4 bg-white rounded-2xl shadow-lg">
      <h1 className="text-center text-2xl font-semibold mb-4">Calculator</h1>
      <input
        value={value}
        readOnly
        className="w-full mb-4 p-2 text-right text-xl font-mono bg-gray-100 rounded-lg border border-gray-300"
      />
      <div role="grid" className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} role="row" className="grid grid-cols-3 gap-2">
            {row.map((number) => (
              <button
                key={number}
                onClick={handleClick(number)}
                className="py-3 bg-gray-200 rounded-lg shadow hover:bg-gray-300 transition"
              >
                {number}
              </button>
            ))}
          </div>
        ))}
        <div role="row" className="grid grid-cols-4 gap-2">
          {operations.map((operation) => (
            <button
              onClick={handleClick(operation)}
              key={operation}
              className="py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              {operation}
            </button>
          ))}
          <button
            onClick={() => setValue(evaluate(value))}
            className="py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition col-span-2"
          >
            {equalSign}
          </button>
        </div>
      </div>
    </section>
  );
};
