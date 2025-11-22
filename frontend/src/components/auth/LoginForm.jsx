import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // hook للتنقل

  const handleLogin = (e) => {
    e.preventDefault();

    // ✅ تحقق مؤقت: username = "admin", password = "1234"
    if(username === "admin" && password === "1234") {
      navigate("/notebook"); // الانتقال للصفحة الرئيسية للنوت بوك
    } else {
      alert("Incorrect username or password!");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="text" 
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Log In</button>
    </form>
  );
}







