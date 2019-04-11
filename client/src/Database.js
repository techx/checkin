import Constants from "./Constants";
import Attendee from "./models/Attendee";
import Event from "./models/Event";
import User from "./models/User";
const emptyEvent = new Event("No selected event", 0);
const state = {
  login_status: 0,
  token: "",
  name: "",
  is_admin: false,
  actions: [],
  currentEvent: emptyEvent,
  id_to_event: {}
};
const APICALLS = {
  EVENT_CREATE: {
    url: "events/create",
    method: "POST",
    requiresToken: true
  },
  EVENT_DELETE: {
    url: "events/delete",
    method: "POST",
    requiresToken: true
  },
  USER_CREATE: {
    url: "users/create",
    method: "POST",
    requiresToken: true
  },
  USER_DELETE: {
    url: "users/delete",
    method: "POST",
    requiresToken: true
  },
  USER_ASSIGNEVENT: {
    url: "users/events/push",
    method: "POST",
    requiresToken: true
  },
  USER_LIST: {
    url: "users",
    method: "POST",
    requiresToken: true
  },
  EVENT_LIST: {
    url: "events",
    method: "POST",
    requiresToken: true
  },
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
    state.is_admin = window.localStorage.getItem('is_admin') || false;
    state.currentEvent = JSON.parse(window.localStorage.getItem('event')) || emptyEvent;
    var events = JSON.parse(window.localStorage.getItem('events')) || [];
    for (var v = 0; v < events.length; v += 1) {
      var event = events[v];
      state.id_to_event[event.id] = event;
    }
    // If token is invalid
    var token = window.localStorage.getItem('token') || '';
    if (token.length > 0 && token !== "null") {
      state.login_status = 2;
      state.token = token;
    }
    this.apiCall(APICALLS.CLIENT_STATUS, {}).then(data => {
      console.log("Client valid");
    }).catch(data => {
      if (data !== Constants.API_ERROR_TIMEOUT) {
        console.log("Client invalid");
        state.login_status = 0;
        state.token = '';
        state.name = '';
      } else {
        console.log("Server timeout");
        state.login_status = 1;
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
          reject(Constants.API_ERROR_TIMEOUT);
        }
      }).then(data => {
        try {
          if (data.status) {
            state.login_status = 2;
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
    return state.login_status > 0;
  }

  client_loginStatus() {
    return state.login_status;
  }

  client_name() {
    return state.name;
  }

  client_isAdmin() {
    return state.is_admin;
  }

  client_logout() {
    state.login_status = 0;
    state.name = '';
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('name');
    window.localStorage.removeItem('attendees');
    window.localStorage.removeItem('events');
    window.localStorage.removeItem('users');
    window.localStorage.removeItem('event');
    window.localStorage.removeItem('is_admin');
    window.localStorage.removeItem('actions');
  }

  client_login(username, password) {
    return new Promise((resolve, reject) => {
      console.log("logging in");
      this.apiCall(APICALLS.CLIENT_LOGIN, {
        username: username,
        password: password
      }).then(data => {
        resolve(data);
        state.login_status = 2;
        state.token = data.token;
        state.name = data.name;
        state.is_admin = data.is_admin;
        window.localStorage.setItem('token', data.token);
        window.localStorage.setItem('name', data.name);
        window.localStorage.setItem('is_admin', data.is_admin);
      }).catch(data => {
        THE_DATABASE.client_logout();
        reject(data);
      });
    });
  }

  client_currentEvent() {
    return state.currentEvent;
  }
  client_updateEventId(event_id) {
    var events = JSON.parse(window.localStorage.getItem('events')) || [];
    var event = events.find(x => x.id === event_id);
    if (event == null) {
      event = emptyEvent;
    }
    window.localStorage.setItem('event', JSON.stringify(event));
    if (state.currentEvent !== event) {
      window.localStorage.removeItem('attendees');
      this.event_getAttendees();
    }
    state.currentEvent = event;
  }

  client_createUser(params) {
    return this.apiCall(APICALLS.USER_CREATE, params);
  }

  client_deleteUser(params) {
    return this.apiCall(APICALLS.USER_DELETE, params);
  }

  client_createEvent(params) {
    return this.apiCall(APICALLS.EVENT_CREATE, params);
  }

  client_deleteEvent(params) {
    return this.apiCall(APICALLS.EVENT_DELETE, params);
  }

  client_updateUserEventAssignment(params) {
    return this.apiCall(APICALLS.USER_ASSIGNEVENT, params);
  }

  client_getUsers() {
    return new Promise((resolve, reject) => {
      this.apiCall(APICALLS.USER_LIST, {}).then(result => {
        var users = [];
        for (var v = 0; v < result.users.length; v += 1) {
          var atd = result.users[v];
          var user = new User(atd.name, atd.id, atd.is_admin, atd.events);
          users.push(user);
        }
        resolve(users);
        window.localStorage.setItem('users', JSON.stringify(users));
      }).catch(data => {
        reject(JSON.parse(window.localStorage.getItem('users')) || []);
      });
    });
  }

  user_getEvents() {
    return new Promise((resolve, reject) => {
      this.apiCall(APICALLS.EVENT_LIST, {}).then(result => {
        var events = [emptyEvent];
        for (var v = 0; v < result.events.length; v += 1) {
          var atd = result.events[v];
          var event = new Event(atd.name, atd.id);
          state.id_to_event[event.id] = event;
          events.push(event);
        }
        resolve(events);
        window.localStorage.setItem('events', JSON.stringify(events));
      }).catch(data => {
        reject(JSON.parse(window.localStorage.getItem('events')) || []);
      });
    });
  }

  // Returns attendees backup or not backedup
  event_getAttendees() {
    return new Promise((resolve, reject) => {
      this.apiCall(APICALLS.ATTENDEE_LIST, {
        'event_id': state.currentEvent.id
      }).then(result => {
        var searchResults = [];
        for (var v = 0; v < result.attendees.length; v += 1) {
          var atd = result.attendees[v];
          var attendee = new Attendee(atd.name, atd.scan_value, atd.email, atd.school, atd.checkin_status, atd.tags, atd.id, atd.notes);
          searchResults.push(attendee);
        }
        resolve(searchResults);
        window.localStorage.setItem('attendees', JSON.stringify(searchResults));
      }).catch(data => {
        reject(JSON.parse(window.localStorage.getItem('attendees')) || []);
      });
    });
  }
  event_addAttendees(listOfAttendees) {
    for (var v = 0; v < listOfAttendees.length; v += 1) {
      var attendee = listOfAttendees[v];
      var attendeeJSON = JSON.parse(JSON.stringify(attendee));
      attendeeJSON['action'] = "ADD";
      attendeeJSON['event_id'] = state.currentEvent.id;
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
    attendeeJSON['event_id'] = state.currentEvent.id;
    this.apiCall(APICALLS.ATTENDEE_ACTION, attendeeJSON).then(data => {
      console.log("SUCCESS");
    }).catch(data => {
      this.save_apiCall(APICALLS.ATTENDEE_ACTION, attendeeJSON);
    });
  }
  event_idToName(event_id) {
    if (state.id_to_event[event_id] !== null) {
      return state.id_to_event[event_id];
    }
    return emptyEvent;
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
