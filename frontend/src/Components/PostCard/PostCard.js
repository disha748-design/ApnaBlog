import React from "react";
import { Link } from "react-router-dom";
import styles from "./PostCard.module.css";

export default function PostCard({ post }) {
  return (
    <div className={styles.card}>
      <Link to={`/post/${post.id}`} className={styles.title}>{post.title}</Link>
      <p className={styles.meta}>
        By {post.authorUsername} • {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <div className={styles.stats}>
        <span>❤️ {post.likesCount}</span>
        <span>💬 {post.commentsCount}</span>
        <span>👁️ {post.viewsCount}</span>
        <span>🖼️ {post.imagesCount}</span>
      </div>
    </div>
  );
}
