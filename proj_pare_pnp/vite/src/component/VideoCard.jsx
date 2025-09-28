import clip from '@/assets/Maproad.mp4';

export default function VideoCard() {
  return (
    <div className="video-card">
      <div className="video-wrapper">
        <video
          src={clip}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          width="100%"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
