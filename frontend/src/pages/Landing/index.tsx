import HeroBento from './HeroBento';
import SplitNavHub from './SplitNavHub';
import Destacados from './Destacados';
import EditorBanner from './EditorBanner';
import SocialProof from './SocialProof';

export default function Landing() {
  return (
    <div className="bg-surface">
      <HeroBento />
      <SplitNavHub />
      <Destacados />
      <EditorBanner />
      <SocialProof />
    </div>
  );
}
