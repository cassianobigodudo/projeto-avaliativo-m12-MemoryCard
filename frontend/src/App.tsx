import { BrowserRouter, Routes, Route } from 'react-router-dom';

// TODO: Importar páginas quando forem criadas
// import { LoginPage } from '@/pages/LoginPage';
// import { RegisterPage } from '@/pages/RegisterPage';
// import { CatalogPage } from '@/pages/CatalogPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas serão adicionadas durante o desenvolvimento */}
        <Route path="/" element={<div>MemoryCard - Em construção</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
