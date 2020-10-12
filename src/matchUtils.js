import images from "./images";

export const getCivilizationImage = (civilization, orientation) => {
  return images[`${civilization}${orientation}`];
};

export const getCountryImage = (player) =>
  `https://raw.githubusercontent.com/lipis/flag-icon-css/master/flags/1x1/${player.country.toLowerCase()}.svg`;

export const getGameType = (match) => {
  switch (match.leaderboard) {
    case "Unranked":
      return "U";
    case "1v1 Death Match":
    case "Team Death Match":
      return "DM";
    case "1v1 Random Map":
    case "Team Random Map":
      return "RM";
    default:
      return "";
  }
};
