import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/api";
import Swal from "sweetalert2";
import PostImage from "../components/PostImage";
import Slider from "react-slick";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState([]);
  const scrollContainerRef = useRef(null);
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

  // Fetch users for Explore People section
  const fetchUsers = async () => {
    try {
      const response = await api.get("/v1/users", {
        headers: {
          Authorization: `Bearer <token>`,
        },
      });
      setUsers(response.data.users);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Failed to fetch users, please try again later.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch posts from API
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const currentSize = page === 0 ? 10 : 7;
      const response = await api.get(
        `v1/posts?page=${page}&size=${currentSize}`
      );
      setPage((prevPage) => prevPage + 1);
      setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
      setHasMore(response.data.posts.length > 0);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch posts, please try again later.",
        icon: "error",
      });
    }
  };

  // Debounced version of fetchPosts
  const debounceFetchPosts = debounce(fetchPosts, 200);

  // Detect when user has scrolled to the bottom
  const handleScroll = () => {
    if (
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
      scrollContainerRef.current.scrollHeight - 10
    ) {
      if (hasMore && !loading) {
        setLoading(true);
        debounceFetchPosts();
      }
    }
  };

  // UseEffect to trigger API call when the component mounts
  useEffect(() => {
    if (hasMore && !loading) {
      setLoading(true);
      debounceFetchPosts();
    }
  }, [hasMore]);

  // UseEffect to add and clean up scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [loading, hasMore]);

  return (
    <div className="container home-container">
      <div
        className="col-lg-8 mt-4 px-2 post-container"
        ref={scrollContainerRef}
      >
        {/* Posts Section */}
        <div className="posts">
          {posts.map((post) => (
            <div key={post.id} className="post card mb-4">
              <div className="card-body">
                {/* User Info */}
                <div className="d-flex align-items-center mb-3">
                  <NavLink className="" to={`/profile/${post.user.username}`}>
                    <img
                      src={`https://www.gravatar.com/avatar/?d=mp&s=40`}
                      alt={post.user.full_name}
                      className="rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        marginRight: "10px",
                      }}
                    />
                  </NavLink>
                  <div>
                    <NavLink
                      className="clean-link text-muted post-username d-flex"
                      to={`/profile/${post.user.username}`}
                    >
                      <h6 className="mb-0">{post.user.full_name}</h6>
                    </NavLink>
                  </div>
                </div>

                {/* Attachments (Carousel) */}
                <Slider
                  dots={true}
                  infinite={false}
                  speed={500}
                  slidesToShow={1}
                  slidesToScroll={1}
                  style={{ marginBottom: "2rem" }}
                >
                  {post.attachments.map((attachment) => (
                    <PostImage
                      key={attachment.id}
                      storagePath={attachment.storage_path}
                    />
                  ))}
                </Slider>

                {/* Post Caption */}
                <div className="caption">
                  <p>
                    <NavLink
                      className="clean-link text-muted post-username"
                      to={`/profile/${post.user.username}`}
                    >
                      @{post.user.username}
                    </NavLink>
                    {post.caption}
                  </p>
                </div>

                {/* Created Date */}
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Show loading message when more posts are being fetched */}
        {loading && <div className="text-center mb-3">Loading...</div>}
      </div>
      <div className="col-lg-4 mt-4 px-2">
        {/* New Post Section */}
        <div className="card">
          <NavLink
            className="btn btn-outline-primary btn-lg btn-block"
            to="/new-post"
          >
            Create a New Post
          </NavLink>
        </div>
        <div className="card my-4 p-3">
          <h5>Explore People</h5>
          <div className="explore-people p-3 mt-3">
            {users.map((user) => (
              <NavLink
                className="clean-link d-flex align-items-center mb-3 border-bottom"
                to={`/profile/${user.username}`}
              >
                <img
                  src={`https://www.gravatar.com/avatar/?d=mp&s=40`}
                  alt={user.full_name}
                  className="rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    marginRight: "10px",
                  }}
                />
                <div>
                  <h6 className="mb-0 mt-1">{user.full_name}</h6>
                  <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                    {user.is_private
                      ? "This account is private."
                      : user.bio
                      ? user.bio.length > 50
                        ? `${user.bio.substring(0, 45)}...`
                        : user.bio
                      : "No bio available."}
                  </p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
