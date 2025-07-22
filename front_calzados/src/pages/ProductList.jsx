    // src/pages/ProductList.jsx
    import React from 'react';

    function ProductList() {
      return (
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-6">Nuestros Calzados</h2>
          <p className="text-lg text-gray-600">
            Aquí es donde mostraremos la lista de todos los productos disponibles.
            ¡Pronto se llenará de zapatillas increíbles!
          </p>
          {/* Aquí es donde en el futuro haremos la llamada a la API y mostraremos los productos */}
        </div>
      );
    }

    export default ProductList;