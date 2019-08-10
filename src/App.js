import React, { Component } from 'react';
import logo from './logo_sm_white.svg';
import './App.css';

const fs = window.require('fs');
const electron = window.require('electron');
const path = require('path');
const os = require('os');

const app = electron.remote.app;
const { dialog } = electron.remote;
const destination = window.navigator.userAgent.indexOf("Windows NT") != -1 ? app.getAppPath() + '\\upload' : path.join(app.getAppPath(), 'upload');

class App extends Component {
  constructor(props) {
    super(props);
    this.pdfView = {
      width: '600px',
      height: '680px'
    };

    this.state = {
      active: false
    };

    this.enablePlugin = "true";
    this.filePath = "";
    this.selectedFile = "";
    this.listFiles = this.listFiles.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.showFile = this.showFile.bind(this);
  }

  componentDidMount() {
    this.listFiles();
    var self = this;

    var div = document.getElementById('pdf-view');
    var pdfView = '<webview id="file-box" src="" plugins={this.props.enablePlugin} nodeIntegration={this.props.enablePlugin} style="width: 500px; height:650px;"></webview>';
    div.innerHTML = pdfView;

    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

  }

  uploadFile = function () {
    var self = this;
    dialog.showOpenDialog(function (filePaths) {
      if (filePaths === undefined) {
        return;
      }

      var filePath = path.normalize(filePaths[0]);
      var filename = self.getFileName(filePath);

      try {
        console.log('Loaded file:' + filePath)
        fs.readFile(filePath, (err, data) => {
          if (err) throw err;
          fs.writeFileSync(path.join(destination, filename), data, 'binary');
          self.listFiles();
        });

      } catch (err) {
        console.log('Error reading the file: ' + JSON.stringify(err));
      }
    });
  }

  getFileName = function (path) {
    var name = "";
    if (window.navigator.userAgent.indexOf("Windows NT") != -1) {
      var parts = path.split('\\');
      name = parts[parts.length - 1];
    } else {
      name = path.basename(path);
    }
    return name;
  }

  listFiles = function () {
    var self = this;
    var div = document.getElementById('file-list');
    div.innerHTML = "";
    fs.readdir(destination, function (err, dir) {

      if (dir != null) {
        for (var i = 0, l = dir.length; i < l; i++) {
          var filename = dir[i];

          var filepath = path.join(destination, filename);

          var name = filename.split('.pdf')[0];
          var element = '<div className="form-group"><label className="control-label" style="lineheight:5;" id=' + filepath.replace(" ", "_") + '>' + name + '</label></div>';

          div.innerHTML += element;
        }

        setTimeout(() => {
          var labels = document.getElementsByTagName('label');
          for (var i = 0; i < labels.length; i++) {
            labels[i].addEventListener("click", function (event) {
              self.showFile(event);
            });
          }
        }, 2000);
      }

    });


  }

  showFile = function (event) {
    var self = this;
    self.filePath = event.target.attributes["id"].value;
    var data = fs.readFileSync(self.filePath, { encoding: 'base64' });
    self.selectedFile = path.basename(self.filePath);
    var box = document.getElementById('file-box');
    box.setAttribute("src", "data:application/pdf;base64," + data);

    self.setState({ active: !this.state.active });
  }

  render() {
    return (
      <div className="App">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-sm-4">
              <div id="file-list"></div>
              <input type="button" id="load" value="Upload Files" onClick={this.uploadFile} />

            </div>
            <div className="col-sm-8">
              <div className="form-group">
                <label className="control-label">{this.props.selectedFile}</label>
              </div>
              <div className="form-group" id="pdf-view"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
