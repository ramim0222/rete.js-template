<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Laravel + Rete.js</title>

    @livewireStyles
    <style>
        html,
        body,
        #editor {
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
        .rete-node .input-control {
            margin-top: 10px;
        }

    </style>

</head>

<body>

    @yield('content')

    @livewireScripts
    @stack('scripts')
</body>

</html>
