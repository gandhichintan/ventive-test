import React, { Component } from 'react';
import logo from './logo_sm_white.svg';
import './App.css';

const fs = window.require('fs');
const electron = window.require('electron');
const app = electron.remote.app;
const { dialog } = electron.remote;
const destination = app.getAppPath() + '\\upload';

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
    var pdfView = '<webview id="file-box" src="" plugins={this.props.enablePlugin} style="width: 500px; height:650px;"></webview>';
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

      var filePath = filePaths[0];
      var source = filePath.split('\\');
      var filename = source[source.length - 1]

      try {
        console.log('Loaded file:' + filePath)
        fs.readFile(filePath, (err, data) => {
          if (err) throw err;
          fs.writeFileSync(destination + '\\' + filename, data, 'binary');
          self.listFiles();
        });

      } catch (err) {
        console.log('Error reading the file: ' + JSON.stringify(err));
      }
    });
  }

  listFiles = function () {
    var self = this;
    var div = document.getElementById('file-list');
    div.innerHTML = "";
    fs.readdir(destination, function (err, dir) {

      if (dir != null) {
        for (var i = 0, l = dir.length; i < l; i++) {
          var filename = dir[i];

          var filepath = destination + '\\' + filename;

          var name = filename.split('.pdf')[0];
          var element = '<div className="form-group"><label className="control-label" id=' + filepath + '>' + name + '</label></div>';

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

    var source = self.filePath.split('\\');
    self.selectedFile = source[source.length - 1]
    var box = document.getElementById('file-box');
    box.setAttribute("src", self.filePath);

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
