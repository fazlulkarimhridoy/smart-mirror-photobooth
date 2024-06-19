import { useNavigate } from "react-router-dom";
import mainScreenImage from "../assets/New folder/1 BAT Photobooth main screen-01.jpg";
import "../css/style.css";

const Home = () => {
  const navigate = useNavigate();

  // navigate to the timer page
  const handleToTimer = () => {
    navigate("/timer");
  };

  return (
    <section className="text-white relative block">
      <div onClick={handleToTimer} className="w-full">
        <img
          className="w-full h-screen"
          src={mainScreenImage}
          alt="main-sreen-image"
        />
      </div>
    </section>
  );
};

export default Home;
