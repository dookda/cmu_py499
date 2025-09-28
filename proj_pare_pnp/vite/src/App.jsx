import Page1 from "./page/page1";
import Page2 from "./page/page2";
import Page3 from "./page/page3"; // ✅ import Page3
import "./App.css";
import VideoCard from "./component/VideoCard";

function App() {
  return (
    <div>
      {/* Section 1: Hero */}
      <section className="hero" id="hero">
        <nav className="navbar">
          <ul className="nav-links">
            <li>
              <a href="#hero">HOME</a>
            </li>
            <li>
              <a href="#map">MAP</a>
            </li>
            <li>
              <a href="#page2">Predicted Temp</a>
            </li>
            <li>
              <a href="#page3">IDW MAP</a> {/* ✅ เพิ่มเมนู Page3 */}
            </li>
          </ul>
        </nav>

        <div className="main-content">
          <div className="content">
            <h1>TRAFFIC HEAT MAP</h1>
            <p>
              การวิเคราะห์ความสัมพันธ์เชิงพื้นที่และเวลาระหว่างข้อมูล Google
              Traffic กับภูมิอากาศเมืองแบบ Near Real-Time:
              กรณีศึกษาเมืองเชียงใหม่
            </p>
            <a href="#map">
              <button>MAP</button>
            </a>
          </div>
          <VideoCard />
        </div>
      </section>

      {/* page1 */}
      <section id="map" className="map-section">
        <Page1 />
      </section>

      {/* page2 */}
      <section id="page2" className="map-section">
        <Page2 />
      </section>

      {/* page3 */}
      <section id="page3" className="map-section">
        <Page3 />
      </section>
    </div>
  );
}

export default App;
