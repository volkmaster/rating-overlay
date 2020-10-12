const env = process.env.REACT_APP_ENV;
export const API_URL =
  env === "prod"
    ? "https://v8wewnto9g.execute-api.eu-west-1.amazonaws.com/production"
    : env === "dev"
    ? "https://kjvs0gja0i.execute-api.eu-west-1.amazonaws.com/development"
    : "http://localhost:5000";

export const COLORS = {
  blue: "rgba(0,120,215,1)",
  red: "rgba(236,9,9,1)",
  green: "rgba(3,251,3,1)",
  yellow: "rgba(255,241,0,1)",
  teal: "rgba(24,241,243,1)",
  purple: "rgba(254,3,251,1)",
  gray: "rgba(211,211,211,1)",
  orange: "rgba(246,149,20,1)",
};
