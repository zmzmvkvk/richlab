import React from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../css/Card.module.css";

const Card = (props) => {
  const { isLoggedIn } = useAuth();

  if (props.id === "login") {
    return (
      <div className={`${styles.card} ${styles.nonBlurred}`}>
        {props.children}
      </div>
    );
  } else {
    return (
      <div
        className={`${styles.card} ${
          isLoggedIn ? styles.nonBlurred : styles.blurred
        }`}
      >
        {props.children}
      </div>
    );
  }
};

export default Card;
