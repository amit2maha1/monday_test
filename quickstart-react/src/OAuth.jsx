import React, { useEffect, useState } from "react";
import { Loader } from "@vibe/core";

const OAuth = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("OAuth component mounted");
    const initializeOAuth = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("access_token") || localStorage.getItem("monday_access_token");
      console.log(accessToken, "accessToken");

      if (accessToken) {
        localStorage.setItem("monday_access_token", accessToken);
        setIsLoading(false);
      } else {
        // Redirect to start OAuth flow if no token is found
        window.location.href = "https://0be35e8ca081.apps-tunnel.monday.app/start";
      }
    };

    initializeOAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size={Loader.sizes.LARGE} />
      </div>
    );
  }

  return null;
};

export default OAuth;