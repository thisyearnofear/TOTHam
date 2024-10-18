"use client";

import React from "react";
import { useThreeScene } from "../hooks/useThreeScene";

export default function Home() {
  const sceneRef = useThreeScene();

  return (
    <div className="relative w-full h-screen">
      {/* THREE.js Scene */}
      <div id="world" ref={sceneRef}></div>

      {/* Instructions */}
      <div id="instructions">
        ^<br />
        Where da goodies ?
        <br />
        <span className="lightInstructions">
          Gib me
          <br />
          da ham 🍖
        </span>
      </div>

      {/* Credits */}
      <div id="credits">
        <p>
          <a
            href="https://warpcast.com/tipothehat"
            target="_blank"
            rel="noopener noreferrer"
          >
            @TOTH
          </a>{" "}
          |{" "}
          <a
            href="https://warpcast.com/~/channel/tipothehat"
            target="_blank"
            rel="noopener noreferrer"
          >
            /tipothehat
          </a>
        </p>
      </div>

      {/* Audius Embed */}
      <div id="audius-embed">
        <iframe
          src="https://audius.co/embed/track/rE4XN?flavor=compact"
          width="100%"
          height="120"
          allow="encrypted-media"
          style={{ border: "none" }}
        ></iframe>
      </div>
    </div>
  );
}
