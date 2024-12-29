import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import Chatbot from "./Chatbot";
import { useEffect, useState } from "react";
import axios from "axios";

const AiHelper = () => {
  const id = "66ce2ff1ea215dc4daa2651d";
  const text = "a nice mobile";
  const [data, setData] = useState();
  const [prodNames, setProdNames] = useState<[]>([]);
  const [Aires, setAires] = useState();
  const [ProductId, setProductId] = useState<string>("");

  const selectProductDetails = (id:string) => {
    setProductId(id);
  };

  const handleProductData = (productData:any) => {
    setProdNames(productData);
  };


  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", overflow: "hidden" }}>
      {/* product list div */}
      <div style={{ height: "100%", width: "30%", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" }}>
        <div style={{ backgroundColor: "#f5f5f5", border: "2px solid #ccc", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", padding: "8px" }}>
          <h1 style={{ color: "#4a4a4a", fontWeight: "600", fontSize: "1.125rem", marginLeft: "8px" }}>Products</h1>
        </div>
        {prodNames.length>0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", padding: "8px", overflowY: "auto" }}>
            {prodNames?.map((product: any, index: number) => (
  <div key={index.toString()} onClick={() => selectProductDetails(product?.id)}>
    <ProductCard props={product} />
  </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: "40vh", marginLeft: "28%" }}>
            Give prompt to see the products
          </div>
        )}
      </div>

      {/* chatbox div */}
      <div style={{ width: "38%" }}>
        <Chatbot setDatatoParent={handleProductData} />
      </div>

      {/* product detail div */}
      <div style={{ backgroundColor: "#fff", width: "32%" }}>
        <div style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#f5f5f5", height: "6vh", padding: "8px" }}>
          <h1 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#4a4a4a" }}>Product details</h1>
        </div>
        {prodNames.length>0? (
          <ProductDetails productId={ProductId} />
        ):
        <div style={{ marginTop: "40vh", marginLeft: "28%"}}>
            Click a product to view its details . 
          </div> 
        }
      </div>
    </div>
  );
};

export default AiHelper;
