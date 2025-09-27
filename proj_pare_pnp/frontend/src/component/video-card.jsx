// src/components/VideoCard.jsx
function VideoCard() {
  return (
    <div className="video-card">
      <div className="video-wrapper">
        <video autoPlay muted loop playsInline width="100%">
          <source src="/Maproad.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default VideoCard;
