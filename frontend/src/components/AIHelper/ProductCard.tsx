import axios from "axios";
import { server } from "../../redux/store";
import { useState } from "react";

const ProductCard = (props:any) => {
  const { name, price, description, photos } = props.props;

  const trimDescription = (description:string) => {
    return description.length > 150 ? description.substring(0, 150) + "..." : description;
  };

  return (
    <div
      style={{
        padding: "0.5rem",
        display: "flex",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        // hover: {
        //   boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        // },
        gap: "1rem",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: "0.375rem",
      }}
    >
      <div style={{ width: "30%", borderRadius: "0.375rem", height: "auto" }}>
        <img src={`${photos[0].url}`} alt="" style={{ borderRadius: "0.375rem", width: "100%" }} />
      </div>
      <div style={{ width: "70%", gap: "0.25rem", padding: "0.5rem", wordWrap: "break-word" }}>
        <h1 style={{ fontWeight: "600", fontSize: "1.125rem" }}>{name}</h1>
        <p style={{ fontSize: "0.75rem", color: "#4B5563", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {trimDescription(description)}
        </p>
        <p style={{ fontSize: "0.875rem", color: "#1F2937" }}>₹{price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
