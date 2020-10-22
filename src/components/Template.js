import React, { useState, useEffect, useMemo, memo } from "react";
import _ from "lodash";

import {
  getCivilizationImage,
  getCountryImage,
  getMatchType,
} from "../matchUtils";
import { getName, getWinrate } from "../playerUtils";
import { COLORS } from "../constants";
import images from "../images";

// 1814px * 378px

const SCALE = 1;

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

    // sort teams by number of players asc
    return Object.values(_teams).sort((x, y) => x.length - y.length);
  }, [players]);

  useEffect(() => {
    if (teams.length > 2) {
      const message = "More than 2 teams are not supported.";
      setError(message);
      console.log(message);
    }
  }, [teams]);

  const nTeamPlayers = useMemo(() => teams.map((x) => x.length), [teams]);

  const matchup = `${nTeamPlayers[0]}v${nTeamPlayers[1]}`;

  console.log(matchup);

  const background = {
    width: 480 * SCALE,
    height: 100 * SCALE,
  };
  const color = {
    height: 4.5 * SCALE,
  };
  const tile = {
    width: background.width / 4,
    height: background.height / 2,
  };
  const fontSizes = {
    name: 10 * SCALE,
    rating: 8.5 * SCALE,
    matchBox: 9 * SCALE,
  };

  const scaleNames = () => {
    const defaultYPosition = 0;
    const defaultHeight = tile.height * 0;
    const maxWidth = tile.width * 0.8;

    const elements = _.flatten(
      teams.map((teamPlayers, team) => {
        return teamPlayers.map((_, index) => {
          const element = document.getElementById(`name-${team}-${index}`);
          if (element) {
            element.style.fontSize = fontSizes.name + "px";
          }
          return element;
        });
      })
    );

    if (elements.some((element) => !element)) {
      return;
    }

    const elementScale = Math.min(
      1,
      ...elements.map((element) => maxWidth / element.getBBox().width)
    );
    const value = fontSizes.name * elementScale;

    for (const element of elements) {
      // resize the name
      element.style.fontSize = value.toFixed(4) + "px";

      // center textbox on flag
      element.setAttributeNS(
        null,
        "y",
        defaultYPosition - (defaultHeight * (1 - elementScale)) / 4
      );
    }
  };

  const translateRatings = () => {
    teams.forEach((teamPlayers, team) => {
      teamPlayers.forEach((_, index) => {
        const element = document.getElementById(
          `rating-group-${team}-${index}`
        );
        if (element) {
          const boundingBox = element.getBBox();
          const x = boundingBox.x < 0 ? -boundingBox.x : 0;
          const width = boundingBox.width;
          element.setAttributeNS(
            null,
            "transform",
            `translate(${
              isSecondTeam(team)
                ? x + tile.width * 0.04
                : x + tile.width * 0.96 - width
            }, ${tile.height * 0.8})`
          );
        }
      });
    });
  };

  useEffect(() => {
    scaleNames();
    translateRatings();
  }, [teams]);

  const isSecondTeam = (team) => {
    return team === 1;
  };

  const isSecondRow = (team, index) => {
    switch (matchup) {
      case "1v1":
      case "1v2":
        return false;
      case "1v3":
        return isSecondTeam(team) ? index >= 1 : false;
      case "1v4":
        return isSecondTeam(team) ? index >= 2 : false;
      case "2v2":
        return index >= 1;
      case "2v3":
      case "2v4":
        return isSecondTeam(team) ? index >= 2 : index >= 1;
      case "3v3":
        return isSecondTeam(team) ? index >= 1 : index >= 2;
      case "3v4":
      case "4v4":
        return index >= 2;
    }
  };

  const isSecondColumn = (team, index) => {
    switch (matchup) {
      case "1v1":
        return false;
      case "1v2":
        return isSecondTeam(team) && index === 1;
      case "1v3":
        return isSecondTeam(team) && index % 2 === 0;
      case "1v4":
        return isSecondTeam(team) && index % 2 === 1;
      case "2v2":
        return false;
      case "2v3":
      case "2v4":
        return isSecondTeam(team) && index % 2 === 1;
      case "3v3":
        return isSecondTeam(team) ? index % 2 === 1 : index % 2 === 0;
      case "3v4":
        return isSecondTeam(team) ? index % 2 === 1 : index >= 1;
      case "4v4":
        return index % 2 === 1;
    }
  };

  const positionTranslate = (team, index) => {
    let x = 0;
    let y = isSecondRow(team, index) ? tile.height : 0;

    // first team start
    switch (matchup) {
      case "1v1":
      case "1v3":
      case "2v2":
        x += tile.width * 2;
        break;
      case "1v2":
      case "1v4":
      case "2v3":
      case "2v4":
      case "3v3":
        x += tile.width;
        break;
    }

    // second team start
    if (isSecondTeam(team, index)) {
      switch (matchup) {
        case "1v1":
        case "1v2":
        case "1v4":
        case "2v2":
        case "2v3":
        case "2v4":
        case "3v3":
          x += tile.width;
          break;
        case "3v4":
        case "4v4":
          x += tile.width * 2;
          break;
      }
    }

    // second column start
    if (isSecondColumn(team, index)) {
      x += tile.width;
    }

    console.log(
      "team",
      team,
      "index",
      index,
      "isSecondTeam",
      isSecondTeam(team, index),
      "isSecondRow",
      isSecondRow(team, index),
      "isSecondColumn",
      isSecondColumn(team, index),
      x,
      y
    );

    return `translate(${x}, ${y})`;
  };

  return error ? (
    <div style={{ padding: "10px", color: "red" }}>{error}</div>
  ) : (
    <Wrapper background={background}>
      <Defs teams={teams} background={background} tile={tile} />
      <Background matchup={matchup} />
      {teams.map((teamPlayers, team) => {
        return teamPlayers.map((player, index) => {
          return (
            <g
              key={player.name || `ai-${index}`}
              transform={positionTranslate(team, index)}
            >
              <PlayerColor
                team={team}
                index={index}
                tile={tile}
                color={color}
                isSecondColumn={isSecondColumn}
                isSecondTeam={isSecondTeam}
              />
              <CivilizationImage
                player={player}
                team={team}
                index={index}
                tile={tile}
                color={color}
                isSecondTeam={isSecondTeam}
              />
              <PlayerNameCountry
                player={player}
                team={team}
                index={index}
                tile={tile}
                fontSizes={fontSizes}
                isSecondTeam={isSecondTeam}
              />
              <Rating
                player={player}
                team={team}
                index={index}
                tile={tile}
                fontSizes={fontSizes}
                isSecondTeam={isSecondTeam}
              />
            </g>
          );
        });
      })}
      <MatchBox
        match={match}
        nTeamPlayers={nTeamPlayers}
        background={background}
        fontSizes={fontSizes}
      />
    </Wrapper>
  );
};

