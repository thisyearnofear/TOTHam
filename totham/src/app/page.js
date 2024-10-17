"use client";

import { ThreeScene } from "../components/ThreeScene";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <ThreeScene />
      <div id="instructions" className={styles.instructions}>
        <span>^</span>
        <br />
        Where Da Ham?
        <br />
        <span className={styles.lightInstructions}>
          Gib Me
          <br />
          Da Goodies
        </span>
      </div>
      <div id="credits" className={styles.credits}>
        <p>
          <a href="https://warpcast.com/tipothehat" target="blank">
            @TOTH
          </a>{" "}
          |
          <a href="https://warpcast.com/~/channel/tipothehat" target="blank">
            /tipothehat
          </a>
        </p>
      </div>
    </div>
  );
}
