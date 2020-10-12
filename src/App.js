import React, { useState, useEffect, useCallback } from "react";

import Template from "./components/Template";

import { doFetch, getQueryParam } from "./utils";
import { API_URL } from "./constants";

const App = () => {
  const profileId = getQueryParam("profile_id");
  const steamId = getQueryParam("steam_id");
  const [match, setMatch] = useState();
  const [players, setPlayers] = useState();

  const fetchData = useCallback(() => {
    var options = { headers: { Origin: window.location.href } };
    var params = {
      ...(profileId && { profile_id: profileId }),
      ...(steamId && { steam_id: steamId }),
    };

    doFetch(`${API_URL}/match`, options, params)
      .then((response) => {
        response.json().then((data) => {
          if (data.match && data.match.match_id) {
            setMatch(data.match);
            setPlayers(data.players);
            console.log(`Last match found: ${data.match.match_id}`);
          }
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [profileId, steamId]);

  useEffect(() => {
    setTimeout(fetchData, 500);
    const pollingId = setInterval(fetchData, 30 * 1000);

    return () => {
      clearInterval(pollingId);
    };
  }, [fetchData]);

  return (
    <>{match && players && <Template match={match} players={players} />}</>
  );
};

export default App;
