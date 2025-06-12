<!DOCTYPE html>
<html>
<head>
  <title>Rete.js Editor</title>
  <style>
    html, body, #editor {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    #info {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      color: #9f7b00;
      text-align: center;
      margin: 1em;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div id="info">Drag the unconnected node onto the connection between nodes</div>
  <div id="editor"></div>

  @vite('resources/js/rete/main.js')
</body>
</html>
