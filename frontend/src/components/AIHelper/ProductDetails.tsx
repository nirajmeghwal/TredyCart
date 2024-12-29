import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../redux/store";

interface ProductDetailsProps {
  productId: string; // The productId prop should be a string
}

interface Product {
  photos: { url: string }[];
  name: string;
  ratings: number;
  numOfReviews: number;
  price: number;
  description: string;
}

interface Review {
  comment: string;
  rating: number;
  name: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId }) => {
  const id = productId;
  const [data, setData] = useState<Product | undefined>(undefined);
  const [rev, setRev] = useState<Review[]>([]);

  const fetchProductDetails = async () => {
    try {
      const res = await axios.get(`${server}/api/v1/product/${id}`);
      setData(res.data.product);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const res = await axios.get(`${server}/api/v1/product/reviews/${id}`);
      setRev(res.data.reviews);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
  }, [id]);

  return data ? (
    <div style={{ overflow: "auto", height: "90%", padding: "0.5rem" }}>
      <div style={{ padding: "0.5rem", gap: "0.5rem", display: "flex", flexDirection: "column", flexGrow: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={data?.photos[0].url} style={{ width: "50%", borderRadius: "0.375rem" }} alt="" />
          <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
            <h1 style={{ fontWeight: "600", fontSize: "1.25rem" }}>{data?.name}</h1>
            <div style={{ display: "flex", gap: "0.5rem", color: "#9CA3AF", alignItems: "center" }}>
              <p>{data?.ratings}</p>
              <p style={{ color: "#1F2937" }}>{data?.numOfReviews}</p>
            </div>
            <p style={{ color: "#16A34A", fontWeight: "600" }}>Special Price</p>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <p style={{ fontWeight: "600", fontSize: "1.5rem" }}>₹{data?.price}</p>
              <p style={{ fontWeight: "600" }}>₹{data?.price}</p>
              <p style={{ color: "#16A34A", fontSize: "0.875rem" }}>5% off</p>
            </div>
            <p style={{ color: "#B91C1C" }}>Hurry, Only 5 left</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <h1 style={{ fontWeight: "600",fontSize:"17px" }}>Available Offers</h1>
          <div style={{ gap: "0.25rem" }}>
            {[...Array(3)].map((_, idx) => (
              <div key={idx} style={{ display: "flex", fontSize: "0.875rem", alignItems: "center", gap: "0.25rem" }}>
                <img src="https://rukminim2.flixcart.com/www/36/36/promos/06/09/2016/c22c9fc4-0555-4460-8401-bf5c28d7ba29.png?q=90" alt="log" style={{ width: "1rem", height: "1rem" }} />
                <h1 style={{ fontWeight: "600", marginLeft: "0.25rem",fontSize:"15px" }}>Bank Offer</h1>
                <p>15% Instant discount on first Flipkart Pay Later order of 500 and above</p>
                <button style={{ color: "#3B82F6" }}>T&C</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "2.5rem", fontSize: "15px", fontWeight: "600" }}>
          <h1 style={{fontSize:"17px"}}>Delivery</h1>
          <h1 style={{fontSize:"17px"}}>Delivery by Thu, 22 Aug</h1>
        </div>
        <div style={{ display: "flex", gap: "2.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
          <h1 style={{fontSize:"18px"}}>Highlights</h1>
          <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li style={{ fontSize: "0.875rem", fontWeight: "400" }}>{data?.description}</li>
          </ul>
        </div>
        <div style={{ display: "flex", gap: "2.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
          <h1 style={{fontSize:"17px"}}>Services</h1>
          <ul style={{ listStyleType: "none", gap: "0.25rem", display: "flex", flexDirection: "column" }}>
            <li style={{ fontSize: "0.875rem", fontWeight: "400", display: "flex", gap: "0.25rem" }}>
              <img src="https://rukminim2.flixcart.com/www/36/36/promos/06/09/2016/c22c9fc4-0555-4460-8401-bf5c28d7ba29.png?q=90" alt="log" style={{ width: "1rem", height: "1rem" }} />
              <p>2 Year</p>
            </li>
            <li style={{ fontSize: "0.875rem", fontWeight: "400", display: "flex", gap: "0.25rem" }}>
              <svg
                style={{ width: "1rem", height: "1rem" }}
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                data-testid="CachedIcon"
              >
                <path d="m19 8-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"></path>
              </svg>
              <p>7 Days Replacement Policy</p>
            </li>
            <li style={{ fontSize: "0.875rem", fontWeight: "400", display: "flex", gap: "0.25rem" }}>
              <img src="https://rukminim2.flixcart.com/www/36/36/promos/06/09/2016/c22c9fc4-0555-4460-8401-bf5c28d7ba29.png?q=90" alt="log" style={{ width: "1rem", height: "1rem" }} />
              <p>Cash on Delivery available</p>
            </li>
          </ul>
        </div>
        <div style={{ display: "flex", gap: "3.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
          <h1 style={{fontSize:"16px"}}>Seller</h1>
          <h1 style={{fontSize:"16px", color: "#3B82F6" }}>Nikon</h1>
        </div>
      </div>

      <div style={{ padding: "0.5rem" }}>
        <h1 style={{ fontWeight: "700", fontSize: "1rem", border: "1px solid #D1D5DB", padding: "0.5rem" }}>
          Product Description
        </h1>
        <div style={{ padding: "0.5rem", border: "1px solid #D1D5DB", fontSize: "0.875rem" }}>
          <ul>
            <li>{data?.description}</li>
          </ul>
        </div>
      </div>

      <div>
        <h1 style={{ padding: "0.5rem", fontWeight: "700", fontSize: "1rem" }}>
          Ratings & Reviews
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {rev.map((data, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "1rem",
                border: "1px solid #D1D5DB",
                borderRadius: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <p style={{fontSize: "1rem"}}>{data.rating}</p>
                <FontAwesomeIcon
                  icon={faStar}
                  style={{ fontSize: "1rem", color: "#FFD700" }}
                />
              </div>
              <p style={{fontSize: "1rem"}}>{data.comment}</p>
              <p style={{fontSize: "1rem"}}>by Kunal Jha</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    
  ) : (
    <p>Loading...</p>
    
  );
};

export default ProductDetails;
