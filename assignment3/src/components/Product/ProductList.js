import React from "react";
import { useProducts } from "../../context/ProductContext";
import ProductItem from "./ProductItem";

const ProductList = () => {
  const { products } = useProducts();

  return (
    <div>
      <h2>Products</h2>
      <div>
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
