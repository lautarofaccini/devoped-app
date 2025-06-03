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
    <section>
      <h1>Calculator</h1>
      <input value={value} readOnly />
      <div role="grid">
        {rows.map((row, idx) => (
          <div role="row" key={idx}>
            {row.map((number) => (
              <button onClick={handleClick(number)} key={number}>
                {number}
              </button>
            ))}
          </div>
        ))}
        {operations.map((operation) => (
          <button onClick={handleClick(operation)} key={operation}>
            {operation}
          </button>
        ))}
        <button onClick={() => setValue(evaluate(value))}>{equalSign}</button>
      </div>
    </section>
  );
};
