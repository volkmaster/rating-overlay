export const getName = (player) =>
  player.name.length > 20 ? player.name.substr(0, 17) + "..." : player.name;

export const getRank = (player) =>
  "rank" in player ? `#${player.rank} |` : "# / |";

export const getWinrate = (player) =>
  ((100 * player.wins) / (player.wins + player.losses)).toFixed(0);
