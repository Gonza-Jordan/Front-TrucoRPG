const backendHost = `${window.location.hostname}:5001`;

export const environment = {
  production: false,
  apiUrl: `http://${backendHost}`,
  hubUrl: `http://${backendHost}/gamehub`,
};
