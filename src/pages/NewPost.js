import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";

const NewPost = ({ setPage }) => {
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostAttachments, setNewPostAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Remove an attachment from the list
  const handleRemoveAttachment = (index) => {
    const updatedAttachments = [...newPostAttachments];
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(updatedAttachments[index].preview);
    updatedAttachments.splice(index, 1);
    setNewPostAttachments(updatedAttachments);
  };

  // Handle new post submission
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!newPostCaption.trim() || newPostAttachments.length === 0) {
      Swal.fire({
        title: "Error",
        text: "Caption and at least one attachment are required.",
        icon: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("caption", newPostCaption);
    newPostAttachments.forEach((file) =>
      formData.append("attachments[]", file)
    );

    setLoading(true);
    try {
      await api.post("/v1/posts", formData, {
        headers: {
          Authorization: `Bearer <token>`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "Success",
        text: "Post created successfully!",
        icon: "success",
      }).then(() => {
        navigate(`/home`);
      });
    } catch (err) {
      const { response } = err;
      if (response && response.status === 422) {
        const errors = response.data.errors;
        const errorMessages = Object.values(errors).flat().join("\n");
        Swal.fire({
          title: "Validation Error",
          text: errorMessages,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to create the post. Please try again later.",
          icon: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelection = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Filter hanya file yang valid (gambar)
    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
    );

    // Tambahkan preview URL
    const filesWithPreview = validFiles.map((file) => {
      file.preview = URL.createObjectURL(file);
      return file;
    });

    setNewPostAttachments((prev) => [...prev, ...filesWithPreview]);
  };

  return (
    <div className="container new-post card my-4 p-3">
      <h5>Create a New Post</h5>
      <form onSubmit={handleCreatePost}>
        <div className="form-group mb-3">
          <textarea
            className="form-control"
            placeholder="What's on your mind?"
            value={newPostCaption}
            onChange={(e) => setNewPostCaption(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group mb-3">
          <input
            type="file"
            multiple
            accept="image/jpeg, image/png, image/gif, image/webp"
            className="form-control"
            onChange={handleFileSelection}
          />
        </div>

        {/* Preview of Selected Attachments */}
        <div className="attachments-preview mb-3">
          {newPostAttachments.map((file, index) => (
            <div
              key={index}
              className="attachment-preview d-flex align-items-center mb-2"
            >
              <img
                src={file.preview}
                alt="Attachment Preview"
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  marginRight: "10px",
                }}
              />
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveAttachment(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default NewPost;
