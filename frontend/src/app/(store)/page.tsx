import { MaterialJourney } from "@/features/journey/MaterialJourney";
import "@/features/journey/journey.css";
import "@/features/reference/reference.css";

export default function HomePage() {
  return (
    <>
      <MaterialJourney appearance="reference" />
      <noscript>
        <style>{`.reference-journey .journey-inside{height:auto}.reference-journey .journey-pin{position:relative;top:0;height:380px}.reference-journey .journey-static-story{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px;padding:32px}.reference-journey .journey-static-story article{padding:20px;border-top:1px solid #ffffff40}.reference-journey .journey-static-story h2{font-size:32px;margin-top:12px}.reference-journey .journey-static-story p{font-size:13px;line-height:1.8;margin-top:12px}.reference-journey .journey-rail,.reference-journey .journey-in-front,.reference-journey .journey-autoplay,.reference-journey .journey-hero-controls,.reference-journey .journey-material-tabs,.reference-journey .brief-arrangement,.reference-journey .brief-thumbnails,.reference-journey .brief-buy,.reference-header-actions,.reference-quote-form{display:none}.reference-journey .journey-pin .in-num{display:none}.reference-journey .reference-spotlight{height:auto}.reference-journey .spotlight-pin{position:relative;top:0}.reference-journey .reference-quote-layout{grid-template-columns:1fr}.reference-journey .reference-pack{display:none}`}</style>
        <p className="reference-no-script">
          Interactive material controls and the enquiry form need JavaScript.
          You can still browse our <a href="/products">component catalog</a>,{" "}
          <a href="tel:+917530080040">call S Square</a> or{" "}
          <a href="mailto:sales@ssquareengg.com">send an email</a>.
        </p>
      </noscript>
    </>
  );
}
