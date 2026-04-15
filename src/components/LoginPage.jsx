import { useState } from "react";

function LoginPage({ onLogin, onRegister, status }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("sarah@kalos.demo");
  const [password, setPassword] = useState("kalos123");

  const submit = async (event) => {
    event.preventDefault();
    if (mode === "register") {
      await onRegister(name, email, password);
      return;
    }
    await onLogin(email, password);
  };

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">Kalos Health Platform</p>
        <h1>Member Dashboard</h1>
        <p className="subtle">
          {mode === "login"
            ? "Sign in with your member account to view your scan journey."
            : "Create a new member account to start tracking scans."}
        </p>
      </section>
      <form onSubmit={submit} className="card form authCard">
        <div className="authModeTabs">
          <button
            type="button"
            className={`tabBtn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`tabBtn ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
        {mode === "register" && (
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </label>
        )}
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">{mode === "login" ? "Log in" : "Create account"}</button>
      </form>
      <p className="status">{status}</p>
    </main>
  );
}

export default LoginPage;
