import Constants from "./Constants";
const state = {
  loggedIn: false,
  token: "",
  name: "",
  event_id: 6,
  actions: [],
  currentEvent: null
};
const APICALLS = {
  ATTENDEE_LIST: {
    url: "attendees",
    method: "POST",
    requiresToken: true
  },
  ATTENDEE_ACTION: {
    url: "attendees/push",
    method: "POST",
    requiresToken: true
  },
  CLIENT_STATUS: {
    url: "client/status",
    method: "POST",
    requiresToken: true
  },
  CLIENT_LOGIN: {
    url: "client/login",
    method: "POST",
    requiresToken: false
  }
};

class Database {
  constructor() {
    // Load actions
    state.actions = JSON.parse(window.localStorage.getItem('actions')) || [];
    state.name = window.localStorage.getItem('name') || '';
    // If token is invalid
    var token = window.localStorage.getItem('token') || '';
    if (token.length > 0 && token !== "null") {
      state.loggedIn = true;
      state.token = token;
    }
    this.apiCall(APICALLS.CLIENT_STATUS, {}).then(data => {
      console.log("Client valid");
    }).catch(data => {
      if (data !== Constants.API_ERROR_TIMEOUT) {
        console.log("Client invalid");
        state.loggedIn = false;
        state.token = '';
        state.name = '';
      } else {
        console.log("Server timeout");
      }
    });
  }

  apiCall(request, params) {
    // request is type of APICALLS
    var body = new FormData();
    if (request.requiresToken) {
      body.append('token', state.token);
    }
    body.append('params', JSON.stringify(params));
    if (request === APICALLS.CLIENT_LOGIN) {
      body = new FormData();
      body.append('username', params.username);
      body.append('password', params.password);
    }
    var form = {
      body: body,
      method: request.method
    };

    return new Promise((resolve, reject) => {
      fetch(Constants.API_Location + request.url, form).then(results => {
        try {
          if (!results.ok) {
            throw results
          }
          return results.json();
        } catch (err) {
          reject("json could not be parsed");
        }
      }).then(data => {
        try {
          if (data.status) {
            resolve(data);
          } else {
            reject(data);
          }
        } catch (err) {
          reject("json doesn't include status");
        }
      });
      setTimeout(reject, 2000, Constants.API_ERROR_TIMEOUT);
    });
  }

  client_clearActions() {
    window.localStorage.setItem('actions', null);
    state.actions = [];
  }

  client_loggedIn() {
    return state.loggedIn;
  }

  client_name() {
    return state.name;
  }

  client_logout() {
    state.loggedIn = false;
    state.name = '';
    window.localStorage.setItem('token', "");
    window.localStorage.setItem('name', "");
  }

  client_login(username, password) {
    return new Promise((resolve, reject) => {
      console.log("logging in");
      this.apiCall(APICALLS.CLIENT_LOGIN, {
        username: username,
        password: password
      }).then(data => {
        resolve(data);
        state.loggedIn = true;
        state.token = data.token;
        state.name = data.name;
        window.localStorage.setItem('token', data.token);
        window.localStorage.setItem('name', data.name);
      }).catch(data => {
        THE_DATABASE.client_logout();
        reject(data);
      });
    });
  }

  event_getAttendees() {
    return this.apiCall(APICALLS.ATTENDEE_LIST, {
      'event_id': 6
    });
  }
  event_addAttendees(listOfAttendees) {
    for (var v = 0; v < listOfAttendees.length; v += 1) {
      var attendee = listOfAttendees[v];
      var attendeeJSON = JSON.parse(JSON.stringify(attendee));
      attendeeJSON['action'] = "ADD";
      attendeeJSON['event_id'] = state.event_id;
      this.apiCall(APICALLS.ATTENDEE_ACTION, attendeeJSON).then(data => {
        console.log("SUCCESS");
      }).catch(data => {
        this.save_apiCall(APICALLS.ATTENDEE_ACTION, attendeeJSON);
      });
    }
  }
  event_updateAttendee(attendeeJSON) {
    // Requires id, value, key
    attendeeJSON['action'] = "UPDATE";
    attendeeJSON['event_id'] = state.event_id;
    this.apiCall(APICALLS.ATTENDEE_ACTION, attendeeJSON).then(data => {
      console.log("SUCCESS");
    }).catch(data => {
      this.save_apiCall(APICALLS.ATTENDEE_ACTION, attendeeJSON);
    });
  }

  save_apiCall = (action, params) => {
    state.actions.push({
      action: action,
      params: params
    });
    window.localStorage.setItem('actions', JSON.stringify(state.actions));
  }

  push_apiCall = () => {
    if (state.actions.length == 0) {
      return;
    }
    var actionsToDo = state.actions;
    state.actions = [];
    window.localStorage.setItem('actions', JSON.stringify(state.actions));
    for (var v = 0; v < actionsToDo.length; v += 1) {
      const action = actionsToDo[v].action;
      const params = actionsToDo[v].params;
      this.apiCall(actionsToDo[v].action, actionsToDo[v].params).then(data => {
        console.log("SUCCESS");
      }).catch(data => {
        this.save_apiCall(action, params);
      });
    }
  }

  get_apiCallLength = () => {
    return state.actions.length;
  }

  clear_apiCall = () => {
    state.actions = [];
    window.localStorage.setItem('actions', JSON.stringify(state.actions));
  }
}
const THE_DATABASE = new Database();

export default THE_DATABASE;
