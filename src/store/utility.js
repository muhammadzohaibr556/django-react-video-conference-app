export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const server_endpoint = "127.0.0.1:8000";
export const endpoint = "http://127.0.0.1:8000";

// export const server_endpoint = "0c9473e26700.ngrok.io"; // for ngrok testing
// export const endpoint = "https://0c9473e26700.ngrok.io"; // for ngrok testing
