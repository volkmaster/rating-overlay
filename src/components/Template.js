import React, { useState, useEffect, useMemo, Fragment } from "react";
import _ from "lodash";

import {
  getCivilizationImage,
  getCountryImage,
  getGameType,
} from "../matchUtils";
import { getName, getWinrate } from "../playerUtils";
import { COLORS } from "../constants";
import images from "../images";

const WIDTH = 400;
const HEIGHT = 90;

const Template = ({ match, players }) => {
  const [error, setError] = useState("");

  const teams = useMemo(() => {
    let _teams = _.groupBy(players, (player) => player.team);

    // workaround for when all players have the same value of the team property
    if (_.size(_teams) === 1) {
      const teamId = Object.keys(_teams)[0];
      const allPlayers = _teams[teamId];
      _teams = { 0: [], 1: [] };
      for (let i = 0; i < allPlayers.length; i++) {
        _teams[i % 2].push(allPlayers[i]);
      }
    }

    return _teams;
  }, [players]);

  const nTeamPlayers = useMemo(
    () => Object.values(teams).map((x) => x.length),
    [teams]
  );
  const calculatedHeight = useMemo(() => HEIGHT * Math.max(...nTeamPlayers), [
    nTeamPlayers,
  ]);

  useEffect(() => {
    if (_.size(teams) > 2) {
      const message = "More than 2 teams are not supported.";
      setError(message);
      console.log(message);
    }
  }, [teams]);

  const scale = () => {
    const defaultSize = 17;
    const defaultYPosition = 0;
    const defaultHeight = 18.8;
    const maxWidth = 95;

    const elements = _.flatten(
      Object.values(teams).map((teamPlayers, i) => {
        return teamPlayers.map((_, j) => {
          const element = document.getElementById(`name-${i}-${j}`);
          if (element) {
            element.style.fontSize = defaultSize + "px";
          }
          return element;
        });
      })
    );

    if (elements.some((element) => !element)) {
      return;
    }

    const scale = Math.min(
      1,
      ...elements.map((element) => maxWidth / element.getBBox().width)
    );
    const value = defaultSize * scale;

    for (const element of elements) {
      // resize the name
      element.style.fontSize = value.toFixed(4) + "px";

      // center textbox on flag
      element.setAttributeNS(
        null,
        "y",
        defaultYPosition - (defaultHeight * (1 - scale)) / 4
      );
    }
  };

  useEffect(scale, [teams]);

  return error ? (
    <div style={{ padding: "10px", color: "red" }}>{error}</div>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      width={`${WIDTH}mm`}
      height={`${HEIGHT * 4}mm`}
      viewBox={`0 0 ${WIDTH} ${HEIGHT * 4}`}
      style={{ enableBackground: "new" }}
    >
      <defs>
        {Object.values(teams).map((teamPlayers, i) => {
          return teamPlayers.map((player, j) => (
            <linearGradient
              key={`linear-gradient-${i}-${j}`}
              id={`linear-gradient-${i}-${j}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={{
                  stopColor: COLORS[player.color],
                  stopOpacity: 1,
                }}
              />
              <stop
                offset="90%"
                style={{
                  stopColor: COLORS[player.color],
                  stopOpacity: 0,
                }}
              />
            </linearGradient>
          ));
        })}
        <filter id="filter-blur" style={{ colorInterpolationFilters: "sRGB" }}>
          <feGaussianBlur result="blur" stdDeviation="0.5 0.5" />
        </filter>
        <clipPath id="circle-clip" clipPathUnits="objectBoundingBox">
          <circle cx="0.5" cy="0.5" r="0.5" />
        </clipPath>
      </defs>

      {[...Array(Math.max(...nTeamPlayers))].map((_, i) => (
        <g key={`background-${i}`}>
          <image
            xlinkHref={images.Background}
            x="0"
            y={HEIGHT * i}
            width={WIDTH}
            height={HEIGHT}
            style={{
              filter: "url(#filter-blur)",
              imageRendering: "optimizeQuality",
            }}
            preserveAspectRatio="none"
          />
        </g>
      ))}

      {Object.values(teams).map((teamPlayers, i) => {
        return teamPlayers.map((player, j) => (
          <Fragment key={player.name}>
            <g>
              <rect
                x={i === 0 ? 0 : WIDTH / 2}
                y={HEIGHT * j}
                width={WIDTH / 2}
                height="4.5"
                style={{
                  fill: `url(#linear-gradient-${i}-${j})`,
                  fillOpacity: 1,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: `rotate(${i === 0 ? 0 : 180}deg)`,
                }}
              />
            </g>
            <g>
              <image
                id={`civilization-image-${i}-${j}`}
                xlinkHref={getCivilizationImage(
                  player.civilization,
                  i === 0 ? "Left" : "Right"
                )}
                x={i === 0 ? 0 : WIDTH - 80}
                y={4.5 + HEIGHT * j}
                width="80"
                height={HEIGHT - 4.5}
                style={{ imageRendering: "optimizeQuality" }}
              />
              <g
                transform={`translate(${i === 0 ? 160 : 240}, ${
                  30 + HEIGHT * j
                })`}
              >
                <text
                  id={`name-${i}-${j}`}
                  style={{
                    fontFamily: "Britannic Bold, sans-serif",
                    fontSize: "17px",
                    textAlign: i === 0 ? "end" : "start",
                    textAnchor: i === 0 ? "end" : "start",
                    lineHeight: 1.25,
                    fill: "#FFFFFF",
                    fillOpacity: 1,
                  }}
                >
                  {player.is_ai ? `AI ${j + 1}` : getName(player)}
                </text>
                {player.country && (
                  <image
                    id={`country-${i}-${j}`}
                    xlinkHref={getCountryImage(player)}
                    x={i === 0 ? 5 : -17}
                    y="-11"
                    width="13"
                    height="13"
                    style={{ imageRendering: "optimizeQuality" }}
                    clipPath="url(#circle-clip)"
                  />
                )}
              </g>
            </g>
            <g
              transform={`translate(${
                i === 0
                  ? WIDTH / 2 - 75
                  : "rank" in player
                  ? WIDTH / 2 + 35 + 6 * player.rank.toString().length
                  : WIDTH / 2 + 40
              }, ${72 + HEIGHT * j})`}
            >
              {!player.is_ai &&
                ("rating" in player ? (
                  <>
                    <g>
                      <text
                        id={`rank-rating-${i}-${j}`}
                        x="0"
                        y="0"
                        style={{
                          fontFamily: "Britannic Bold, sans-serif",
                          fontSize: "12px",
                          lineHeight: 1.25,
                          textAlign: "end",
                          textAnchor: "end",
                          fill: "#FFFFFF",
                          fillOpacity: 1,
                        }}
                      >
                        {"rank" in player ? `#${player.rank} |` : "/ |"}
                      </text>
                      <text
                        id={`winrate-${i}-${j}`}
                        x="0"
                        y="13"
                        style={{
                          fontFamily: "Britannic Bold, sans-serif",
                          fontSize: "12px",
                          lineHeight: 1.25,
                          textAlign: "end",
                          textAnchor: "end",
                          fill: "#FFFFFF",
                          fillOpacity: 1,
                        }}
                      >
                        <tspan>{getWinrate(player)}% |</tspan>
                      </text>
                    </g>
                    <g transform="translate(3, 0)">
                      <text
                        id={`rank-rating-${i}-${j}`}
                        x="0"
                        y="0"
                        style={{
                          fontFamily: "Britannic Bold, sans-serif",
                          fontSize: "12px",
                          lineHeight: 1.25,
                          textAlign: "start",
                          textAnchor: "start",
                          fill: "#FFFFFF",
                          fillOpacity: 1,
                        }}
                      >
                        {`${player.rating} MMR`}
                      </text>
                      <text
                        x="0"
                        y="13"
                        style={{
                          fontFamily: "Britannic Bold, sans-serif",
                          fontSize: "12px",
                          lineHeight: 1.25,
                          textAlign: "start",
                          textAnchor: "start",
                          fill: "#FFFFFF",
                          fillOpacity: 1,
                        }}
                      >
                        <tspan
                          id={`wins-${i}-${j}`}
                          style={{
                            fill: "#1FAF28",
                          }}
                        >{` ${player.wins}W `}</tspan>
                        <tspan
                          id={`losses-${i}-${j}`}
                          style={{
                            fill: "#E34C39",
                          }}
                        >
                          {player.losses}L
                        </tspan>
                      </text>
                    </g>
                  </>
                ) : (
                  <g
                    transform={
                      i === 0 ? "translate(2, 7)" : "translate(-17, 7)"
                    }
                  >
                    <text
                      id={`rank-rating-${i}-${j}`}
                      x="0"
                      y="0"
                      style={{
                        fontFamily: "Britannic Bold, sans-serif",
                        fontSize: "12px",
                        lineHeight: 1.25,
                        textAlign: "start",
                        textAnchor: "start",
                        fill: "#FFFFFF",
                        fillOpacity: 1,
                      }}
                    >
                      unranked
                    </text>
                  </g>
                ))}
            </g>
          </Fragment>
        ));
      })}

      <g>
        <g transform={`translate(${(WIDTH - 25) / 2}, 7)`}>
          <rect
            width="25"
            height="50"
            style={{
              fill: "none",
              stroke: "#FFFFFF",
              strokeWidth: 0.6,
            }}
          />
          <image
            id="swords-image"
            xlinkHref={images.Swords}
            x={(28 - 25) / 2}
            y="0"
            width="23"
            height="27"
            style={{ imageRendering: "optimizeQuality" }}
          />
          <g transform="translate(12.5, 0)">
            <text
              id="matchup-type"
              x="0"
              y="35"
              style={{
                fontFamily: "Britannic Bold, sans-serif",
                fontSize: "10px",
                fontWeight: "bold",
                lineHeight: 1.25,
                letterSpacing: "0.5px",
                textAlign: "center",
                textAnchor: "middle",
                fill: "#FFFFFF",
              }}
            >
              {`${nTeamPlayers[0]}v${
                nTeamPlayers.length > 1 ? nTeamPlayers[1] : 0
              }`}
            </text>
            <text
              id="game-type"
              x="0"
              y="45"
              style={{
                fontFamily: "Britannic Bold, sans-serif",
                fontSize: "10px",
                lineHeight: 1.25,
                textAlign: "center",
                textAnchor: "middle",
                fill: "#FFFFFF",
              }}
            >
              {getGameType(match)}
            </text>
          </g>
        </g>
        <line
          x1={WIDTH / 2}
          y1="0"
          x2={WIDTH / 2}
          y2="7"
          style={{
            stroke: "#FFFFFF",
            strokeWidth: 0.6,
          }}
        />
        <line
          x1={WIDTH / 2}
          y1={50 + 7}
          x2={WIDTH / 2}
          y2={calculatedHeight}
          style={{
            stroke: "#FFFFFF",
            strokeWidth: 0.6,
          }}
        />
      </g>
    </svg>
  );
};

export default Template;
