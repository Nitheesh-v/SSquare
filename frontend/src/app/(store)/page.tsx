import { MaterialJourney } from "@/features/journey/MaterialJourney";
import "@/features/journey/journey.css";

export default function HomePage() {
  return (
    <>
      <MaterialJourney />
      <noscript>
        <style>{`.journey-inside{height:auto}.journey-pin{position:relative;top:0;height:400px}.journey-static-story{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px;padding:32px}.journey-static-story article{padding:20px;border-top:1px solid #141e2d55}.journey-static-story h2{font-size:25px;margin-top:12px}.journey-static-story p{font-size:12px;line-height:1.8;margin-top:12px}.journey-rail,.journey-in-front,.journey-autoplay,.journey-hero-controls,.journey-material-tabs,.brief-arrangement,.brief-thumbnails,.brief-buy{display:none}.journey-pin .in-num{display:none}`}</style>
      </noscript>
    </>
  );
}
