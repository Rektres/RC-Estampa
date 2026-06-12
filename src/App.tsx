import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
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

export default function App() {
  return (
    <BrowserRouter>
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