const Wrapper = ({ children, background }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      width={`${background.width}mm`}
      height={`${background.height}mm`}
      viewBox={`0 0 ${background.width} ${background.height}`}
      style={{ enableBackground: "new" }}
    >
      {children}
    </svg>
  );
};

const Defs = ({ teams }) => {
  return (
    <defs>
      {teams.map((teamPlayers, team) => {
        return teamPlayers.map((player, index) => (
          <linearGradient
            key={`linear-gradient-${team}-${index}`}
            id={`linear-gradient-${team}-${index}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{
                stopColor: COLORS[player.color],
                stopOpacity: 0,
              }}
            />
            <stop
              offset="50%"
              style={{
                stopColor: COLORS[player.color],
                stopOpacity: 1,
              }}
            />
            <stop
              offset="100%"
              style={{
                stopColor: COLORS[player.color],
                stopOpacity: 0,
              }}
            />
          </linearGradient>
        ));
      })}
      <filter id="filter-blur" style={{ colorInterpolationFilters: "sRGB" }}>
        <feGaussianBlur result="blur" stdDeviation="0.3 0.3" />
      </filter>

      {/* 1vX */}
      <clipPath id="clip-path-1v1" clipPathUnits="objectBoundingBox">
        <rect x="0.5" y="0" width="0.5" height="0.5" />
      </clipPath>
      <clipPath id="clip-path-1v2" clipPathUnits="objectBoundingBox">
        <rect x="0.25" y="0.5" width="0.75" height="0.5" />
      </clipPath>
      <clipPath id="clip-path-1v3" clipPathUnits="objectBoundingBox">
        <rect x="0.5" y="0" width="0.5" height="1" />
      </clipPath>
      <clipPath id="clip-path-1v4" clipPathUnits="objectBoundingBox">
        <rect x="0.25" y="0" width="0.75" height="1" />
      </clipPath>

      {/* 2vX */}
      <clipPath id="clip-path-2v2" clipPathUnits="objectBoundingBox">
        <rect x="0.5" y="0" width="0.5" height="1" />
      </clipPath>
      <clipPath id="clip-path-2v3" clipPathUnits="objectBoundingBox">
        <rect x="0.25" y="0" width="0.75" height="1" />
      </clipPath>
      <clipPath id="clip-path-2v4" clipPathUnits="objectBoundingBox">
        <rect x="0.25" y="0" width="0.75" height="1" />
      </clipPath>

      {/* 3vX */}
      <clipPath id="clip-path-3v3" clipPathUnits="objectBoundingBox">
        <rect x="0.25" y="0" width="0.75" height="1" />
      </clipPath>
    </defs>
  );
};

const Background = ({ matchup }) => {
  return (
    <g key="background-image">
      <image
        xlinkHref={images.Background}
        x="0"
        y="0"
        width="100%"
        height="100%"
        style={{
          filter: "url(#filter-blur)",
          clipPath: `url(#clip-path-${matchup})`,
          imageRendering: "optimizeQuality",
        }}
        preserveAspectRatio="none"
      />
    </g>
  );
};

const PlayerColor = ({ team, index, tile, color, isSecondColumn }) => {
  return (
    <rect
      x="0"
      y="0"
      width={tile.width}
      height={color.height}
      style={{
        fill: `url(#linear-gradient-${team}-${index})`,
        fillOpacity: 1,
        ...(!isSecondColumn(team, index) && {
          transformBox: "fill-box",
          transformOrigin: "center",
          transform: `rotate(180deg)`,
        }),
      }}
    />
  );
};

const CivilizationImage = ({
  player,
  team,
  index,
  tile,
  color,
  isSecondTeam,
}) => {
  const size = tile.height - color.height - tile.height * 0.25;

  return (
    <image
      id={`civilization-image-${team}-${index}`}
      xlinkHref={getCivilizationImage(
        player.civilization,
        isSecondTeam(team) ? "Right" : "Left"
      )}
      x={isSecondTeam(team) ? tile.width - size : 0}
      y={color.height + tile.height * 0.25}
      width={size}
      height={size}
      style={{ imageRendering: "optimizeQuality" }}
    />
  );
};

const PlayerNameCountry = ({
  player,
  team,
  index,
  tile,
  fontSizes,
  isSecondTeam,
}) => {
  return (
    <g
      transform={`translate(${
        tile.width * (isSecondTeam(team) ? 0.12 : 0.88)
      }, ${tile.height * 0.3})`}
    >
      <text
        id={`name-${team}-${index}`}
        style={{
          fontFamily: "Britannic Bold, sans-serif",
          fontSize: `${fontSizes.name}px`,
          textAlign: isSecondTeam(team) ? "start" : "end",
          textAnchor: isSecondTeam(team) ? "start" : "end",
          lineHeight: 1.25,
          fill: "#FFFFFF",
          fillOpacity: 1,
        }}
      >
        {player.is_ai ? `AI ${index + 1}` : getName(player)}
      </text>
      {player.country && (
        <image
          id={`country-${team}-${index}`}
          xlinkHref={getCountryImage(player)}
          x={tile.width * (isSecondTeam(team) ? -0.075 : 0.025)}
          y={tile.height * -0.122}
          width={tile.height * 0.111}
          height={tile.height * 0.111}
          style={{ imageRendering: "optimizeQuality" }}
        />
      )}
    </g>
  );
};

const Rating = ({ player, team, index, tile, fontSizes, isSecondTeam }) => {
  const textStyle = {
    fontFamily: "Britannic Bold, sans-serif",
    fontSize: `${fontSizes.rating}px`,
    lineHeight: 1.25,
    fill: "#FFFFFF",
    fillOpacity: 1,
  };

  return (
    <g id={`rating-group-${team}-${index}`}>
      {!player.is_ai &&
        ("rating" in player ? (
          <>
            <g>
              <text
                id={`rank-${team}-${index}`}
                x="0"
                y="0"
                style={{
                  ...textStyle,
                  textAlign: "end",
                  textAnchor: "end",
                }}
              >
                {"rank" in player ? `#${player.rank} |` : "/ |"}
              </text>
              <text
                id={`winrate-${team}-${index}`}
                x="0"
                y={tile.height * 0.15}
                style={{
                  ...textStyle,
                  textAlign: "end",
                  textAnchor: "end",
                }}
              >
                <tspan>{getWinrate(player)}% |</tspan>
              </text>
            </g>
            <g transform={`translate(${tile.width * 0.015}, 0)`}>
              <text
                id={`rating-${team}-${index}`}
                x="0"
                y="0"
                style={{
                  ...textStyle,
                  textAlign: "start",
                  textAnchor: "start",
                }}
              >
                {`${player.rating} MMR`}
              </text>
              <text
                x="0"
                y={tile.height * 0.15}
                style={{
                  ...textStyle,
                  textAlign: "start",
                  textAnchor: "start",
                }}
              >
                <tspan
                  id={`wins-${team}-${index}`}
                  style={{ fill: "#1FAF28" }}
                >{` ${player.wins}W `}</tspan>
                <tspan
                  id={`losses-${team}-${index}`}
                  style={{ fill: "#E34C39" }}
                >
                  {player.losses}L
                </tspan>
              </text>
            </g>
          </>
        ) : (
          <g
            transform={
              isSecondTeam(team)
                ? `translate(${tile.width * -0.085}, ${tile.height * 0.078})`
                : `translate(${tile.width * 0.01}, ${tile.height * 0.078})`
            }
          >
            <text
              id={`rank-rating-${team}-${index}`}
              x="0"
              y="0"
              style={{
                ...textStyle,
                textAlign: "start",
                textAnchor: "start",
              }}
            >
              unranked
            </text>
          </g>
        ))}
    </g>
  );
};

const MatchBox = ({ match, nTeamPlayers, background, fontSizes }) => {
  const width = background.width * 0.0625;
  const height = background.height * 0.555;
  const topOffset = background.height * 0.078;

  const textStyle = {
    fontFamily: "Britannic Bold, sans-serif",
    fontSize: `${fontSizes.matchBox}px`,
    lineHeight: 1.25,
    textAlign: "center",
    textAnchor: "middle",
    fill: "#FFFFFF",
    fillOpacity: 1,
  };

  const lineStyle = {
    stroke: "#FFFFFF",
    strokeWidth: 0.6,
  };

  return (
    <g>
      {/* <g transform={`translate(${(background.width - width) / 2}, ${topOffset})`}>
        <rect
          width={width}
          height={height}
          style={{
            ...lineStyle,
            fill: "none",
          }}
        />
        <image
          id="swords-image"
          xlinkHref={images.Swords}
          x={(width * 0.08) / 2}
          y="0"
          width={width * 0.92}
          height={height * 0.54}
          style={{ imageRendering: "optimizeQuality" }}
        />
        <g transform={`translate(${width / 2}, 0)`}>
          <text
            id="matchup-type"
            x="0"
            y={height * 0.7}
            style={{ ...textStyle, fontWeight: "bold", letterSpacing: "0.5px" }}
          >
            {`${nTeamPlayers[0]}v${
              nTeamPlayers.length > 1 ? nTeamPlayers[1] : 0
            }`}
          </text>
          <text id="game-type" x="0" y={height * 0.911} style={textStyle}>
            {getMatchType(match)}
          </text>
        </g>
      </g> */}
      <line
        x1={background.width / 2}
        y1="0"
        x2={background.width / 2}
        y2={background.height / 2}
        style={lineStyle}
      />
      {/* <line
        x1={tile.width}
        y1={height + topOffset}
        x2={tile.width}
        y2={totalHeight}
        style={lineStyle}
      /> */}
    </g>
  );
};

function areEqual(prevProps, nextProps) {
  return prevProps.match.match_id === nextProps.match.match_id;
}

export default memo(Template, areEqual);
