import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      background: "linear-gradient(to right, #f9f9f9, #d9e4f5)",
      minHeight: "100vh",
      margin: 0,
      padding: 0,
    }}>
      <header style={{
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // يخلي العنوان في النص
        position: "relative"       // مهم لو هنحط الروابط على الشمال
      }}>
        {/* Home و About على الشمال */}
        <nav style={{
          position: "absolute",
          left: "20px", // المسافة من الشمال
          display: "flex",
          gap: "20px"   // المسافة بين الروابط
        }}>
          <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Home</Link>
          <Link to="/about" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>About</Link>
        </nav>

        {/* العنوان في النص */}
        <h1 style={{ margin: 0 }}>Welcome to My Website</h1>
      </header>

      <main style={{ padding: "80px", textAlign: "center" }}>
        <h2>Explore our website!</h2>
        <p>Click the buttons or use the menu above to navigate.</p>
        <button style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "20px 20px",
          margin: "10px",
          cursor: "pointer",
          fontSize: "18px",
          borderRadius: "5px"
        }}>Get Started</button>
        <button style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "20px 20px",
          margin: "10px",
          cursor: "pointer",
          fontSize: "18px",
          borderRadius: "5px"
        }}>Learn More</button>
      </main>
    </div>
  );
};

export default Home;


