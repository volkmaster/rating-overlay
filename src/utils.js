export const doFetch = (path, options, params) => {
  var url = new URL(path);
  if (params != null) {
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );
  }
  return fetch(url, options);
};

export const getQueryParam = (name) => {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
};
