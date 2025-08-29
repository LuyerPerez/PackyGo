import { Link } from "react-router-dom";
import "../assets/Home.css";
import Loader from "../components/TruckLoader";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-buttons">
        <Link to="/login" className="home-button"></Link>
      </div>
    </div>
  );
}
