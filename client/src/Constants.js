import Alert from 'react-s-alert';

class Constants {
  API_Location = "/api/v1/";
  DONT_PRINT_NAME = "None";
  API_ERROR_TIMEOUT = 'request timed out';
  AlertSuccess = (message) => {
    Alert.success(message, ALERT_SETTINGS);
  };
  AlertWarning = (message) => {
    Alert.warning(message, ALERT_SETTINGS);
  };
}
const CONSTANTS = new Constants();


const ALERT_SETTINGS = {
  position: 'top-right',
  effect: 'slide',
  beep: false,
  timeout: 3000,
  offset: 100
};

export default CONSTANTS;
