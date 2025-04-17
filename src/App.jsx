import "./App.css";
import React, { useState } from "react";

const App = () => {
  // Reemplaza con tu información
  const userName =   "Lautaro Faccini";

  // Opciones para el juego de Piedra, Papel o Tijeras
  const options = ["Piedra", "Papel", "Tijeras"];
  const [userChoice, setUserChoice] = useState(null);
  const [cpuChoice, setCpuChoice] = useState(null);
  const [result, setResult] = useState("");

  const playGame = (choice) => {
    setUserChoice(choice);
    const cpu = options[Math.floor(Math.random() * options.length)];
    setCpuChoice(cpu);

    if (choice === cpu) setResult("Empate");
    else if (
      (choice === "Piedra" && cpu === "Tijeras") ||
      (choice === "Papel" && cpu === "Piedra") ||
      (choice === "Tijeras" && cpu === "Papel")
    )
      setResult("¡Ganaste!");
    else setResult("Perdiste");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex flex-col items-center p-6">
      <header className="text-center mb-12">
        {/* Coloca tu foto en public/mi-foto.jpg */}
        <img
          src="https://avatars.githubusercontent.com/u/88357779?s=400&u=83a1ab265d3730087c5dc6b4db51eaed5a73f38c&v=4"
          alt="Mi Foto"
          className="w-32 h-32 rounded-full mx-auto shadow-lg"
        />
        <h1 className="mt-4 text-4xl font-bold text-gray-800">{userName}</h1>
      </header>

      <main className="w-full max-w-xl bg-white rounded-2xl shadow p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Piedra, Papel o Tijeras
        </h2>
        <div className="flex justify-around mb-4">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => playGame(option)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {userChoice && (
          <div className="text-center">
            <p className="text-lg">
              Tú: <span className="font-medium">{userChoice}</span> | CPU:{" "}
              <span className="font-medium">{cpuChoice}</span>
            </p>
            <p className="mt-2 text-2xl font-bold text-indigo-600">{result}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
