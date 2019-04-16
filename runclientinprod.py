# Requires that
# A) python runserver.py is started on port 5000
# B) yarn build succeeded

import http.server
import socketserver
import os
import requests
import cgi
import json


def cgiFieldStorageToDict(fieldStorage):
    """Get a plain dictionary, rather than the '.value' system used by the cgi module."""
    params = {}
    for key in fieldStorage.keys():
        params[key] = fieldStorage[key].value
    return params

PORT = 3000

web_dir = os.path.join(os.path.dirname(__file__), 'client/build/')
os.chdir(web_dir)


class MyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST',
                     'CONTENT_TYPE': self.headers['Content-Type'],
                     })
        r = requests.post(url='http://localhost:5000' +
                          self.path, data=cgiFieldStorageToDict(form))
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(r.json()).encode('utf_8'))

class Server(socketserver.TCPServer):
    allow_reuse_address = True


httpd = Server(("", PORT), MyRequestHandler)
print("Serving at port", PORT)
httpd.serve_forever()
