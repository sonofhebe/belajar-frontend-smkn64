import { useState, useEffect, useRef } from "react";
import api from "../api/api";
import "../css/Style.css";

// PostImage component for displaying carousel of images
const PostImage = ({ storagePath }) => {
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null); // Ref to store debounce timer

  // Debounce function
  const debounce = (func, delay) => {
    return (...args) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const fetchImageBase64 = async () => {
      try {
        if (storagePath) {
          const response = await api.get(`v1/image/${storagePath}`);
          setBase64Image(response.data.base64);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    const debounceFetchPosts = debounce(fetchImageBase64, 200);
    debounceFetchPosts();
  }, [storagePath]);

  return (
    <div className="post-image d-flex">
      {loading ? (
        <div>Loading image...</div>
      ) : (
        <img
          src={base64Image ?? "/broken-image.svg"}
          alt="Post"
          className="img-fluid"
          style={{ maxHeight: "400px", objectFit: "cover" }}
        />
      )}
    </div>
  );
};

export default PostImage;
