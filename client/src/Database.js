import Constants from "./Constants";
const state = {
  loggedIn: false,
  token: "",
  name: "",
  actions: [],
  currentEvent: null
};
const APICALLS = {
  ATTENDEE_LIST: ["attendees", "POST"]
};

class Database {
  constructor() {
    // Load actions
    state.actions = window.localStorage.getItem('actions', null) || [];
    state.name = window.localStorage.getItem('name', null) || '';
    // If token is invalid
    var token = window.localStorage.getItem('token', null) || '';
    if (token.length > 0 && token != "null") {
      state.loggedIn = true;
      state.token = token;
    }

    var body = new FormData();
    body.append('token', state.token);
    this.apiCall("client/status", {
      body: body,
      method: "POST"
    }).then(data => {
      console.log("Client valid");
    }).catch(data => {
      console.log("Client invalid");
      state.loggedIn = false;
      state.token = '';
      state.name = '';
    });
  }

  apiCall(request, body) {
    if (request == "")
    {
     body: body,
     method: "POST"
   }
    return new Promise((resolve, reject) => {
      fetch(Constants.API_Location + request, form).then(results => {
        try {
          if (!results.ok) { throw results }
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
      setTimeout(reject, 1000, 'request timed out');
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
      var body = new FormData();
      body.append('username', username);
      body.append('password', password);
      this.apiCall("client/login", {
        body: body,
        method: "POST"
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
    return new Promise((resolve, reject) => {
      var body = new FormData();
      body.append('token', state.token);
      body.append('event_id', 6);
      this.apiCall("attendees", {
        body: body,
        method: "POST"
      }).then(data =>  {
        console.log("Get Attendees");
        resolve(data)
      }).catch(data => {
        reject(data);
      });
    });
  }
  event_addAttendees(listOfAttendees) {
    for (var v=0;v<listOfAttendees.length;v+=1) {
      var attendee = listOfAttendees[v];
      var attendeeJSON = JSON.parse(JSON.stringify(attendee));
      attendeeJSON['action'] = "ADD";
      attendeeJSON['event_id'] = 6;
      var body = new FormData();
      body.append('token', state.token);
      body.append('actionDict', JSON.stringify(attendeeJSON));
      this.apiCall("attendees/push", {
        body: body,
        method: "POST"
      }).then(data =>  {
        console.log("SUCCESS");
      }).catch(data => {
        this.save_apiCall(body, "POST", "attendees/push" )
      });
    }
  }

  save_apiCall(body, method, url) {

  }
}
const THE_DATABASE = new Database();

export default THE_DATABASE;
