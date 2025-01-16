import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import PostImage from "../components/PostImage";
import Swal from "sweetalert2"; // Import SweetAlert
import "../css/Profile.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import Slider from "react-slick";

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); // State for selected post
  const debounceRef = useRef(null);

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
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(`v1/users/${username}`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    const debounceFetchProfile = debounce(fetchUserProfile, 200);
    debounceFetchProfile();
  }, [username]);

  if (loading) return <div>Loading...</div>;

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null); // Close the modal by resetting the selected post
  };

  const handleDeletePost = async () => {
    Swal.fire({
      title: "Are you sure you want to delete this post?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`v1/posts/${selectedPost.id}`);
          Swal.fire("Deleted!", "Your post has been deleted.", "success");
          // Refresh the profile page after deletion
          setUser((prevUser) => ({
            ...prevUser,
            posts: prevUser.posts.filter((post) => post.id !== selectedPost.id),
          }));
          closeModal(); // Close the modal
        } catch (error) {
          Swal.fire("Error!", "There was an issue deleting the post.", "error");
        }
      }
    });
  };

  return (
    <div className="container profile-container">
      <div className="card px-5 py-4">
        {user && (
          <>
            <div className="profile-header border-bottom">
              <div className="profile-image-container">
                <img
                  src={`https://www.gravatar.com/avatar/?d=mp&s=150`} // Use a placeholder for now
                  alt={user.username}
                  className="profile-image"
                />
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{user.full_name}</h2>
                <p className="profile-username">@{user.username}</p>
                {!user.is_private && (
                  <>
                    <p className="profile-bio">{user.bio}</p>
                  </>
                )}
              </div>
            </div>

            <div className="profile-posts">
              {user.is_private ? (
                <h5>
                  <i class="fas fa-lock"></i> The account is private
                </h5>
              ) : (
                <>
                  <h6>{user.posts_count} Posts</h6>
                  <div className="posts-grid">
                    {user.posts &&
                      user.posts.map((post) => (
                        <div
                          className="post-card"
                          key={post.id}
                          onClick={() => handlePostClick(post)}
                        >
                          <PostImage
                            key={post.id}
                            storagePath={post.attachments[0]?.storage_path}
                          />
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Modal to display post details */}
        {selectedPost && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal-content px-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header px-3">
                {localStorage.getItem("username") === username && (
                  <div className="post-options">
                    <i
                      className="fas fa-trash text-danger mb-3"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from opening when clicking the options icon
                        handleDeletePost();
                      }}
                    ></i>
                  </div>
                )}
              </div>
              <Slider
                dots={true}
                infinite={false}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                style={{ marginBottom: "2rem" }}
              >
                {selectedPost.attachments.map((attachment) => (
                  <PostImage
                    key={attachment.id}
                    storagePath={attachment.storage_path}
                  />
                ))}
              </Slider>
              <div className="modal-body mt-2 px-3">
                <p>
                  <strong>{username}</strong> {selectedPost.caption}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
