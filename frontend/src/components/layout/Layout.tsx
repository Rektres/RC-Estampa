import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartDrawer from './CartDrawer';
import MobileStickyBar from './MobileStickyBar';
import CookieBanner from '../shared/CookieBanner';

export default function Layout() {
  return (
    <div className="min-vh-100 bg-surface d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileStickyBar />
      <CartDrawer />
      <CookieBanner />
    </div>
  );
}
