import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);
  return null;
}
import Catalogo from './pages/Catalogo';
import Drinkware from './pages/Drinkware';
import ProductoDetalle from './pages/ProductoDetalle';
import VajillaDetalle from './pages/VajillaDetalle';
import Personalizado from './pages/Personalizado';
import Disenador from './pages/Disenador';
import DisenadorEditor from './pages/DisenadorEditor';
import Checkout from './pages/Checkout';
import Confirmacion from './pages/Confirmacion';
import Auth from './pages/Auth';
import Perfil from './pages/Perfil';
import TerminosYPrivacidad from './pages/Legal/TerminosYPrivacidad';
import NotFound from './pages/NotFound';
import RequireAdmin from './components/shared/RequireAdmin';
import Panel from './pages/Panel';
import PanelProductoForm from './pages/Panel/ProductoForm';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:slug" element={<ProductoDetalle />} />
          <Route path="/drinkware" element={<Drinkware />} />
          <Route path="/drinkware/:slug" element={<VajillaDetalle />} />
          <Route path="/personalizado" element={<Personalizado />} />
          <Route path="/disenar" element={<Disenador />} />
          <Route path="/disenar/:producto" element={<DisenadorEditor />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/mi-cuenta" element={<Perfil />} />
          <Route path="/terminos-y-privacidad" element={<TerminosYPrivacidad />} />
          <Route path="/terminos" element={<TerminosYPrivacidad />} />
          <Route path="/privacidad" element={<TerminosYPrivacidad />} />
          <Route path="/politica-de-privacidad" element={<TerminosYPrivacidad />} />
          <Route element={<RequireAdmin />}>
            <Route path="/panel" element={<Panel />} />
            <Route path="/panel/:tipo/nuevo" element={<PanelProductoForm />} />
            <Route path="/panel/:tipo/:id" element={<PanelProductoForm />} />
          </Route>
          {/* Ruta 404 Personalizada */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
