import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { login } from "./services/full-login";

function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => login()}>
          LOGIN (see console logs & network tab)
        </button>
        <p>
          please don't spam, no additional logic to prevent multiple clicks &
          loading is in
        </p>
      </div>
    </>
  );
}

export default App;
